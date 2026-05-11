import { useEffect, useState } from 'react'

import {
  getPusherConnectionState,
  listenToPusherConnection,
  listenToPusherMembers,
  listenToPusherMessages,
  listenToPusherSubscription,
  sendPusherMessage
} from './realtime'

export function useShareRealtime() {
  const [connectionState, setConnectionState] =
    useState<Share.PusherConnectionState>(() => getPusherConnectionState())
  const [subscriptionState, setSubscriptionState] =
    useState<Share.PusherSubscriptionState>('pending')
  const [messages, setMessages] = useState<Share.PusherMessage[]>([])
  const [members, setMembers] = useState<Share.PusherMember[]>([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const subscribed = subscriptionState === 'subscribed'
  const shouldShowJoin = connectionState === 'initialized'

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

  function joinRoom() {
    setConnectionState('initialized')
    setSubscriptionState('pending')
    setMessages([])
    setMembers([])
    setError('')
    setConnectionState('connecting')
  }

  async function submitMessage(text: string) {
    const trimmedText = text.trim()

    if (!trimmedText) {
      setError('请输入消息')
      return false
    }

    setError('')
    setSending(true)

    try {
      await sendPusherMessage({ text: trimmedText })
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
      return false
    } finally {
      setSending(false)
    }
  }

  return {
    connectionState,
    error,
    joinRoom,
    members,
    messages,
    sending,
    shouldShowJoin,
    submitMessage,
    subscribed,
    subscriptionState
  }
}
