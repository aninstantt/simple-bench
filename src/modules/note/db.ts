import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'note'
const DB_VERSION = 2

const db = new Dexie(DB_NAME) as Dexie & {
  notes: EntityTable<Note.TableNote, 'id'>
}

db.version(DB_VERSION)
  .stores({
    notes: '++id, title, group, updateTime'
  })
  .upgrade(async tx => {
    const notes = tx.table('notes') as EntityTable<Note.TableNote, 'id'>
    const rows = await notes.toArray()
    if (rows.length === 0) return

    const base = Date.now() - rows.length
    const sortedById = [...rows].sort((a, b) => a.id - b.id)

    await Promise.all(
      sortedById.map((row, index) =>
        notes.update(row.id, {
          updateTime:
            typeof row.updateTime === 'number' ? row.updateTime : base + index
        })
      )
    )
  })

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadNoteList(): Promise<Note.NoteListItem[]> {
  return db.notes
    .orderBy('updateTime')
    .reverse()
    .toArray(rows =>
      rows.map(({ id, title, group, updateTime }) => ({
        id,
        title,
        group: group ?? '',
        updateTime
      }))
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
  return db.notes.add({
    title,
    group,
    content,
    updateTime: Date.now()
  } as Note.TableNote)
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id)
}

export async function updateNote(
  id: number,
  data: Partial<Pick<Note.TableNote, 'title' | 'group' | 'content'>>
): Promise<void> {
  await db.notes.update(id, { ...data, updateTime: Date.now() })
}
