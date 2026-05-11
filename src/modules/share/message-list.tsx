import { MessageCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import { formatMessageTime, getMessageSenderName } from './status'

type MessageListProps = {
  currentSenderId: string
  members: Share.PusherMember[]
  messages: Share.PusherMessage[]
}

export function MessageList({
  currentSenderId,
  members,
  messages
}: MessageListProps) {
  return (
    <div className="space-y-2" aria-live="polite">
      {messages.length ? (
        messages.map(message => {
          const isCurrentSender = message.senderId === currentSenderId
          const senderName = getMessageSenderName(message, members)

          return (
            <article
              key={message.id}
              className="rounded-lg border border-zinc-200/70 bg-white px-3.5 py-3 dark:border-zinc-700/60 dark:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    'flex min-w-0 items-center gap-1.5 text-xs font-medium',
                    isCurrentSender
                      ? 'text-[#44803F] dark:text-emerald-300'
                      : 'text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  <MessageCircle className="size-3.5 shrink-0" />
                  <span className="truncate">{senderName}</span>
                </span>
                <time className="shrink-0 text-xs text-zinc-400">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed break-words text-zinc-800 dark:text-zinc-100">
                {message.text}
              </p>
            </article>
          )
        })
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          暂无消息
        </div>
      )}
    </div>
  )
}
