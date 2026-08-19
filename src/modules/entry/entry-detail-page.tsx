import { useNavigate, useParams } from '@tanstack/react-router'
import {
  CircleChevronLeft,
  Library,
  Pencil,
  PlusIcon,
  Save,
  Tag,
  Trash2,
  Undo2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { EntryDescription } from '@/components/custom/entry-description'
import { WithLoading } from '@/components/custom/with-loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  addEntry,
  deleteEntry,
  entryNameExists,
  getEntryBySpaceAndName,
  getSpace,
  updateEntry
} from './db'

const SYNTAX_HELP: { label: string; example: string; desc: string }[] = [
  {
    label: '标题',
    example: '# 标题、## 子标题',
    desc: '以 # 开头为一级标题，## 开头为二级标题'
  },
  {
    label: '内部链接',
    example: '[[词条名]]',
    desc: '[[...]] 包裹的词条名会变成内部链接，跳转到对应词条'
  },
  {
    label: '外部链接',
    example: '[文字](https://...)',
    desc: '外部链接，点击后在新窗口打开'
  },
  {
    label: '加粗',
    example: '**文字**',
    desc: '**...** 包裹的文字会加粗并显示为绿色'
  },
  {
    label: '小字',
    example: '> 小字',
    desc: '以 > 开头的行会显示为灰色小字'
  }
]

export function EntryDetailPage() {
  const navigate = useNavigate()
  const { spaceId, entryName } = useParams({ strict: false }) as {
    spaceId: string
    entryName: string
  }
  const spaceIdNum = Number(spaceId)

  const [hydrated, setHydrated] = useState(false)
  const [space, setSpace] = useState<Entry.Space | undefined>()
  const [entry, setEntry] = useState<Entry.EntryItem | undefined>()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const openCreate = () => {
    setEditName(entryName)
    setEditDescription('')
    setEditCategory('')
    setDialogOpen(true)
  }

  const openEdit = () => {
    if (!entry) return
    setEditName(entry.name)
    setEditDescription(entry.description)
    setEditCategory(entry.category)
    setDialogOpen(true)
  }

  const handleEditConfirm = async () => {
    const name = editName.trim()
    if (!name) return
    if (await entryNameExists(spaceIdNum, name, entry?.id)) {
      toast.error('词条名称已存在')
      return
    }
    if (!entry || !entry.id) {
      await addEntry({
        spaceId: spaceIdNum,
        name,
        description: editDescription.trim(),
        category: editCategory.trim()
      })
    } else {
      await updateEntry(entry.id, {
        name,
        description: editDescription.trim(),
        category: editCategory.trim()
      })
    }
    setEntry(await getEntryBySpaceAndName(spaceIdNum, name))
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!entry || !entry.id) return
    await deleteEntry(entry.id)
    setDeleteConfirmOpen(false)
    void navigate({
      to: '/entry/$spaceId',
      params: { spaceId: String(spaceIdNum) }
    })
  }

  useEffect(() => {
    void (async () => {
      const [spaceData, entryData] = await Promise.all([
        getSpace(spaceIdNum),
        getEntryBySpaceAndName(spaceIdNum, entryName)
      ])
      setSpace(spaceData)
      setEntry(entryData)
      setHydrated(true)
    })()
  }, [spaceIdNum, entryName])

  if (!hydrated) {
    return (
      <WithLoading loading={true}>
        <section className="mx-auto min-h-[40vh] max-w-lg" />
      </WithLoading>
    )
  }

  if (!space) {
    return (
      <WithLoading loading={false}>
        <section className="mx-auto max-w-lg space-y-4">
          <p className="text-sm text-zinc-500">空间不存在</p>
          <Button
            variant="ghost"
            onClick={() => void navigate({ to: '/entry' })}
          >
            <Undo2 className="size-4" />
          </Button>
        </section>
      </WithLoading>
    )
  }

  const isEmpty = !entry

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Library className="size-4" />
          </div>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-700 dark:text-zinc-200">
            {isEmpty ? entryName : entry!.name}
          </h1>
          <Button
            type="button"
            variant="outline"
            className="size-9 shrink-0 rounded-full p-0"
            aria-label="返回"
            onClick={() =>
              void navigate({
                to: '/entry/$spaceId',
                params: { spaceId: String(spaceIdNum) }
              })
            }
          >
            <CircleChevronLeft className="size-4" />
          </Button>
        </div>

        {isEmpty ? (
          <div className="space-y-4 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-6 text-center dark:border-amber-900/40 dark:bg-amber-900/10">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              这个词条还没有内容
            </p>
            <div className="flex justify-center">
              <ColorButton
                type="yellow"
                className="h-9 w-auto px-4 text-xs"
                onClick={openCreate}
              >
                <PlusIcon className="size-3.5" />
                创建词条
              </ColorButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {entry!.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Tag className="size-3" />
                    {entry!.category}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300/50 px-2 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-amber-100/60 hover:text-zinc-600 dark:border-zinc-600/60 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-amber-900/20 dark:hover:text-zinc-300"
                >
                  语法说明
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="size-8 rounded-md p-0"
                  aria-label="编辑"
                  onClick={openEdit}
                >
                  <Pencil className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                </Button>
                <ConfirmPopover
                  open={deleteConfirmOpen}
                  onOpenChange={setDeleteConfirmOpen}
                  onConfirm={() => void handleDelete()}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-8 rounded-md p-0"
                      aria-label="删除"
                    >
                      <Trash2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                    </Button>
                  }
                />
              </div>
            </div>

            {entry!.description ? (
              <EntryDescription
                text={entry!.description}
                spaceId={spaceIdNum}
              />
            ) : null}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            onPointerDownOutside={e => e.preventDefault()}
            onEscapeKeyDown={e => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-sm">
                {isEmpty ? '创建词条' : '编辑词条'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                创建或修改词条信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleEditConfirm()
                }}
                placeholder="词条名称"
                className="h-9"
                autoFocus
              />
              <Input
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                placeholder="类别（可选）"
                className="h-9"
              />
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="词条内容，支持以下语法：# 标题、## 子标题、[[链接]]、[文字](url) 外部链接、**粗体**、> 灰色小字"
                className="min-h-28 text-sm"
              />
              <div className="flex justify-end">
                <ColorButton
                  onClick={handleEditConfirm}
                  type="green"
                  disabled={!editName.trim()}
                >
                  <Save className="size-4" />
                </ColorButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">语法说明</DialogTitle>
              <DialogDescription className="sr-only">
                词条内容支持的语法格式
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {SYNTAX_HELP.map(item => (
                <div
                  key={item.label}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800/50"
                >
                  <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    {item.label}
                  </div>
                  <code className="block rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {item.example}
                  </code>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </WithLoading>
  )
}
