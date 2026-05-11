import { Download, File, FolderDown, MessageSquareText } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { CopyButton } from '@/components/custom/copy'
import { EmptyState } from '@/components/custom/empty-state'
import { Button } from '@/components/ui/button'

type ReceivedListPanelProps = {
  items: Share.ListItem[]
}

export function ReceivedListPanel({ items }: ReceivedListPanelProps) {
  const fileUrls = useMemo(
    () =>
      new Map(
        items
          .filter(item => item.type === 'file')
          .map(item => [item.id, URL.createObjectURL(item.file)])
      ),
    [items]
  )

  useEffect(
    () => () => {
      for (const url of fileUrls.values()) {
        URL.revokeObjectURL(url)
      }
    },
    [fileUrls]
  )

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200/70 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        <FolderDown className="size-4 text-zinc-400" />
        <span>接收文件</span>
      </div>

      {items.length ? (
        <div className="space-y-2">
          {items.map(item => (
            <article
              key={item.id}
              className="rounded-md bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                  {item.type === 'text' ? (
                    <MessageSquareText className="size-4" />
                  ) : (
                    <File className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {getItemDisplayName(item)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatItemSize(item.size)}
                  </p>
                </div>
                {item.type === 'file' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-zinc-400 hover:text-[#44803F]"
                    asChild
                  >
                    <a
                      href={fileUrls.get(item.id)}
                      download={item.name}
                      aria-label="下载"
                    >
                      <Download className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
              {item.type === 'text' ? (
                <div className="mt-2 rounded-md bg-white px-2.5 py-2 dark:bg-zinc-900">
                  <div className="mb-1 flex justify-end">
                    <CopyButton
                      text={item.text}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-normal text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    />
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
                    {item.text}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
          <EmptyState />
        </div>
      )}
    </div>
  )
}

function formatItemSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function getItemDisplayName(item: Share.ListItem) {
  return item.type === 'file' ? item.path || item.name : item.name
}
