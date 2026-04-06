import '@mdxeditor/editor/style.css'
import {
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertTable,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  UndoRedo,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from '@mdxeditor/editor'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, FolderOpen, Pencil, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { SavedText } from '@/components/custom/saved-text'
import { WithLoading } from '@/components/custom/with-loading'
import { Input } from '@/components/ui/input'

import { addNote, deleteNote, getNote, updateNote } from './db'

function buildPlugins(withToolbar: boolean) {
  const base = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin()
  ]

  if (withToolbar) {
    base.push(
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <BlockTypeSelect />
            <ListsToggle />
            <CreateLink />
            <InsertTable />
          </>
        )
      })
    )
  }

  return base
}

export function NoteDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const noteId = Number(id)

  const isNew = noteId === 0

  const [hydrated, setHydrated] = useState(false)
  const [editing, setEditing] = useState(isNew)
  const [title, setTitle] = useState('')
  const [group, setGroup] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [titleError, setTitleError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const editorRef = useRef<MDXEditorMethods>(null)
  const saveFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isNew) {
      setHydrated(true)
      return
    }

    void (async () => {
      const note = await getNote(noteId)
      if (!note) {
        void navigate({ to: '/note' })
        return
      }
      setTitle(note.title)
      setGroup(note.group ?? '')
      setMarkdown(note.content ?? '')
      setHydrated(true)
      requestAnimationFrame(() => {
        editorRef.current?.setMarkdown(note.content ?? '')
      })
    })()

    return () => {
      if (saveFlashTimerRef.current) clearTimeout(saveFlashTimerRef.current)
    }
  }, [noteId])

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setTitleError(false)

    const content = editorRef.current?.getMarkdown() ?? markdown

    if (isNew) {
      const newId = await addNote(title.trim(), group.trim(), content)
      void navigate({
        to: '/note/$id',
        params: { id: String(newId) },
        replace: true
      })
      return
    }

    await updateNote(noteId, {
      title: title.trim(),
      group: group.trim(),
      content
    })

    setMarkdown(content)

    if (saveFlashTimerRef.current) clearTimeout(saveFlashTimerRef.current)
    setSaved(true)
    setEditing(false)
    saveFlashTimerRef.current = setTimeout(() => {
      setSaved(false)
      saveFlashTimerRef.current = null
    }, 1200)
  }

  const enterEdit = () => {
    setEditing(true)
    setSaved(false)
  }

  const handleDelete = async () => {
    if (isNew) return
    await deleteNote(noteId)
    setDeleteConfirmOpen(false)
    void navigate({ to: '/note' })
  }

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="size-9 shrink-0 p-0"
            aria-label="返回笔记列表"
            onClick={() => navigate({ to: '/note' })}
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <div className="min-w-0 flex-1">
            {editing ? (
              <Input
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) setTitleError(false)
                }}
                placeholder="笔记标题"
                className={`h-8 border-none bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0 ${titleError ? 'text-red-500 placeholder:text-red-300' : ''}`}
                autoFocus
              />
            ) : (
              <h1 className="truncate text-base font-semibold text-zinc-600 dark:text-zinc-100">
                {title}
              </h1>
            )}
          </div>

          {editing ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 w-[68px] gap-1.5 px-3 text-xs"
              onClick={() => void handleSave()}
            >
              <Save className="size-3.5" />
              保存
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {!isNew && !saved ? (
                  <ConfirmPopover
                    open={deleteConfirmOpen}
                    onOpenChange={setDeleteConfirmOpen}
                    side="left"
                    align="center"
                    onConfirm={() => void handleDelete()}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 w-8 gap-1.5 text-xs"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                ) : null}

                {saved ? (
                  <SavedText className="w-[68px]" />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 w-8 gap-1.5 text-xs"
                    onClick={enterEdit}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {titleError ? (
          <p className="text-xs text-red-500">标题不能为空</p>
        ) : null}

        <div className="flex items-center gap-2">
          <FolderOpen className="size-3.5 shrink-0 text-zinc-400" />
          {editing ? (
            <Input
              value={group}
              onChange={e => setGroup(e.target.value)}
              placeholder="分组（可选）"
              className="h-7 border-none bg-transparent px-0 text-xs text-zinc-500 shadow-none focus-visible:ring-0 dark:text-zinc-400"
            />
          ) : (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {group || '未分组'}
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white dark:border-zinc-600/60 dark:bg-zinc-600/20">
          <MDXEditor
            key={`${noteId}-${editing}`}
            ref={editorRef}
            markdown={markdown}
            readOnly={!editing}
            plugins={buildPlugins(editing)}
            contentEditableClassName="prose prose-zinc dark:prose-invert min-h-[50vh] max-w-none px-4 py-3"
          />
        </div>
      </section>
    </WithLoading>
  )
}
