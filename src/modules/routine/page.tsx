import { useNavigate } from '@tanstack/react-router'
import { CalendarDays, Pencil, PlusIcon, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
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

import { deleteRoutine, loadRoutines, updateRoutineName } from './db'

export function RoutinePage() {
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [routines, setRoutines] = useState<Routine.RoutineItem[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const openEdit = (id: number, name: string) => {
    setEditId(id)
    setEditName(name)
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    const newName = editName.trim()
    if (!newName || editId == null) return
    await updateRoutineName(editId, newName)
    setRoutines(await loadRoutines())
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    await deleteRoutine(id)
    setRoutines(await loadRoutines())
  }

  useEffect(() => {
    void (async () => {
      setRoutines(await loadRoutines())
      setHydrated(true)
    })()
  }, [])

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<CalendarDays className="size-4" />} title="日常" />

        <div className="flex gap-2">
          <ColorButton
            type="yellow"
            className="h-9 w-auto px-4"
            aria-label="新建日常"
            onClick={() => navigate({ to: '/routine/create' })}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
        </div>

        {routines.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-1.5">
            {routines.map(routine => {
              if (!routine.id) return null
              return (
                <li
                  key={routine.id}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/50 py-1 pr-2 pl-4 transition-colors hover:bg-zinc-100/60 dark:border-zinc-600/60 dark:bg-zinc-600/20 dark:hover:bg-zinc-600/40"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium text-zinc-600 dark:text-zinc-100"
                    onClick={() =>
                      navigate({
                        to: '/routine/$id',
                        params: { id: String(routine.id) }
                      })
                    }
                  >
                    {routine.name}
                  </button>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="编辑名称"
                      onClick={() => openEdit(routine.id!, routine.name)}
                    >
                      <Pencil className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                    </Button>
                    <ConfirmPopover
                      side="bottom"
                      align="end"
                      onConfirm={() => {
                        if (routine.id != null) void handleDelete(routine.id)
                      }}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          className="size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="删除日常"
                        >
                          <Trash2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                        </Button>
                      }
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">编辑名称</DialogTitle>
              <DialogDescription className="sr-only">
                修改日常任务名称
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleConfirm()
                }}
                placeholder="任务名称"
                className="h-9"
                autoFocus
              />
              <div className="flex justify-end">
                <ColorButton
                  onClick={handleConfirm}
                  type="green"
                  disabled={!editName.trim()}
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
