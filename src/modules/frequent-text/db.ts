import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'frequent-text'
const DB_VERSION = 1

const db = new Dexie(DB_NAME) as Dexie & {
  texts: EntityTable<FrequentText.TableText, 'id'>
}

db.version(DB_VERSION).stores({
  texts: '++id, name, updateTime'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadTextList(): Promise<FrequentText.TextItem[]> {
  return db.texts.orderBy('updateTime').reverse().toArray()
}

export async function addText(name: string, content: string): Promise<number> {
  return db.texts.add({
    name,
    content,
    updateTime: Date.now()
  } as FrequentText.TableText)
}

export async function deleteText(id: number): Promise<void> {
  await db.texts.delete(id)
}

export async function updateText(
  id: number,
  data: Partial<Pick<FrequentText.TableText, 'name' | 'content'>>
): Promise<void> {
  await db.texts.update(id, { ...data, updateTime: Date.now() })
}

export async function textNameExists(name: string): Promise<boolean> {
  const count = await db.texts.where('name').equals(name).count()
  return count > 0
}

export { db }
