import 'fake-indexeddb/auto'
import Dexie, { type EntityTable } from 'dexie'
import { unzipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { packDbsToZip, unpackZipToDbs } from '@/lib/sync'

type TestItem = { id: number; name: string; value: string }

const TEST_DB_PREFIX = 'test_sync'

function createTestDb(
  name: string
): Dexie & { items: EntityTable<TestItem, 'id'> } {
  const db = new Dexie(name) as Dexie & {
    items: EntityTable<TestItem, 'id'>
  }
  db.version(1).stores({ items: '++id, name' })
  return db
}

async function deleteDb(name: string) {
  try {
    await Dexie.delete(name)
  } catch {
    // ignore - database may not exist
  }
}

async function deleteAllTestDbs() {
  const names = await Dexie.getDatabaseNames()
  for (const name of names) {
    if (name.startsWith(TEST_DB_PREFIX)) await deleteDb(name)
  }
}

async function readAll(db: Dexie): Promise<TestItem[]> {
  return db.table('items').toArray()
}

describe('packageDbsToZip / unpackZipToDbs', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await deleteAllTestDbs()
  })

  afterEach(async () => {
    await deleteAllTestDbs()
    warnSpy.mockRestore()
  })

  it('produces a valid zip whose keys are the database names', async () => {
    const source = createTestDb(TEST_DB_PREFIX)
    await source.items.bulkAdd([
      { id: 1, name: 'alpha', value: 'A' },
      { id: 2, name: 'beta', value: 'B' }
    ])

    const zipped = await packDbsToZip({ [TEST_DB_PREFIX]: source })

    expect(zipped).toBeInstanceOf(Uint8Array)
    expect(zipped.length).toBeGreaterThan(0)

    const unzipped = unzipSync(zipped)
    expect(Object.keys(unzipped)).toEqual([TEST_DB_PREFIX])
  })

  it('round-trips a single database with data', async () => {
    const source = createTestDb(TEST_DB_PREFIX)
    await source.items.bulkAdd([
      { id: 1, name: 'alpha', value: 'A' },
      { id: 2, name: 'beta', value: 'B' },
      { id: 3, name: 'gamma', value: 'C' }
    ])
    const expected = await readAll(source)

    const zipped = await packDbsToZip({ [TEST_DB_PREFIX]: source })

    const ok = await unpackZipToDbs(zipped)
    expect(ok).toBe(true)

    const verify = createTestDb(TEST_DB_PREFIX)
    const actual = await readAll(verify)
    expect(actual).toEqual(expected)
  })

  it('round-trips multiple databases independently', async () => {
    const dbA = createTestDb(`${TEST_DB_PREFIX}_a`)
    const dbB = createTestDb(`${TEST_DB_PREFIX}_b`)
    await dbA.items.bulkAdd([
      { id: 1, name: 'a1', value: 'A1' },
      { id: 2, name: 'a2', value: 'A2' }
    ])
    await dbB.items.bulkAdd([{ id: 1, name: 'b1', value: 'B1' }])
    const expectedA = await readAll(dbA)
    const expectedB = await readAll(dbB)

    const zipped = await packDbsToZip({
      [`${TEST_DB_PREFIX}_a`]: dbA,
      [`${TEST_DB_PREFIX}_b`]: dbB
    })

    const ok = await unpackZipToDbs(zipped)
    expect(ok).toBe(true)

    const verifyA = createTestDb(`${TEST_DB_PREFIX}_a`)
    const verifyB = createTestDb(`${TEST_DB_PREFIX}_b`)
    expect(await readAll(verifyA)).toEqual(expectedA)
    expect(await readAll(verifyB)).toEqual(expectedB)
  })

  it('round-trips a database with no data', async () => {
    const source = createTestDb(TEST_DB_PREFIX)
    const expected = await readAll(source)
    expect(expected).toEqual([])

    const zipped = await packDbsToZip({ [TEST_DB_PREFIX]: source })

    const ok = await unpackZipToDbs(zipped)
    expect(ok).toBe(true)

    const verify = createTestDb(TEST_DB_PREFIX)
    expect(await readAll(verify)).toEqual([])
  })

  it('cleans up the shadow temp database after unpacking', async () => {
    const source = createTestDb(TEST_DB_PREFIX)
    await source.items.add({ id: 1, name: 'alpha', value: 'A' })

    const zipped = await packDbsToZip({ [TEST_DB_PREFIX]: source })
    const ok = await unpackZipToDbs(zipped)
    expect(ok).toBe(true)

    const names = await Dexie.getDatabaseNames()
    expect(names).not.toContain(`${TEST_DB_PREFIX}_shadow_temp`)
    expect(names).toContain(TEST_DB_PREFIX)
  })

  it('returns false for invalid zip data', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const garbage = new Uint8Array([1, 2, 3, 4, 5])
      const ok = await unpackZipToDbs(garbage)
      expect(ok).toBe(false)
    } finally {
      errorSpy.mockRestore()
    }
  })
})
