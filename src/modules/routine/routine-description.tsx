'use client'

import { useState } from 'react'

type RoutineDescriptionProps = {
  desc: string
  onSave: (desc: string) => void
}

function renderLine(text: string) {
  const parts = text.split(/(\[.+?\])/g)
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <strong
          key={i}
          className="font-semibold text-emerald-600 dark:text-emerald-400"
        >
          {part.slice(1, -1)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function RoutineDescription({ desc, onSave }: RoutineDescriptionProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(desc || '')

  const lines = (desc || '').split('\n')

  const handleSave = () => {
    onSave(draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(desc || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            用{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-600">
              [文字]
            </code>{' '}
            包裹要加重的文字
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-6 items-center rounded px-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-600"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-6 items-center rounded px-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              保存
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="h-32 w-full resize-y rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-200 dark:focus:border-zinc-300"
          placeholder="K: [V]"
          autoFocus
        />
      </div>
    )
  }

  if (!(desc || '').trim()) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(desc || '')
          setEditing(true)
        }}
        className="group flex w-full cursor-text items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-xs text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-500 dark:border-zinc-600 dark:hover:border-zinc-500"
      >
        添加描述
      </button>
    )
  }

  return (
    <div className="relative rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-600/40">
      <button
        type="button"
        onClick={() => {
          setDraft(desc || '')
          setEditing(true)
        }}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded px-1 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-500"
        aria-label="编辑描述"
      >
        编辑
      </button>
      <div className="space-y-1 pr-8">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-zinc-600 dark:text-zinc-300">
            {line ? renderLine(line) : <br />}
          </p>
        ))}
      </div>
    </div>
  )
}
