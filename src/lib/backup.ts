import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import Dexie from 'dexie'
import { exportDB, importDB } from 'dexie-export-import'
import { unzipSync, zipSync, type Zippable } from 'fflate'

ed.hashes.sha512 = sha512

export class BackupRequestError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BackupRequestError'
    this.status = status
  }
}

async function parseApiError(res: Response): Promise<BackupRequestError> {
  let message = res.statusText || '请求失败'
  try {
    const json = await res.json()
    if (typeof json?.message === 'string' && json.message.length > 0) {
      message = json.message
    }
  } catch {
    // keep statusText fallback
  }
  return new BackupRequestError(res.status, message)
}

export async function syncUp(
  syncId: string,
  version: number,
  privateKeyHex: string,
  dataKeyHex: string,
  force = false,
  enabledModules?: string[]
): Promise<number> {
  const privateKey = hexToBytes(privateKeyHex)
  const dbModules = import.meta.glob('../modules/*/db.ts', {
    eager: true,
    import: 'db'
  }) as Record<string, Dexie>

  const databases: Record<string, Dexie> = {}
  for (const [path, db] of Object.entries(dbModules)) {
    const name = path.match(/modules\/([^/]+)\/db\.ts$/)?.[1]
    if (name && (!enabledModules || enabledModules.includes(name))) {
      databases[name] = db
    }
  }

  const zippedBytes = await packDbsToZip(databases)
  const { encryptedBytes } = await encryptPackage(zippedBytes, dataKeyHex)

  const signature = bytesToHex(ed.sign(encryptedBytes, privateKey))

  const formData = new FormData()
  formData.append('sync_id', syncId)
  formData.append('version', String(version))
  formData.append('signature', signature)
  formData.append('file', new Blob([encryptedBytes.buffer as ArrayBuffer]))

  if (force) {
    formData.append('force', 'true')
  }

  const res = await fetch('/api/backup-push', {
    method: 'POST',
    body: formData
  })
  if (!res.ok) {
    throw await parseApiError(res)
  }
  const json = await res.json().catch(() => null)
  if (!json || json.code !== 0) {
    throw new Error(json?.message || '上传失败')
  }

  return json.data.version
}

export async function syncDown(
  syncId: string,
  privateKeyHex: string,
  dataKeyHex: string,
  enabledModules?: string[]
): Promise<number> {
  const privateKey = hexToBytes(privateKeyHex)
  const signature = bytesToHex(
    ed.sign(new TextEncoder().encode(syncId), privateKey)
  )

  const res = await fetch('/api/backup-pull', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sync_id: syncId,
      signature
    })
  })

  if (!res.ok) {
    throw await parseApiError(res)
  }

  const serverVersion = Number(res.headers.get('x-backup-version') || '0')
  const encryptedBytes = new Uint8Array(await res.arrayBuffer())
  const decryptedBytes = await decryptPackage(encryptedBytes, dataKeyHex)
  const ok = await unpackZipToDbs(decryptedBytes, enabledModules)
  if (!ok) {
    throw new Error('解压恢复数据失败')
  }

  return serverVersion
}

export async function packDbsToZip(
  dbs: Record<string, Dexie>
): Promise<Uint8Array> {
  const zipObj: Zippable = {}
  for (const [name, db] of Object.entries(dbs)) {
    const blob = await exportDB(db)
    const ab = await blob.arrayBuffer()
    zipObj[name] = new Uint8Array(ab)
  }

  const zippedBytes = zipSync(zipObj)
  return zippedBytes
}

export async function unpackZipToDbs(
  zippedBytes: Uint8Array,
  enabledModules?: string[]
): Promise<boolean> {
  try {
    const unzippedFiles = unzipSync(zippedBytes)

    for (const dbName of Object.keys(unzippedFiles)) {
      if (enabledModules && !enabledModules.includes(dbName)) {
        continue
      }
      const rawFileBytes = unzippedFiles[dbName]
      const dbBlob = new Blob([rawFileBytes], { type: 'application/json' })

      const shadowDbName = `${dbName}_shadow_temp`

      const shadowDb = await importDB(dbBlob, { name: shadowDbName })

      if (shadowDb.tables.length === 0) {
        await Dexie.delete(shadowDbName)
        return false
      }
      shadowDb.close()

      await Dexie.delete(dbName)

      const restoredDb = await importDB(dbBlob, { name: dbName })
      restoredDb.close()

      await Dexie.delete(shadowDbName)
    }
  } catch (e) {
    console.error('[unpackZipToDbs]', e)
    return false
  }
  return true
}

export async function encryptPackage(
  zippedBytes: Uint8Array,
  dataKeyHex: string
): Promise<{ encryptedBytes: Uint8Array; hash: string }> {
  const keyHashBytes = hexToBytes(dataKeyHex)

  const aesKey = await crypto.subtle.importKey(
    'raw',
    keyHashBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    zippedBytes as BufferSource
  )

  const finalEncryptedFileBytes = new Uint8Array(
    iv.length + ciphertextBuffer.byteLength
  )
  finalEncryptedFileBytes.set(iv, 0)
  finalEncryptedFileBytes.set(new Uint8Array(ciphertextBuffer), 12)

  const fileHashBuffer = await crypto.subtle.digest(
    'SHA-256',
    finalEncryptedFileBytes
  )
  const fileHashHex = bytesToHex(new Uint8Array(fileHashBuffer))

  return {
    encryptedBytes: finalEncryptedFileBytes,
    hash: fileHashHex
  }
}

export async function decryptPackage(
  encryptedBytes: Uint8Array,
  dataKeyHex: string
): Promise<Uint8Array> {
  const keyHashBytes = hexToBytes(dataKeyHex)

  const aesKey = await crypto.subtle.importKey(
    'raw',
    keyHashBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const iv = encryptedBytes.slice(0, 12)

  const ciphertext = encryptedBytes.slice(12)

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    ciphertext
  )

  return new Uint8Array(decryptedBuffer)
}
