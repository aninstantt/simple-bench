import { useNavigate, useParams } from '@tanstack/react-router'
import {
  CircleChevronLeft,
  Library,
  PlusIcon,
  Save,
  Search,
  Tag,
  Undo2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { EmptyState } from '@/components/custom/empty-state'
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

import { addEntry, entryNameExists, getSpace, loadEntries } from './db'

type EntryFormState = {
  name: string
  description: string
  category: string
}

const EMPTY_FORM: EntryFormState = { name: '', description: '', category: '' }

export function EntrySpacePage() {
  const navigate = useNavigate()
  const { spaceId } = useParams({ strict: false }) as { spaceId: string }
  const id = Number(spaceId)

  const [hydrated, setHydrated] = useState(false)
  const [space, setSpace] = useState<Entry.Space | undefined>()
  const [entries, setEntries] = useState<Entry.EntryItem[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<EntryFormState>(EMPTY_FORM)

  const categories = Array.from(
    new Set(entries.map(e => e.category).filter(Boolean))
  )

  const keyword = search.trim().toLowerCase()
  const matchedEntries = entries.filter(e => {
    if (
      keyword &&
      !e.name.toLowerCase().includes(keyword) &&
      !e.description.toLowerCase().includes(keyword)
    )
      return false
    if (activeCategory != null && e.category !== activeCategory) return false
    return true
  })

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    const name = form.name.trim()
    if (!name) return
    if (await entryNameExists(id, name)) {
      toast.error('词条名称已存在')
      return
    }
    await addEntry({
      spaceId: id,
      name,
      description: form.description.trim(),
      category: form.category.trim()
    })
    setEntries(await loadEntries(id))
    setDialogOpen(false)
  }

  useEffect(() => {
    void (async () => {
      const [spaceData, entryList] = await Promise.all([
        getSpace(id),
        loadEntries(id)
      ])
      setSpace(spaceData)
      setEntries(entryList)
      setHydrated(true)
    })()
  }, [id])

  function renderEntryRow(entry: Entry.EntryItem) {
    if (!entry.id) return null
    return (
      <button
        type="button"
        className="group flex w-full items-center gap-2 rounded-xl border border-amber-200/60 bg-white py-2 pr-3 pl-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-amber-50/60 dark:border-amber-900/40 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
        onClick={() =>
          navigate({
            to: '/entry/$spaceId/$entryName',
            params: {
              spaceId: String(id),
              entryName: entry.name
            }
          })
        }
      >
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-100">
          {entry.name}
        </span>
        {entry.category ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Tag className="size-3" />
            {entry.category}
          </span>
        ) : null}
      </button>
    )
  }

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

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Library className="size-4" />
          </div>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-700 dark:text-zinc-200">
            {space.name}
          </h1>
          <Button
            type="button"
            variant="outline"
            className="size-9 shrink-0 rounded-full p-0"
            aria-label="返回"
            onClick={() => void navigate({ to: '/entry' })}
          >
            <CircleChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索词条名称或内容"
                className="h-9 bg-white pl-8 text-sm dark:bg-zinc-800/60"
              />
            </div>
            <ColorButton
              type="yellow"
              className="h-9 w-auto px-4"
              aria-label="新建词条"
              onClick={openCreate}
            >
              <PlusIcon className="size-4" />
            </ColorButton>
          </div>

          {space.description ? (
            <EntryDescription text={space.description} spaceId={id} />
          ) : null}

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  activeCategory == null
                    ? 'bg-amber-200/70 font-medium text-amber-800 dark:bg-amber-700/40 dark:text-amber-200'
                    : 'bg-amber-100/50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30'
                }`}
              >
                全部
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    activeCategory === cat
                      ? 'bg-amber-200/70 font-medium text-amber-800 dark:bg-amber-700/40 dark:text-amber-200'
                      : 'bg-amber-100/50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          {matchedEntries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-1.5">
              {matchedEntries.map(entry => (
                <div key={entry.id}>{renderEntryRow(entry)}</div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            onPointerDownOutside={e => e.preventDefault()}
            onEscapeKeyDown={e => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-sm">新建词条</DialogTitle>
              <DialogDescription className="sr-only">
                创建新词条
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
                placeholder="词条名称"
                className="h-9"
                autoFocus
              />
              <Input
                value={form.category}
                onChange={e =>
                  setForm(prev => ({ ...prev, category: e.target.value }))
                }
                placeholder="类别（可选）"
                className="h-9"
              />
              <Textarea
                value={form.description}
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="词条内容，支持以下语法：# 标题、## 子标题、[[链接]]、[文字](url) 外部链接、**粗体**、> 灰色小字"
                className="min-h-28 text-sm"
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
