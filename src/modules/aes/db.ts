import Dexie, { type EntityTable } from 'dexie'

import { encrypt, decrypt } from '@/lib/aes'

const DB_NAME = 'aes'
const DB_VERSION = 1

const AES_KEY_ROW_ID = 1 as const
const MODE_ROW_ID = 2 as const

const db = new Dexie(DB_NAME) as Dexie & {
  kv: EntityTable<Aes.TableKV, 'id'>
}

db.version(DB_VERSION).stores({
  kv: 'id'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function storeAesKey(val: string) {
  await db.kv.put({ id: AES_KEY_ROW_ID, val: encrypt(val, 'aes') })
}

export async function retrieveAesKey(): Promise<string> {
  const row = await db.kv.get(AES_KEY_ROW_ID)
  return row?.val ? decrypt(row.val, 'aes') : ''
}

export async function storeMode(val: Aes.Mode) {
  await db.kv.put({ id: MODE_ROW_ID, val })
}

export async function retrieveMode(): Promise<string> {
  const row = await db.kv.get(MODE_ROW_ID)
  return row?.val || ''
}
