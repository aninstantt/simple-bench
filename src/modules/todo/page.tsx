import { ListTodo, PlusIcon, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { PlayfulTodolist } from '@/components/animate-ui/components/community/playful-todolist'
import { ColorButton } from '@/components/custom/color-button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { EmptyState } from '@/components/custom/empty-state'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { loadTodoItems, autoSync } from './db'

export function TodoPage() {
  const [hydrated, setHydrated] = useState(false)
  const [items, setItems] = useState<Todo.TodoItem[]>([])
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLabel, setDialogLabel] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const itemsRef = useRef(items)
  itemsRef.current = items

  const openCreate = () => {
    setEditIndex(null)
    setDialogLabel('')
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    const idx = Number(id)
    setEditIndex(idx)
    setDialogLabel(items[idx].label)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    const label = dialogLabel.trim()
    if (!label) return
    if (editIndex !== null) {
      setItems(
        items.map((item, i) => (i === editIndex ? { ...item, label } : item))
      )
    } else {
      setItems([{ label, checked: false }, ...items])
    }
    setDialogOpen(false)
  }

  const clearCompleted = () => {
    setItems(items.filter(i => !i.checked))
  }

  const hasCompleted = items.some(i => i.checked)

  const playfulValue = items.map((i, idx) => ({ ...i, id: String(idx) }))

  useEffect(() => {
    void (async () => {
      const initial = await loadTodoItems()
      setItems(initial)
      setHydrated(true)
    })()
  }, [])

  useEffect(() => {
    if (hydrated) void autoSync(items)
  }, [items])

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<ListTodo className="size-4 " />} title="待办" />

        <div className="flex gap-2">
          <ColorButton
            type="yellow"
            className="h-9 w-auto px-4"
            aria-label="添加待办"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
          <ConfirmPopover
            side="bottom"
            align="end"
            open={clearConfirmOpen}
            onOpenChange={open => setClearConfirmOpen(open)}
            onConfirm={() => {
              clearCompleted()
              setClearConfirmOpen(false)
            }}
            trigger={
              <ColorButton
                type="pink"
                className="h-9 w-auto px-4"
                aria-label="Clear completed"
                disabled={!hasCompleted}
              >
                <Trash2 className="size-4" />
              </ColorButton>
            }
          />
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <PlayfulTodolist
            value={playfulValue}
            onChange={next => {
              setItems(
                next.map(i => ({
                  label: i.label,
                  checked: i.checked
                }))
              )
            }}
            onEdit={openEdit}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                {editIndex !== null ? <>编辑待办</> : <>添加待办</>}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editIndex !== null ? '修改待办内容' : '输入新的待办事项'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={dialogLabel}
                onChange={e => setDialogLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm()
                }}
                placeholder="待办内容"
                className="h-9"
                autoFocus
              />
              <div className="flex justify-end">
                <ColorButton
                  onClick={handleConfirm}
                  type="red"
                  disabled={!dialogLabel.trim()}
                >
                  <Save />
                </ColorButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </WithLoading>
  )
}
