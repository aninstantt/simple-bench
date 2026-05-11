import type { Dispatch, SetStateAction } from 'react'

import {
  File,
  FileSpreadsheet,
  FolderOpen,
  ListX,
  MessageSquareText,
  Plus,
  RefreshCcw,
  X
} from 'lucide-react'
import { useRef, useState } from 'react'

import { EmptyState } from '@/components/custom/empty-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type ShareListPanelProps = {
  items: Share.ListItem[]
  onPeerReconnect: () => void
  peerError: string
  peerState: Share.PeerConnectionState
  setItems: Dispatch<SetStateAction<Share.ListItem[]>>
}

export function ShareListPanel({
  items,
  onPeerReconnect,
  peerError,
  peerState,
  setItems
}: ShareListPanelProps) {
  const [textDraft, setTextDraft] = useState('')
  const [textDialogOpen, setTextDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  function chooseFolder() {
    folderInputRef.current?.setAttribute('webkitdirectory', '')
    folderInputRef.current?.setAttribute('directory', '')
    folderInputRef.current?.click()
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return
    }

    const nextItems = Array.from(fileList).map(file => ({
      id: crypto.randomUUID(),
      file,
      type: 'file' as const,
      name: file.name,
      path: file.webkitRelativePath || undefined,
      size: file.size,
      createdAt: new Date().toISOString()
    }))

    setItems(currentItems => [...nextItems, ...currentItems])
  }

  function addText() {
    const text = textDraft.trim()

    if (!text) {
      return
    }

    setItems(currentItems => [
      {
        id: crypto.randomUUID(),
        type: 'text',
        name: `文本 ${currentItems.length + 1}`,
        text,
        size: new Blob([text]).size,
        createdAt: new Date().toISOString()
      },
      ...currentItems
    ])
    setTextDraft('')
    setTextDialogOpen(false)
  }

  function removeItem(id: string) {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200/70 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        <FileSpreadsheet className="size-4 text-zinc-400" />
        <span>发送文件</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={event => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={event => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <PeerStatus
        error={peerError}
        onReconnect={onPeerReconnect}
        state={peerState}
      />

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 text-xs font-normal text-zinc-500 dark:text-zinc-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <File className="size-3.5" />
          文件
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 text-xs font-normal text-zinc-500 dark:text-zinc-400"
          onClick={chooseFolder}
        >
          <FolderOpen className="size-3.5" />
          文件夹
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 text-xs font-normal text-zinc-500 dark:text-zinc-400"
          onClick={() => setTextDialogOpen(true)}
        >
          <Plus className="size-3.5" />
          文本
        </Button>
      </div>

      <Dialog
        open={textDialogOpen}
        onOpenChange={open => {
          setTextDialogOpen(open)

          if (!open) {
            setTextDraft('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加文本</DialogTitle>
          </DialogHeader>
          <Textarea
            className="min-h-32 resize-none text-[13px] leading-relaxed"
            placeholder="输入文本"
            value={textDraft}
            onChange={event => setTextDraft(event.target.value)}
            autoFocus
          />
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTextDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="bg-[#44803F] text-white hover:bg-[#44803F]/90"
              onClick={addText}
              disabled={!textDraft.trim()}
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {items.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {items.length} 项
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-zinc-500"
              onClick={() => setItems([])}
            >
              <ListX className="size-3.5" />
              清空
            </Button>
          </div>

          {items.map(item => (
            <article
              key={item.id}
              className="flex items-center gap-3 rounded-md bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                {item.type === 'text' ? (
                  <MessageSquareText className="size-4" />
                ) : (
                  <File className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {getItemDisplayName(item)}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatItemSize(item.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-zinc-400 hover:text-red-500"
                onClick={() => removeItem(item.id)}
                aria-label="移除"
              >
                <X className="size-4" />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
          <EmptyState />
        </div>
      )}
    </div>
  )
}

function formatItemSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function getItemDisplayName(item: Share.ListItem) {
  return item.type === 'file' ? item.path || item.name : item.name
}

function PeerStatus({
  error,
  onReconnect,
  state
}: {
  error: string
  onReconnect: () => void
  state: Share.PeerConnectionState
}) {
  const connected = state === 'connected'
  const failed = state === 'error'

  return (
    <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-2.5 py-2 text-[13px] font-normal text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
      <span
        className={
          connected
            ? 'size-2 rounded-full bg-emerald-500'
            : failed
              ? 'size-2 rounded-full bg-red-500'
              : 'size-2 rounded-full bg-zinc-300 dark:bg-zinc-600'
        }
      />
      <span className="min-w-0 flex-1 truncate">
        {connected
          ? 'Transfer channel ready'
          : failed
            ? error || 'Transfer channel unavailable'
            : 'Preparing transfer channel'}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-zinc-400 hover:text-[#44803F]"
        onClick={onReconnect}
        aria-label="重连"
      >
        <RefreshCcw className="size-3.5" />
      </Button>
    </div>
  )
}
