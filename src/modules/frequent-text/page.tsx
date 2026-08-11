import { ClipboardList, PlusIcon, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { CopyButton } from '@/components/custom/copy'
import { EmptyState } from '@/components/custom/empty-state'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { addText, deleteText, loadTextList, textNameExists } from './db'

function maskContent(content: string, visibleStart = 4): string {
  if (content.length <= visibleStart + 3) return content
  return (
    content.slice(0, visibleStart) +
    '*'.repeat(Math.min(content.length - visibleStart, 30))
  )
}

export function FrequentTextPage() {
  const [hydrated, setHydrated] = useState(false)
  const [items, setItems] = useState<FrequentText.TextItem[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [nameError, setNameError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const reload = async () => {
    const list = await loadTextList()
    setItems(list)
  }

  useEffect(() => {
    void (async () => {
      await reload()
      setHydrated(true)
    })()
  }, [])

  const openCreate = () => {
    setName('')
    setContent('')
    setNameError('')
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('名称不能为空')
      return
    }
    const exists = await textNameExists(trimmedName)
    if (exists) {
      setNameError('名称已存在，请使用其他名称')
      return
    }
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return
    }
    await addText(trimmedName, trimmedContent)
    setDialogOpen(false)
    await reload()
  }

  const handleDelete = async (id: number) => {
    await deleteText(id)
    setDeleteConfirmId(null)
    await reload()
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader
          icon={<ClipboardList className="size-4" />}
          title="文本片段"
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索名称"
              className="h-9 w-full pr-8 pl-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <ColorButton
            type="yellow"
            className="h-9 w-auto shrink-0 px-4"
            aria-label="添加文本片段"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-xs text-zinc-400">未找到匹配的片段</p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/50 px-4 py-2 transition-colors hover:bg-zinc-100/60 dark:border-zinc-600/60 dark:bg-zinc-600/20 dark:hover:bg-zinc-600/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-100">
                    {item.name}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                    {maskContent(item.content)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyButton
                    text={item.content}
                    iconClassName="size-3.5"
                    className="inline-flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-600/60 dark:hover:text-zinc-300"
                  />
                  <ConfirmPopover
                    open={deleteConfirmId === item.id}
                    onOpenChange={open =>
                      setDeleteConfirmId(open ? item.id : null)
                    }
                    onConfirm={() => void handleDelete(item.id)}
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-8 shrink-0 p-0"
                        aria-label="删除"
                      >
                        <Trash2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加文本片段</DialogTitle>
              <DialogDescription className="sr-only">
                输入名称和内容，保存文本片段
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Input
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    setNameError('')
                  }}
                  placeholder="名称"
                  className={`h-9 ${nameError ? 'border-red-500 focus-visible:ring-red-500/35' : ''}`}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                )}
              </div>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="文本内容"
                className="min-h-25 break-all"
              />
              <div className="flex justify-end">
                <ColorButton
                  onClick={() => void handleConfirm()}
                  type="green"
                  disabled={!name.trim() || !content.trim()}
                >
                  保存
                </ColorButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </WithLoading>
  )
}
