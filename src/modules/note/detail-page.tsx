import {
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
  type MDXEditorMethods,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from '@mdxeditor/editor'
import { useDebounceFn } from '@reactuses/core'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  CircleChevronLeft,
  FolderOpen,
  ListStart,
  Pencil,
  Trash2
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { SavedText } from '@/components/custom/saved-text'
import { SavingText } from '@/components/custom/saving-text'
import { WithLoading } from '@/components/custom/with-loading'
import { Input } from '@/components/ui/input'

import { addNote, deleteNote, getNote, updateNote } from './db'
import '@mdxeditor/editor/style.css'
import '@/styles/mdxeditor-official.css'

const AUTO_SAVE_DELAY_MS = 1000

function serializeDraft(title: string, group: string, content: string) {
  return JSON.stringify({
    title: title.trim(),
    group: group.trim(),
    content
  })
}

function isDraftEmpty(title: string, group: string, content: string) {
  return !title.trim() && !group.trim() && !content.trim()
}

function buildPlugins(withToolbar: boolean) {
  const base = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    codeBlockPlugin({
      defaultCodeBlockLanguage: 'ts'
    }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        txt: 'Plain text',
        md: 'Markdown',
        js: 'JavaScript',
        jsx: 'JavaScript (React)',
        ts: 'TypeScript',
        tsx: 'TypeScript (React)',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON',
        bash: 'Shell',
        sql: 'SQL',
        py: 'Python',
        go: 'Go',
        rs: 'Rust'
      }
    }),
    thematicBreakPlugin(),
    markdownShortcutPlugin()
  ]

  if (withToolbar) {
    base.push(
      toolbarPlugin({
        toolbarContents: () => (
          <ConditionalContents
            options={[
              {
                when: editor => editor?.editorType === 'codeblock',
                contents: () => <ChangeCodeMirrorLanguage />
              },
              {
                fallback: () => (
                  <>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <BlockTypeSelect />
                    <ListsToggle />
                    <CreateLink />
                    <InsertCodeBlock />
                    <InsertTable />
                    <InsertThematicBreak />
                  </>
                )
              }
            ]}
          />
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
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const editorRef = useRef<MDXEditorMethods>(null)
  const createdNoteIdRef = useRef<number | null>(null)
  const lastSavedSnapshotRef = useRef(serializeDraft('', '', ''))
  const idleSaveTaskRef = useRef<number | null>(null)
  const hasUnsavedChangesRef = useRef(false)
  const titleRef = useRef('')
  const groupRef = useRef('')
  const markdownRef = useRef('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const cancelIdleSaveTask = () => {
    if (idleSaveTaskRef.current == null) return

    const idleApi = globalThis as typeof globalThis & {
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof idleApi.cancelIdleCallback === 'function') {
      idleApi.cancelIdleCallback(idleSaveTaskRef.current)
    }
    idleSaveTaskRef.current = null
  }

  const markUnsavedChanges = () => {
    if (hasUnsavedChangesRef.current) return
    hasUnsavedChangesRef.current = true
    setHasUnsavedChanges(true)
  }

  const markSavedChanges = () => {
    if (!hasUnsavedChangesRef.current) return
    hasUnsavedChangesRef.current = false
    setHasUnsavedChanges(false)
  }

  const schedulePersistWhenIdle = () => {
    const runPersist = () => {
      void persistDraft(titleRef.current, groupRef.current, markdownRef.current)
    }

    const idleApi = globalThis as typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number
    }

    if (typeof idleApi.requestIdleCallback === 'function') {
      cancelIdleSaveTask()
      idleSaveTaskRef.current = idleApi.requestIdleCallback(
        () => {
          idleSaveTaskRef.current = null
          runPersist()
        },
        { timeout: 1500 }
      )
      return
    }

    runPersist()
  }

  const { run: runAutoSave, cancel: cancelAutoSave } = useDebounceFn(
    schedulePersistWhenIdle,
    AUTO_SAVE_DELAY_MS
  )

  const cancelScheduledAutoSave = () => {
    cancelAutoSave()
    cancelIdleSaveTask()
  }

  const scheduleAutoSave = () => {
    const nextTitle = titleRef.current
    const nextGroup = groupRef.current
    const nextMarkdown = markdownRef.current
    const draftEmpty = isDraftEmpty(nextTitle, nextGroup, nextMarkdown)

    if (!editing || draftEmpty || !nextTitle.trim()) {
      setIsAutoSaving(false)
      cancelScheduledAutoSave()
      return
    }

    if (!hasUnsavedChangesRef.current) {
      setIsAutoSaving(false)
      return
    }

    setIsAutoSaving(true)
    runAutoSave()
  }

  const persistDraft = async (
    nextTitle: string,
    nextGroup: string,
    nextMarkdown: string
  ) => {
    const trimmedTitle = nextTitle.trim()

    if (!trimmedTitle) {
      setIsAutoSaving(false)
      return false
    }

    const snapshot = serializeDraft(nextTitle, nextGroup, nextMarkdown)
    const targetNoteId = createdNoteIdRef.current ?? noteId
    const shouldCreate = isNew && createdNoteIdRef.current == null

    if (!shouldCreate && snapshot === lastSavedSnapshotRef.current) {
      setIsAutoSaving(false)
      markSavedChanges()
      return true
    }

    setTitleError(false)
    setIsAutoSaving(true)

    if (shouldCreate) {
      const trimmedGroup = nextGroup.trim()
      const newId = await addNote(trimmedTitle, trimmedGroup, nextMarkdown)
      createdNoteIdRef.current = newId
      lastSavedSnapshotRef.current = snapshot
      titleRef.current = trimmedTitle
      groupRef.current = trimmedGroup
      markSavedChanges()
      setIsAutoSaving(false)
      void navigate({
        to: '/note/$id',
        params: { id: String(newId) },
        replace: true
      })
      return true
    }

    const trimmedGroup = nextGroup.trim()
    await updateNote(targetNoteId, {
      title: trimmedTitle,
      group: trimmedGroup,
      content: nextMarkdown
    })
    lastSavedSnapshotRef.current = snapshot
    titleRef.current = trimmedTitle
    groupRef.current = trimmedGroup
    markSavedChanges()
    setIsAutoSaving(false)
    return true
  }

  const enterEdit = () => {
    titleRef.current = title
    groupRef.current = group
    setEditing(true)
    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })
  }

  const exitEdit = async () => {
    cancelScheduledAutoSave()

    if (
      isNew &&
      isDraftEmpty(titleRef.current, groupRef.current, markdownRef.current)
    ) {
      setIsAutoSaving(false)
      void navigate({ to: '/note' })
      return
    }

    if (!titleRef.current.trim()) {
      setTitleError(true)
      return
    }

    const didSave = await persistDraft(
      titleRef.current,
      groupRef.current,
      markdownRef.current
    )
    if (didSave) {
      setTitle(titleRef.current)
      setGroup(groupRef.current)
      setMarkdown(markdownRef.current)
      setEditing(false)
    }
  }

  useEffect(() => {
    if (!editing) cancelScheduledAutoSave()
  }, [editing])

  useEffect(() => {
    return () => {
      cancelScheduledAutoSave()
    }
  }, [])

  useEffect(() => {
    if (isNew) {
      cancelScheduledAutoSave()
      createdNoteIdRef.current = null
      lastSavedSnapshotRef.current = serializeDraft('', '', '')
      hasUnsavedChangesRef.current = false
      titleRef.current = ''
      groupRef.current = ''
      markdownRef.current = ''
      setTitle('')
      setGroup('')
      setMarkdown('')
      setEditing(true)
      setHasUnsavedChanges(false)
      setIsAutoSaving(false)
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
      hasUnsavedChangesRef.current = false
      titleRef.current = note.title
      groupRef.current = note.group ?? ''
      markdownRef.current = note.content ?? ''
      lastSavedSnapshotRef.current = serializeDraft(
        note.title,
        note.group ?? '',
        note.content ?? ''
      )
      setHasUnsavedChanges(false)
      setIsAutoSaving(false)
      setHydrated(true)
      requestAnimationFrame(() => {
        editorRef.current?.setMarkdown(note.content ?? '')
      })
    })()
  }, [isNew, navigate, noteId])

  const handleDelete = async () => {
    if (isNew) return
    await deleteNote(noteId)
    setDeleteConfirmOpen(false)
    void navigate({ to: '/note' })
  }

  const draftIsEmpty = isDraftEmpty(
    titleRef.current,
    groupRef.current,
    markdownRef.current
  )
  const draftIsSaved = !hasUnsavedChanges

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input
                key={`title-input-${noteId}`}
                ref={titleInputRef}
                defaultValue={title}
                onChange={e => {
                  const nextTitle = e.target.value
                  titleRef.current = nextTitle
                  if (nextTitle.trim() && titleError) setTitleError(false)
                  markUnsavedChanges()
                  scheduleAutoSave()
                }}
                placeholder="笔记标题"
                className={`h-8 border-none bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0 ${titleError ? 'text-red-500 placeholder:text-red-300' : ''}`}
              />
            ) : (
              <h1 className="truncate text-base font-semibold text-zinc-600 dark:text-zinc-100">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                {!draftIsEmpty && isAutoSaving ? (
                  <SavingText className="min-w-17 justify-end" />
                ) : !draftIsEmpty && draftIsSaved ? (
                  <SavedText className="min-w-17 justify-end" />
                ) : (
                  <span className="min-w-17" aria-hidden="true" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 gap-1.5 text-xs"
                  aria-label="退出编辑"
                  onClick={() => void exitEdit()}
                >
                  <CircleChevronLeft className="size-3.5" />
                </Button>
              </>
            ) : (
              <>
                {!isNew ? (
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
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 w-8 gap-1.5 text-xs"
                    disabled
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 gap-1.5 text-xs"
                  onClick={enterEdit}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 gap-1.5 text-xs"
                  aria-label="返回笔记列表"
                  onClick={() => navigate({ to: '/note' })}
                >
                  <ListStart className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {titleError ? (
          <p className="text-xs text-red-500">标题不能为空</p>
        ) : null}

        <div className="flex items-center gap-2">
          <FolderOpen className="size-3.5 shrink-0 text-zinc-400" />
          {editing ? (
            <Input
              key={`group-input-${noteId}`}
              defaultValue={group}
              onChange={e => {
                const nextGroup = e.target.value
                groupRef.current = nextGroup
                markUnsavedChanges()
                scheduleAutoSave()
              }}
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
            onChange={value => {
              markdownRef.current = value
              markUnsavedChanges()
              scheduleAutoSave()
            }}
            readOnly={!editing}
            plugins={buildPlugins(editing)}
            contentEditableClassName="note-mdx-content prose min-h-[50vh] max-w-none px-3 py-2 sm:px-4 sm:py-3"
          />
        </div>
      </section>
    </WithLoading>
  )
}
