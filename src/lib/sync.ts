import Dexie from 'dexie'
import { exportDB, importDB } from 'dexie-export-import'
import { zipSync, unzipSync, type Zippable } from 'fflate'

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// export function unnamed() {
//   const dbModules = import.meta.glob('../modules/*/db.ts', {
//     eager: true,
//     import: 'db'
//   }) as Record<string, Dexie>

//   const databases: Record<string, Dexie> = {}

//   for (const [path, db] of Object.entries(dbModules)) {
//     const name = path.match(/modules\/([^/]+)\/db\.ts$/)?.[1]
//     if (name) databases[name] = db
//   }
// }

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
  zippedBytes: Uint8Array
): Promise<boolean> {
  try {
    const unzippedFiles = unzipSync(zippedBytes)

    for (const dbName of Object.keys(unzippedFiles)) {
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
  mnemonicPhrase: string
): Promise<{ encryptedBytes: Uint8Array; hash: string }> {
  const encoder = new TextEncoder()

  const keyHashBytes = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(mnemonicPhrase)
  )

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
  const fileHashHex = arrayBufferToHex(fileHashBuffer)

  return {
    encryptedBytes: finalEncryptedFileBytes,
    hash: fileHashHex
  }
}

export async function decryptPackage(
  encryptedBytes: Uint8Array,
  mnemonicPhrase: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(mnemonicPhrase)

  const keyHashBytes = await crypto.subtle.digest('SHA-256', passwordBytes)

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
