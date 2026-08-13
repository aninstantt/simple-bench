import { useNavigate } from '@tanstack/react-router'
import { Library, Pencil, PlusIcon, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { DragHandle, SortableList } from '@/components/custom/drag-sort-list'
import { EmptyState } from '@/components/custom/empty-state'
import { PageHeader } from '@/components/custom/page-header'
import { StrictConfirmPopover } from '@/components/custom/strict-confirm-popover'
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
  addSpace,
  deleteSpace,
  loadSpaces,
  reorderSpaces,
  spaceNameExists,
  updateSpace
} from './db'

type SpaceFormState = {
  name: string
  description: string
}

const EMPTY_FORM: SpaceFormState = { name: '', description: '' }

export function EntryPage() {
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [spaces, setSpaces] = useState<Entry.Space[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<SpaceFormState>(EMPTY_FORM)

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (space: Entry.Space) => {
    setEditId(space.id ?? null)
    setForm({ name: space.name, description: space.description })
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    const name = form.name.trim()
    if (!name) return
    if (await spaceNameExists(name, editId ?? undefined)) {
      toast.error('空间名称已存在')
      return
    }
    if (editId == null) {
      await addSpace({ name, description: form.description.trim() })
    } else {
      await updateSpace(editId, { name, description: form.description.trim() })
    }
    setSpaces(await loadSpaces())
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    await deleteSpace(id)
    setSpaces(await loadSpaces())
  }

  const handleReorder = async (ordered: Entry.Space[]) => {
    const ids = ordered.map(s => s.id!)
    await reorderSpaces(ids)
    setSpaces(ordered)
  }

  useEffect(() => {
    void (async () => {
      setSpaces(await loadSpaces())
      setHydrated(true)
    })()
  }, [])

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<Library className="size-4" />} title="词条" />

        <div className="flex items-center gap-2">
          <ColorButton
            type="yellow"
            className="h-9 w-auto px-4"
            aria-label="新建空间"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
          <span className="ml-auto self-end text-xs text-zinc-400 dark:text-zinc-500">
            拖动以排序
          </span>
        </div>

        {spaces.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            <SortableList
              items={spaces}
              getKey={s => String(s.id)}
              group="entry-spaces"
              onReorder={handleReorder}
            >
              {(space, _index, dragHandle) => {
                if (!space.id) return null
                return (
                  <div className="group flex items-center gap-1 rounded-xl border border-zinc-200/70 bg-zinc-50/50 py-1 pr-2 pl-1 transition-colors hover:bg-zinc-100/60 dark:border-zinc-600/60 dark:bg-zinc-600/20 dark:hover:bg-zinc-600/40">
                    <DragHandle
                      dragHandleRef={dragHandle.dragHandleRef}
                      className="mr-1"
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium text-zinc-600 dark:text-zinc-100"
                      onClick={() =>
                        navigate({
                          to: '/entry/$spaceId',
                          params: { spaceId: String(space.id) }
                        })
                      }
                    >
                      {space.name}
                    </button>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="编辑空间"
                        onClick={() => openEdit(space)}
                      >
                        <Pencil className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                      </Button>
                      <StrictConfirmPopover
                        onConfirm={() => void handleDelete(space.id!)}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            className="size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="删除空间"
                          >
                            <Trash2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )
              }}
            </SortableList>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editId == null ? '新建空间' : '编辑空间'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                创建或编辑空间信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={form.name}
                onChange={e =>
                  setForm(prev => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleConfirm()
                }}
                placeholder="空间名称"
                className="h-9"
                autoFocus
              />
              <Textarea
                value={form.description}
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="空间描述：支持 # 标题、## 子标题、[[链接]]、[文字](url) 外部链接、**粗体**、> 灰色小字"
                className="min-h-20 text-sm"
              />
              <div className="flex justify-end">
                <ColorButton
                  onClick={handleConfirm}
                  type="green"
                  disabled={!form.name.trim()}
                >
                  <Save className="size-4" />
                </ColorButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </WithLoading>
  )
}
