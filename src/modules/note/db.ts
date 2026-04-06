import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'note'
const DB_VERSION = 1

const db = new Dexie(DB_NAME) as Dexie & {
  notes: EntityTable<Note.TableNote, 'id'>
}

db.version(DB_VERSION).stores({
  notes: '++id, title, group'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadNoteList(): Promise<Note.NoteListItem[]> {
  return db.notes
    .reverse()
    .toArray(rows =>
      rows.map(({ id, title, group }) => ({ id, title, group: group ?? '' }))
    )
}

export async function getNote(id: number): Promise<Note.NoteItem | undefined> {
  return db.notes.get(id)
}

export async function addNote(
  title: string,
  group: string,
  content: string
): Promise<number> {
  return db.notes.add({ title, group, content } as Note.TableNote)
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id)
}

export async function updateNote(
  id: number,
  data: Partial<Pick<Note.TableNote, 'title' | 'group' | 'content'>>
): Promise<void> {
  await db.notes.update(id, data)
}
