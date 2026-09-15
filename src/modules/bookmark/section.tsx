import {
  Check,
  Folder,
  FolderPlus,
  Globe,
  Pencil,
  PlusIcon,
  Save,
  Trash2,
  Undo2,
  X
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { DragHandle, SortableList } from '@/components/custom/drag-sort-list'
import { EmptyState } from '@/components/custom/empty-state'
import { WithLoading } from '@/components/custom/with-loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  addBookmark,
  addFolder,
  bookmarkNameExists,
  deleteBookmark,
  deleteFolder,
  folderNameExists,
  getFaviconUrl,
  loadBookmarks,
  loadFolders,
  normalizeUrl,
  reorderBookmarks,
  reorderFolders,
  updateBookmark,
  updateFolder
} from './db'

type BookmarkSectionProps = {
  folderId: number | null
  onSelectFolder: (folderId: number | null) => void
}

type BookmarkFormState = {
  name: string
  url: string
}

type PendingDelete =
  | { kind: 'bookmark'; id: number; name: string }
  | { kind: 'folder'; id: number; name: string }

const EMPTY_BOOKMARK_FORM: BookmarkFormState = {
  name: '',
  url: ''
}

const GRID_CLASS = 'grid grid-cols-3 gap-2.5 space-y-0 sm:grid-cols-4'

const TILE_CLASS =
  'flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-100/80 px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200/70 hover:shadow-[0_10px_30px_-18px_rgba(54,69,79,0.5)] focus-visible:ring-2 focus-visible:ring-[#4a6fa5]/40 focus-visible:outline-none dark:bg-zinc-800/60 dark:hover:bg-zinc-700/70 dark:hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]'

const ICON_BOX_CLASS =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-zinc-700/50 dark:shadow-none'

const TILE_ACTION_CLASS =
  'flex size-5 items-center justify-center text-zinc-300 transition-colors hover:text-zinc-500 max-sm:size-6 max-sm:text-zinc-400 dark:text-zinc-600 dark:hover:text-zinc-400 dark:max-sm:text-zinc-500'

function Favicon({
  url,
  className = 'size-5'
}: {
  url: string
  className?: string
}) {
  const src = getFaviconUrl(url)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <Globe className={cn(className, 'text-zinc-400 dark:text-zinc-500')} />
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn(className, 'rounded-md object-contain')}
      onError={() => setFailedSrc(src)}
    />
  )
}

type TileShellProps = {
  dragHandleRef: (element: Element | null) => void
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
}

function TileShell({
  dragHandleRef,
  onEdit,
  onDelete,
  children
}: TileShellProps) {
  return (
    <div className="group relative h-full">
      {children}
      <div className="pointer-events-none absolute top-1 left-1 z-10 flex flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 max-sm:pointer-events-auto max-sm:opacity-100">
        <span className="flex size-5 items-center justify-center max-sm:size-6">
          <DragHandle dragHandleRef={dragHandleRef} />
        </span>
        <button
          type="button"
          aria-label="编辑"
          className={TILE_ACTION_CLASS}
          onClick={onEdit}
        >
          <Pencil className="size-3" />
        </button>
        <button
          type="button"
          aria-label="删除"
          className={TILE_ACTION_CLASS}
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  )
}

type BookmarkTileProps = {
  item: Bookmark.Item
  dragHandleRef: (element: Element | null) => void
  onEdit: () => void
  onDelete: () => void
}

function BookmarkTile({
  item,
  dragHandleRef,
  onEdit,
  onDelete
}: BookmarkTileProps) {
  return (
    <TileShell
      dragHandleRef={dragHandleRef}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        title={item.name}
        className={TILE_CLASS}
      >
        <span className={ICON_BOX_CLASS}>
          <Favicon url={item.url} className="size-6" />
        </span>
        <span className="w-full truncate text-xs font-medium text-zinc-600 dark:text-zinc-200">
          {item.name}
        </span>
      </a>
    </TileShell>
  )
}

