export function getSubscriptionStateText(
  connectionState: Share.PusherConnectionState,
  subscriptionState: Share.PusherSubscriptionState
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

export function getRealtimeStatus(
  connectionState: Share.PusherConnectionState,
  subscriptionState: Share.PusherSubscriptionState
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

export function getRealtimeStatusClassName(
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

export function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value))
}

export function getMessageSenderName(
  message: Share.PusherMessage,
  members: Share.PusherMember[]
) {
  return (
    message.senderName ||
    members.find(member => member.id === message.senderId)?.name ||
    message.senderId
  )
}
