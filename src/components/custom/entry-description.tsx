'use client'

import type { ReactNode } from 'react'

import { useNavigate } from '@tanstack/react-router'

type EntryDescriptionProps = {
  text: string
  spaceId: number
}

function parseInline(
  text: string,
  spaceId: number,
  navigate: ReturnType<typeof useNavigate>
): ReactNode[] {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^@([^@]+)@/)
    if (linkMatch) {
      const name = linkMatch[1]
      parts.push(
        <button
          key={key++}
          type="button"
          onClick={() =>
            navigate({
              to: '/entry/$spaceId/$entryName',
              params: { spaceId: String(spaceId), entryName: name }
            })
          }
          className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
        >
          {name}
        </button>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      parts.push(
        <strong
          key={key++}
          className="font-semibold text-green-600 dark:text-green-400"
        >
          {boldMatch[1]}
        </strong>
      )
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    parts.push(remaining[0])
    remaining = remaining.slice(1)
  }

  return parts
}

export function EntryDescription({ text, spaceId }: EntryDescriptionProps) {
  const navigate = useNavigate()

  if (!text) return null

  const lines = text.split('\n')
  const elements: ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={i}
          className="text-base font-semibold text-zinc-700 dark:text-zinc-200"
        >
          {parseInline(line.slice(3), spaceId, navigate)}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={i}
          className="text-lg font-bold text-zinc-800 dark:text-zinc-100"
        >
          {parseInline(line.slice(2), spaceId, navigate)}
        </h1>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <p key={i} className="text-xs text-zinc-400 dark:text-zinc-500">
          {parseInline(line.slice(2), spaceId, navigate)}
        </p>
      )
    } else {
      elements.push(
        <p
          key={i}
          className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          {parseInline(line, spaceId, navigate)}
        </p>
      )
    }
  }

  return <div className="space-y-1">{elements}</div>
}
