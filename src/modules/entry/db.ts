import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'entry'
const DB_VERSION = 2

const db = new Dexie(DB_NAME) as Dexie & {
  spaces: EntityTable<Entry.TableSpace, 'id'>
  entries: EntityTable<Entry.TableEntry, 'id'>
}

db.version(DB_VERSION)
  .stores({
    spaces: '++id, &name, sortOrder',
    entries: '++id, spaceId, name'
  })
  .upgrade(async tx => {
    await tx
      .table('entries')
      .toCollection()
      .modify(entry => {
        delete entry.sortOrder
      })
  })

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadSpaces(): Promise<Entry.Space[]> {
  return db.spaces.orderBy('sortOrder').toArray()
}

export async function getSpace(id: number): Promise<Entry.Space | undefined> {
  return db.spaces.get(id)
}

export async function addSpace(
  data: Pick<Entry.Space, 'name' | 'description'>
): Promise<number> {
  const last = await db.spaces.orderBy('sortOrder').last()
  return db.spaces.add({
    ...data,
    sortOrder: last ? last.sortOrder + 1 : 0
  } as Entry.TableSpace)
}

export async function updateSpace(
  id: number,
  data: Partial<Pick<Entry.Space, 'name' | 'description'>>
): Promise<void> {
  await db.spaces.update(id, data)
}

export async function deleteSpace(id: number): Promise<void> {
  await db.spaces.delete(id)
  await db.entries.where('spaceId').equals(id).delete()
}

export async function spaceNameExists(
  name: string,
  excludeId?: number
): Promise<boolean> {
  if (excludeId != null) {
    const space = await db.spaces.where('name').equals(name).first()
    if (!space) return false
    return space.id !== excludeId
  }
  const count = await db.spaces.where('name').equals(name).count()
  return count > 0
}

export async function reorderSpaces(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.spaces, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.spaces.update(orderedIds[i], { sortOrder: i })
    }
  })
}

export async function loadEntries(spaceId: number): Promise<Entry.EntryItem[]> {
  return db.entries.where('spaceId').equals(spaceId).sortBy('name')
}

export async function getEntryBySpaceAndName(
  spaceId: number,
  name: string
): Promise<Entry.EntryItem | undefined> {
  const entries = await loadEntries(spaceId)
  return entries.find(entry => entry.name === name)
}

export async function addEntry(
  data: Pick<Entry.EntryItem, 'spaceId' | 'name' | 'description' | 'category'>
): Promise<number> {
  return db.entries.add(data as Entry.TableEntry)
}

export async function updateEntry(
  id: number,
  data: Partial<Pick<Entry.EntryItem, 'name' | 'description' | 'category'>>
): Promise<void> {
  await db.entries.update(id, data)
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id)
}

export { db }
