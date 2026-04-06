import { useNavigate } from '@tanstack/react-router'
import { BookText, FolderOpen, PlusIcon, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { EmptyState } from '@/components/custom/empty-state'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'

import { deleteNote, loadNoteList } from './db'

type GroupedNotes = { group: string; notes: Note.NoteListItem[] }[]

function groupByGroup(notes: Note.NoteListItem[]): GroupedNotes {
  const map = new Map<string, Note.NoteListItem[]>()
  for (const note of notes) {
    const group = note.group || ''
    const list = map.get(group)
    if (list) list.push(note)
    else map.set(group, [note])
  }

  const groups: GroupedNotes = []
  for (const [group, items] of map) {
    if (group) groups.push({ group, notes: items })
  }
  const ungrouped = map.get('')
  if (ungrouped) groups.push({ group: '', notes: ungrouped })
  return groups
}

export function NotePage() {
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [notes, setNotes] = useState<Note.NoteListItem[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const reload = async () => {
    const items = await loadNoteList()
    setNotes(items)
  }

  useEffect(() => {
    void (async () => {
      await reload()
      setHydrated(true)
    })()
  }, [])

  const handleDelete = async (id: number) => {
    await deleteNote(id)
    await reload()
  }

  const groups = groupByGroup(notes)

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<BookText className="size-4" />} title="笔记" />

        <div>
          <ColorButton
            type="yellow"
            className="h-9 w-auto px-4"
            aria-label="新增笔记"
            onClick={() => navigate({ to: '/note/$id', params: { id: '0' } })}
          >
            <PlusIcon className="size-4" />
          </ColorButton>
        </div>

        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {groups.map(g => (
              <div key={g.group || '__ungrouped'}>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  <FolderOpen className="size-3.5" />
                  {g.group || '未分组'}
                </div>
                <ul className="space-y-1.5">
                  {g.notes.map(note => (
                    <li
                      key={note.id}
                      className="group flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/50 px-4 py-1 transition-colors hover:bg-zinc-100/60 dark:border-zinc-600/60 dark:bg-zinc-600/20 dark:hover:bg-zinc-600/40"
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium text-zinc-600 dark:text-zinc-100"
                        onClick={() =>
                          navigate({
                            to: '/note/$id',
                            params: { id: String(note.id) }
                          })
                        }
                      >
                        {note.title}
                      </button>

                      <ConfirmPopover
                        side="left"
                        align="center"
                        open={deleteConfirmId === note.id}
                        onOpenChange={open =>
                          setDeleteConfirmId(open ? note.id : null)
                        }
                        onConfirm={() => {
                          void handleDelete(note.id)
                          setDeleteConfirmId(null)
                        }}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            className="size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="删除笔记"
                          >
                            <Trash2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                          </Button>
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </WithLoading>
  )
}
