import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'bookmark'
const DB_VERSION = 1

const db = new Dexie(DB_NAME) as Dexie & {
  folders: EntityTable<Bookmark.TableFolder, 'id'>
  bookmarks: EntityTable<Bookmark.TableItem, 'id'>
}

db.version(DB_VERSION).stores({
  folders: '++id, &name, sortOrder',
  bookmarks: '++id, folderId, sortOrder'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadFolders(): Promise<Bookmark.Folder[]> {
  return db.folders.orderBy('sortOrder').toArray()
}

export async function addFolder(name: string): Promise<number> {
  const last = await db.folders.orderBy('sortOrder').last()
  return db.folders.add({
    name,
    sortOrder: last ? last.sortOrder + 1 : 0
  } as Bookmark.TableFolder)
}

export async function updateFolder(id: number, name: string): Promise<void> {
  await db.folders.update(id, { name })
}

export async function deleteFolder(id: number): Promise<void> {
  await db.folders.delete(id)
  await db.bookmarks.where('folderId').equals(id).delete()
}

export async function folderNameExists(
  name: string,
  excludeId?: number
): Promise<boolean> {
  const folder = await db.folders.where('name').equals(name).first()
  if (!folder) return false
  if (excludeId != null) return folder.id !== excludeId
  return true
}

export async function reorderFolders(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.folders, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.folders.update(orderedIds[i], { sortOrder: i })
    }
  })
}

async function nextSortOrder(folderId: number | null): Promise<number> {
  if (folderId == null) {
    const all = await db.bookmarks.orderBy('sortOrder').toArray()
    const root = all.filter(item => item.folderId == null)
    return root.length ? root[root.length - 1].sortOrder + 1 : 0
  }
  const items = await db.bookmarks
    .where('folderId')
    .equals(folderId)
    .sortBy('sortOrder')
  return items.length ? items[items.length - 1].sortOrder + 1 : 0
}

export async function loadBookmarks(
  folderId: number | null
): Promise<Bookmark.Item[]> {
  if (folderId == null) {
    const all = await db.bookmarks.orderBy('sortOrder').toArray()
    return all.filter(item => item.folderId == null)
  }
  return db.bookmarks.where('folderId').equals(folderId).sortBy('sortOrder')
}

export async function bookmarkNameExists(
  folderId: number | null,
  name: string,
  excludeId?: number
): Promise<boolean> {
  const items = await loadBookmarks(folderId)
  const matched = items.find(item => item.name === name)
  if (!matched) return false
  if (excludeId != null) return matched.id !== excludeId
  return true
}

export async function addBookmark(
  data: Pick<Bookmark.Item, 'folderId' | 'name' | 'url'>
): Promise<number> {
  const sortOrder = await nextSortOrder(data.folderId)
  return db.bookmarks.add({ ...data, sortOrder } as Bookmark.TableItem)
}

export async function updateBookmark(
  id: number,
  data: Partial<Pick<Bookmark.Item, 'name' | 'url'>>
): Promise<void> {
  await db.bookmarks.update(id, data)
}

export async function deleteBookmark(id: number): Promise<void> {
  await db.bookmarks.delete(id)
}

export async function reorderBookmarks(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.bookmarks, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.bookmarks.update(orderedIds[i], { sortOrder: i })
    }
  })
}

export function normalizeUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(withProtocol)
    if (!url.hostname.includes('.')) return null
    return url.href
  } catch {
    return null
  }
}

export function getFaviconUrl(url: string): string | null {
  try {
    return `${new URL(url).origin}/favicon.ico`
  } catch {
    return null
  }
}

export function getHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export { db }