type FolderTileProps = {
  folder: Bookmark.Folder
  dragHandleRef: (element: Element | null) => void
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

function FolderTile({
  folder,
  dragHandleRef,
  onOpen,
  onEdit,
  onDelete
}: FolderTileProps) {
  return (
    <TileShell
      dragHandleRef={dragHandleRef}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <button
        type="button"
        title={folder.name}
        onClick={onOpen}
        className={cn(TILE_CLASS, 'cursor-pointer')}
      >
        <span
          className={cn(
            ICON_BOX_CLASS,
            'bg-[#e6eef8] text-[#4a6fa5] dark:bg-[#4a6fa5]/20 dark:text-[#a9c3e3]'
          )}
        >
          <Folder className="size-5" />
        </span>
        <span className="w-full truncate text-xs font-medium text-zinc-600 dark:text-zinc-200">
          {folder.name}
        </span>
      </button>
    </TileShell>
  )
}

export function BookmarkSection({
  folderId,
  onSelectFolder
}: BookmarkSectionProps) {
  const [hydrated, setHydrated] = useState(false)
  const [folders, setFolders] = useState<Bookmark.Folder[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark.Item[]>([])
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [folderEditId, setFolderEditId] = useState<number | null>(null)
  const [folderName, setFolderName] = useState('')

  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [bookmarkEditId, setBookmarkEditId] = useState<number | null>(null)
  const [bookmarkForm, setBookmarkForm] =
    useState<BookmarkFormState>(EMPTY_BOOKMARK_FORM)

  const activeFolder = folders.find(folder => folder.id === folderId)

  const refresh = async () => {
    const [folderList, bookmarkList] = await Promise.all([
      loadFolders(),
      loadBookmarks(folderId)
    ])
    setFolders(folderList)
    setBookmarks(bookmarkList)
  }

  const openCreateFolder = () => {
    setFolderEditId(null)
    setFolderName('')
    setFolderDialogOpen(true)
  }

  const openEditFolder = (folder: Bookmark.Folder) => {
    setFolderEditId(folder.id ?? null)
    setFolderName(folder.name)
    setFolderDialogOpen(true)
  }

  const handleConfirmFolder = async () => {
    const name = folderName.trim()
    if (!name) return
    if (await folderNameExists(name, folderEditId ?? undefined)) {
      toast.error('目录名称已存在')
      return
    }
    if (folderEditId == null) {
      await addFolder(name)
    } else {
      await updateFolder(folderEditId, name)
    }
    await refresh()
    setFolderDialogOpen(false)
  }

  const requestDeleteFolder = (folder: Bookmark.Folder) => {
    if (!folder.id) return
    setPendingDelete({ kind: 'folder', id: folder.id, name: folder.name })
  }

  const handleReorderFolders = async (ordered: Bookmark.Folder[]) => {
    setFolders(ordered)
    await reorderFolders(ordered.map(folder => folder.id!))
  }

  const openCreateBookmark = () => {
    setBookmarkEditId(null)
    setBookmarkForm(EMPTY_BOOKMARK_FORM)
    setBookmarkDialogOpen(true)
  }

  const openEditBookmark = (item: Bookmark.Item) => {
    setBookmarkEditId(item.id ?? null)
    setBookmarkForm({ name: item.name, url: item.url })
    setBookmarkDialogOpen(true)
  }

  const handleConfirmBookmark = async () => {
    const name = bookmarkForm.name.trim()
    const url = normalizeUrl(bookmarkForm.url)
    if (!name) return
    if (!url) {
      toast.error('请输入有效的链接')
      return
    }
    if (await bookmarkNameExists(folderId, name, bookmarkEditId ?? undefined)) {
      toast.error('书签名称已存在')
      return
    }
    if (bookmarkEditId == null) {
      await addBookmark({ folderId, name, url })
    } else {
      await updateBookmark(bookmarkEditId, { name, url })
    }
    await refresh()
    setBookmarkDialogOpen(false)
  }

  const requestDeleteBookmark = (item: Bookmark.Item) => {
    if (!item.id) return
    setPendingDelete({ kind: 'bookmark', id: item.id, name: item.name })
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    if (pendingDelete.kind === 'folder') {
      const deletedId = pendingDelete.id
      setPendingDelete(null)
      await deleteFolder(deletedId)
      if (folderId === deletedId) {
        onSelectFolder(null)
      } else {
        await refresh()
      }
      return
    }
    const bookmarkId = pendingDelete.id
    setPendingDelete(null)
    await deleteBookmark(bookmarkId)
    await refresh()
  }

  const handleReorderBookmarks = async (ordered: Bookmark.Item[]) => {
    setBookmarks(ordered)
    await reorderBookmarks(ordered.map(item => item.id!))
  }

  useEffect(() => {
    void (async () => {
      const [folderList, bookmarkList] = await Promise.all([
        loadFolders(),
        loadBookmarks(folderId)
      ])
      setFolders(folderList)
      setBookmarks(bookmarkList)
      setHydrated(true)
    })()
  }, [folderId])

  const renderBookmarkGrid = () => {
    if (bookmarks.length === 0) return <EmptyState />
    return (
      <SortableList
        items={bookmarks}
        getKey={item => String(item.id)}
        group="bookmark-items"
        onReorder={handleReorderBookmarks}
        className={GRID_CLASS}
      >
        {(item, _index, dragHandle) => {
          if (!item.id) return null
          return (
            <BookmarkTile
              item={item}
              dragHandleRef={dragHandle.dragHandleRef}
              onEdit={() => openEditBookmark(item)}
              onDelete={() => requestDeleteBookmark(item)}
            />
          )
        }}
      </SortableList>
    )
  }

  const dialogs = (
    <>
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent
          onPointerDownOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-sm">
              {folderEditId == null ? '新建目录' : '编辑目录'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              创建或编辑书签目录
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void handleConfirmFolder()
              }}
              placeholder="目录名称"
              className="h-9"
              autoFocus
            />
            <div className="flex justify-end">
              <ColorButton
                onClick={handleConfirmFolder}
                type="green"
                disabled={!folderName.trim()}
              >
                <Save className="size-4" />
              </ColorButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bookmarkDialogOpen} onOpenChange={setBookmarkDialogOpen}>
        <DialogContent
          onPointerDownOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-sm">
              {bookmarkEditId == null ? '新建书签' : '编辑书签'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              创建或编辑书签
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={bookmarkForm.name}
              onChange={e =>
                setBookmarkForm(prev => ({ ...prev, name: e.target.value }))
              }
              onKeyDown={e => {
                if (e.key === 'Enter') void handleConfirmBookmark()
              }}
              placeholder="书签名称"
              className="h-9"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Favicon url={normalizeUrl(bookmarkForm.url) ?? ''} />
              <Input
                value={bookmarkForm.url}
                onChange={e =>
                  setBookmarkForm(prev => ({ ...prev, url: e.target.value }))
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleConfirmBookmark()
                }}
                placeholder="链接，如 example.com"
                className="h-9"
              />
            </div>
            <div className="flex justify-end">
              <ColorButton
                onClick={handleConfirmBookmark}
                type="green"
                disabled={!bookmarkForm.name.trim() || !bookmarkForm.url.trim()}
              >
                <Save className="size-4" />
              </ColorButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete != null}
        onOpenChange={open => {
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {pendingDelete?.kind === 'folder' ? '删除目录' : '删除书签'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {pendingDelete?.kind === 'folder'
                ? `确定删除目录「${pendingDelete.name}」吗？其中的书签也会一并删除。`
                : `确定删除书签「${pendingDelete?.name}」吗？`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="取消"
              onClick={() => setPendingDelete(null)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label="确认删除"
              onClick={handleConfirmDelete}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  if (!hydrated) {
    return (
      <WithLoading loading={true}>
        <div className="min-h-[40vh]" />
      </WithLoading>
    )
  }

  if (folderId != null) {
    if (!activeFolder) {
      return (
        <WithLoading loading={false}>
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">目录不存在</p>
            <Button
              type="button"
              variant="ghost"
              aria-label="返回"
              onClick={() => onSelectFolder(null)}
            >
              <Undo2 className="size-4" />
            </Button>
          </div>
        </WithLoading>
      )
    }

    return (
      <WithLoading loading={false}>
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e6eef8] text-[#4a6fa5] dark:bg-[#4a6fa5]/20 dark:text-[#a9c3e3]">
              <Folder className="size-4" />
            </div>
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-700 dark:text-zinc-200">
              {activeFolder.name}
            </h1>
            <Button
              type="button"
              variant="outline"
              className="size-9 shrink-0 rounded-full p-0"
              aria-label="返回"
              onClick={() => onSelectFolder(null)}
            >
              <Undo2 className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <ColorButton
              type="yellow"
              className="h-9 w-auto px-4"
              aria-label="新建书签"
              onClick={openCreateBookmark}
            >
              <PlusIcon className="size-4" />
            </ColorButton>
            <span className="ml-auto self-end text-xs text-zinc-400 dark:text-zinc-500">
              拖动以排序
            </span>
          </div>

          {renderBookmarkGrid()}
        </div>
        {dialogs}
      </WithLoading>
    )
  }

  return (
    <WithLoading loading={false}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ColorButton
            type="blue"
            className="h-9 w-auto px-4"
            aria-label="新建目录"
            onClick={openCreateFolder}
          >
            <FolderPlus className="size-4" />
          </ColorButton>
          <ColorButton
            type="yellow"
            className="h-9 w-auto px-4"
            aria-label="新建书签"
            onClick={openCreateBookmark}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
          <span className="ml-auto self-end text-xs text-zinc-400 dark:text-zinc-500">
            拖动以排序
          </span>
        </div>

        {folders.length > 0 ? (
          <SortableList
            items={folders}
            getKey={folder => String(folder.id)}
            group="bookmark-folders"
            onReorder={handleReorderFolders}
            className={GRID_CLASS}
          >
            {(folder, _index, dragHandle) => {
              if (!folder.id) return null
              return (
                <FolderTile
                  folder={folder}
                  dragHandleRef={dragHandle.dragHandleRef}
                  onOpen={() => onSelectFolder(folder.id!)}
                  onEdit={() => openEditFolder(folder)}
                  onDelete={() => requestDeleteFolder(folder)}
                />
              )
            }}
          </SortableList>
        ) : null}

        {folders.length > 0 ? (
          <p className="pt-1 text-xs text-zinc-400 dark:text-zinc-500">
            未分类
          </p>
        ) : null}

        {renderBookmarkGrid()}
      </div>
      {dialogs}
    </WithLoading>
  )
}
