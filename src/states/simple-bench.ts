import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_SYNC_CONFIG = 'simple-bench:sync-config'
const STORAGE_KEY_SYNC_CONFIG_ENC = 'simple-bench:sync-config-enc'
const STORAGE_KEY_VERSION = 'simple-bench:version'
const STORAGE_KEY_UNSYNCED_CHANGES = 'simple-bench:unsynced-changes'

const LEGACY_SYNC_KEYS = [
  'simple-bench:sync-id',
  'simple-bench:data-key',
  'simple-bench:private-key',
  'simple-bench:public-key'
]

export type SyncAccountConfig = {
  syncId: string
  dataKey: string
  privateKey: string
  publicKey: string
}

export type SyncAccountState =
  | { status: 'unset'; config: null }
  | { status: 'ok'; config: SyncAccountConfig }
  | { status: 'corrupt'; config: null }

function isSyncAccountConfig(value: unknown): value is SyncAccountConfig {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.syncId === 'string' &&
    v.syncId.length > 0 &&
    typeof v.dataKey === 'string' &&
    v.dataKey.length > 0 &&
    typeof v.privateKey === 'string' &&
    v.privateKey.length > 0 &&
    typeof v.publicKey === 'string' &&
    v.publicKey.length > 0
  )
}

function parseSyncAccount(raw: string): SyncAccountState {
  if (typeof window === 'undefined') {
    return { status: 'unset', config: null }
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.status === 'ok' && isSyncAccountConfig(parsed.config)) {
      return { status: 'ok', config: parsed.config }
    }
    if (parsed?.status === 'unset') {
      return { status: 'unset', config: null }
    }
    return { status: 'corrupt', config: null }
  } catch {
    return { status: 'corrupt', config: null }
  }
}

function isServer(): boolean {
  return typeof window === 'undefined'
}

function safeGetItem(key: string): string | null {
  try {
    if (isServer()) return null
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (isServer()) return
    window.localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (isServer()) return
    window.localStorage.removeItem(key)
  } catch {
    // ignore storage errors
  }
}

function getOrCreateEncryptionKey(): string {
  let key = safeGetItem(STORAGE_KEY_SYNC_CONFIG_ENC)
  if (!key) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    key = bytesToHex(bytes)
    safeSetItem(STORAGE_KEY_SYNC_CONFIG_ENC, key)
  }
  return key
}

function syncEncrypt(plaintext: string, keyHex: string): string {
  const key = hexToBytes(keyHex)
  const plainBytes = new TextEncoder().encode(plaintext)
  const iv = crypto.getRandomValues(new Uint8Array(8))
  const result = new Uint8Array(iv.length + plainBytes.length)
  result.set(iv, 0)

  let offset = 0
  let counter = 0
  while (offset < plainBytes.length) {
    const counterBytes = new Uint8Array(8)
    new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counter), true)
    const ctx = hmac.create(sha256, key)
    ctx.update(iv)
    ctx.update(counterBytes)
    const keystream = ctx.digest()
    const chunkLen = Math.min(keystream.length, plainBytes.length - offset)
    for (let i = 0; i < chunkLen; i++) {
      result[iv.length + offset + i] = plainBytes[offset + i] ^ keystream[i]
    }
    offset += chunkLen
    counter++
  }

  return JSON.stringify({ enc: true, data: bytesToHex(result) })
}

function syncDecrypt(encryptedStr: string, keyHex: string): string {
  const parsed = JSON.parse(encryptedStr)
  if (!parsed?.enc) throw new Error('Not encrypted')
  const key = hexToBytes(keyHex)
  const encrypted = hexToBytes(parsed.data)
  const iv = encrypted.slice(0, 8)
  const cipherBytes = encrypted.slice(8)
  const result = new Uint8Array(cipherBytes.length)

  let offset = 0
  let counter = 0
  while (offset < cipherBytes.length) {
    const counterBytes = new Uint8Array(8)
    new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counter), true)
    const ctx = hmac.create(sha256, key)
    ctx.update(iv)
    ctx.update(counterBytes)
    const keystream = ctx.digest()
    const chunkLen = Math.min(keystream.length, cipherBytes.length - offset)
    for (let i = 0; i < chunkLen; i++) {
      result[offset + i] = cipherBytes[offset + i] ^ keystream[i]
    }
    offset += chunkLen
    counter++
  }

  return new TextDecoder().decode(result)
}

function migrateLegacySyncConfig(): SyncAccountState | null {
  const values = LEGACY_SYNC_KEYS.map(k => safeGetItem(k) ?? '')
  const [syncId, dataKey, privateKey, publicKey] = values

  if (!syncId || !dataKey || !privateKey || !publicKey) {
    return null
  }

  const state: SyncAccountState = {
    status: 'ok',
    config: { syncId, dataKey, privateKey, publicKey }
  }

  const keyHex = getOrCreateEncryptionKey()
  safeSetItem(
    STORAGE_KEY_SYNC_CONFIG,
    syncEncrypt(JSON.stringify(state), keyHex)
  )
  for (const key of LEGACY_SYNC_KEYS) {
    safeRemoveItem(key)
  }

  return state
}

const syncConfigStorage = {
  getItem: (_key: string, initialValue: SyncAccountState): SyncAccountState => {
    const raw = safeGetItem(STORAGE_KEY_SYNC_CONFIG)
    if (raw != null) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.enc) {
          const keyHex = getOrCreateEncryptionKey()
          const decrypted = syncDecrypt(raw, keyHex)
          return parseSyncAccount(decrypted)
        }
        return parseSyncAccount(raw)
      } catch {
        return { status: 'corrupt', config: null }
      }
    }

    const migrated = migrateLegacySyncConfig()
    return migrated ?? initialValue
  },
  setItem: (_key: string, value: SyncAccountState): void => {
    const keyHex = getOrCreateEncryptionKey()
    safeSetItem(
      STORAGE_KEY_SYNC_CONFIG,
      syncEncrypt(JSON.stringify(value), keyHex)
    )
  },
  removeItem: (_key: string): void => {
    safeRemoveItem(STORAGE_KEY_SYNC_CONFIG)
  }
}

export const syncConfigAtom = atomWithStorage<SyncAccountState>(
  STORAGE_KEY_SYNC_CONFIG,
  { status: 'unset', config: null },
  syncConfigStorage,
  { getOnInit: true }
)

export const syncEnabledAtom = atom<boolean>(
  get => get(syncConfigAtom).status === 'ok'
)

export const syncCorruptAtom = atom<boolean>(
  get => get(syncConfigAtom).status === 'corrupt'
)

export const syncAccountIssueAtom = atom('')

export const syncHasNewerVersionAtom = atom(false)

export const versionAtom = atomWithStorage<number>(
  STORAGE_KEY_VERSION,
  1,
  undefined,
  { getOnInit: true }
)

export const hasUnsyncedChangesAtom = atomWithStorage<boolean>(
  STORAGE_KEY_UNSYNCED_CHANGES,
  false,
  undefined,
  { getOnInit: true }
)
