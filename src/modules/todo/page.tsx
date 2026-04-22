import CryptoJS from 'crypto-js'
import { useAtom } from 'jotai/react'
import {
  ListTodo,
  PlusIcon,
  Save,
  Trash2,
  Captions,
  CaptionsOff
} from 'lucide-react'
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
import { showButtonsAtom } from '@/states/todo'

import { loadTodoItems, autoSync } from './db'

type TodoStateItem = Todo.TodoItem & {
  id: string
}

function createTodoId() {
  return `todo-${CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)}`
}

function normalizeTodoItems(items: Todo.TodoItem[]): TodoStateItem[] {
  return items.map(item => {
    const id =
      'id' in item && typeof item.id === 'string' && item.id.length > 0
        ? item.id
        : createTodoId()

    return {
      ...item,
      id
    }
  })
}

export function TodoPage() {
  const [hydrated, setHydrated] = useState(false)
  const [items, setItems] = useState<TodoStateItem[]>([])
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLabel, setDialogLabel] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [showButtons, setShowButtons] = useAtom(showButtonsAtom)

  const hydratedRef = useRef(hydrated)
  hydratedRef.current = hydrated
  const itemsRef = useRef(items)
  itemsRef.current = items

  const openCreate = () => {
    setEditId(null)
    setDialogLabel('')
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    const item = items.find(item => item.id === id)
    if (!item) return

    setEditId(id)
    setDialogLabel(item.label)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    const label = dialogLabel.trim()
    if (!label) return
    if (editId !== null) {
      setItems(
        items.map(item => (item.id === editId ? { ...item, label } : item))
      )
    } else {
      setItems([{ id: createTodoId(), label, checked: false }, ...items])
    }
    setDialogOpen(false)
  }

  const clearCompleted = () => {
    setItems(items.filter(i => !i.checked))
  }

  const hasCompleted = items.some(i => i.checked)

  useEffect(() => {
    void (async () => {
      const initial = await loadTodoItems()
      setItems(normalizeTodoItems(initial))
      setHydrated(true)
    })()
  }, [])

  useEffect(() => {
    if (hydratedRef.current) void autoSync(itemsRef.current)
  }, [items])

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<ListTodo className="size-4 " />} title="待办" />

        <div className="flex gap-2">
          <ColorButton
            type="blue"
            className="h-9 w-auto px-4"
            aria-label={showButtons ? '切换为复制按钮' : '切换为编辑按钮'}
            onClick={() => setShowButtons(!showButtons)}
          >
            {showButtons ? (
              <CaptionsOff className="size-4" />
            ) : (
              <Captions className="size-4" />
            )}
          </ColorButton>
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
            value={items}
            onChange={next => {
              setItems(next)
            }}
            onEdit={openEdit}
            showButtons={showButtons}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                {editId !== null ? <>编辑待办</> : <>添加待办</>}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editId !== null ? '修改待办内容' : '输入新的待办事项'}
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
