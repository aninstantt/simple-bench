import {
  DoorOpen,
  CircleAlert,
  LoaderCircle,
  MessageCircle,
  Radio,
  Send,
  UsersRound,
  Wifi
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { ColorButton } from '@/components/custom/color-button'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import Button05 from '@/components/shadcn-space/button/button-05'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  getPusherConnectionState,
  listenToPusherConnection,
  listenToPusherMembers,
  listenToPusherMessages,
  listenToPusherSubscription,
  sendPusherMessage,
  type PusherConnectionState,
  type PusherSubscriptionState,
  type SharePusherMember,
  type SharePusherMessage
} from '@/lib/pusher'
import { cn } from '@/lib/utils'

export function SharePage() {
  const [connectionState, setConnectionState] = useState<PusherConnectionState>(
    () => getPusherConnectionState()
  )
  const [subscriptionState, setSubscriptionState] =
    useState<PusherSubscriptionState>('pending')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<SharePusherMessage[]>([])
  const [members, setMembers] = useState<SharePusherMember[]>([])
  const [showMembers, setShowMembers] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const subscribed = subscriptionState === 'subscribed'
  const shouldShowJoin = connectionState === 'initialized'
  const realtimeStatus = getRealtimeStatus(connectionState, subscriptionState)

  useEffect(() => {
    if (shouldShowJoin) {
      return
    }

    try {
      const removeConnectionListener =
        listenToPusherConnection(setConnectionState)
      const removeSubscriptionListener =
        listenToPusherSubscription(setSubscriptionState)
      const removeMembersListener = listenToPusherMembers(setMembers)
      const removeMessageListener = listenToPusherMessages(message => {
        setMessages(currentMessages => {
          if (currentMessages.some(item => item.id === message.id)) {
            return currentMessages
          }

          return [message, ...currentMessages].slice(0, 20)
        })
      })

      return () => {
        removeConnectionListener()
        removeSubscriptionListener()
        removeMembersListener()
        removeMessageListener()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '实时通道连接失败')
    }
  }, [shouldShowJoin])

  const handleJoin = () => {
    setConnectionState('initialized')
    setSubscriptionState('pending')
    setInput('')
    setMessages([])
    setMembers([])
    setShowMembers(false)
    setError('')
    setConnectionState('connecting')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = input.trim()

    if (!text) {
      setError('请输入消息')
      return
    }

    setError('')
    setSending(true)

    try {
      await sendPusherMessage({ text })
      setInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-5">
        <PageHeader icon={<Radio className="size-4" />} title="互传" />

        {shouldShowJoin ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Button05 onClick={handleJoin} className="h-10 px-4">
              <DoorOpen className="size-4" />
              加入房间
            </Button05>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ColorButton
                type="blue"
                onClick={() => setShowMembers(value => !value)}
                className="h-9 w-auto px-3"
              >
                <UsersRound className="size-3.5" />
              </ColorButton>
            </div>

            {showMembers ? (
              <div className="rounded-lg border border-zinc-200/70 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-900/50">
                {members.length ? (
                  <div className="space-y-2">
                    {members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60"
                      >
                        <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          {member.name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                          {member.id.slice(0, 8)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                    暂无在线成员
                  </p>
                )}
              </div>
            ) : null}

            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/30">
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
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {getSubscriptionStateText(
                        connectionState,
                        subscriptionState
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <form
                className="mt-4 space-y-3"
                onSubmit={e => void handleSubmit(e)}
              >
                <Textarea
                  className="min-h-24 resize-none text-[13px] leading-relaxed"
                  placeholder="输入消息"
                  value={input}
                  onChange={e => setInput(e.target.value)}
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
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200/70 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <div className="space-y-2" aria-live="polite">
              {messages.length ? (
                messages.map(message => (
                  <article
                    key={message.id}
                    className="rounded-lg border border-zinc-200/70 bg-white px-3.5 py-3 dark:border-zinc-700/60 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <MessageCircle className="size-3.5 shrink-0" />
                        <span className="truncate">{message.senderId}</span>
                      </span>
                      <time className="shrink-0 text-xs text-zinc-400">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed break-words text-zinc-800 dark:text-zinc-100">
                      {message.text}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                  暂无消息
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </WithLoading>
  )
}

function getSubscriptionStateText(
  connectionState: PusherConnectionState,
  subscriptionState: PusherSubscriptionState
) {
  const socketText =
    connectionState === 'connected' ? 'Socket connected' : 'Socket pending'

  if (connectionState === 'failed' || connectionState === 'unavailable') {
    return `${socketText} · Channel unavailable`
  }

  switch (subscriptionState) {
    case 'subscribed':
      return `${socketText} · Channel ready`
    case 'error':
      return `${socketText} · Channel auth failed`
    default:
      return `${socketText} · Channel pending`
  }
}

function getRealtimeStatus(
  connectionState: PusherConnectionState,
  subscriptionState: PusherSubscriptionState
) {
  if (
    connectionState === 'failed' ||
    connectionState === 'unavailable' ||
    subscriptionState === 'error'
  ) {
    return 'error'
  }

  if (connectionState === 'connected' && subscriptionState === 'subscribed') {
    return 'ready'
  }

  return 'pending'
}

function getRealtimeStatusClassName(
  state: ReturnType<typeof getRealtimeStatus>
) {
  if (state === 'ready') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
  }

  if (state === 'error') {
    return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
  }

  return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value))
}
