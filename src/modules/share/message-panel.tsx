import {
  CircleAlert,
  LoaderCircle,
  MessageCircleMore,
  Send,
  Wifi
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { MessageList } from './message-list'
import {
  getRealtimeStatus,
  getRealtimeStatusClassName,
  getSubscriptionStateText
} from './status'

type MessagePanelProps = {
  connectionState: Share.PusherConnectionState
  currentSenderId: string
  error: string
  input: string
  members: Share.PusherMember[]
  messages: Share.PusherMessage[]
  onInputChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  sending: boolean
  subscribed: boolean
  subscriptionState: Share.PusherSubscriptionState
}

export function MessagePanel({
  connectionState,
  currentSenderId,
  error,
  input,
  members,
  messages,
  onInputChange,
  onSubmit,
  sending,
  subscribed,
  subscriptionState
}: MessagePanelProps) {
  const realtimeStatus = getRealtimeStatus(connectionState, subscriptionState)

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/30">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        <MessageCircleMore className="size-4 text-zinc-400" />
        <span>频道房间</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
              getRealtimeStatusClassName(realtimeStatus)
            )}
          >
            {realtimeStatus === 'ready' ? (
              <Wifi className="size-4" />
            ) : realtimeStatus === 'error' ? (
              <CircleAlert className="size-4" />
            ) : (
              <LoaderCircle className="size-4 animate-spin" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-normal text-zinc-500 dark:text-zinc-400">
              {getSubscriptionStateText(connectionState, subscriptionState)}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <Textarea
          className="min-h-24 resize-none text-[13px] leading-relaxed"
          placeholder="输入消息"
          value={input}
          onChange={event => onInputChange(event.target.value)}
        />
        <Button
          type="submit"
          className="h-10 w-full bg-[#44803F] text-white hover:bg-[#44803F]/90"
          disabled={sending || !subscribed}
        >
          {sending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          发送
        </Button>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200/70 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <MessageList
        currentSenderId={currentSenderId}
        members={members}
        messages={messages}
      />
    </div>
  )
}
