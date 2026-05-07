import Pusher, { type Channel, type PresenceChannel } from 'pusher-js'

export const PUSHER_CHANNEL_NAME = 'presence-share'
export const PUSHER_MESSAGE_EVENT = 'share-message'

export type PusherConnectionState =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'unavailable'
  | 'failed'
  | 'disconnected'

export type PusherSubscriptionState = 'pending' | 'subscribed' | 'error'

export type SharePusherMessage = {
  id: string
  text: string
  senderId: string
  createdAt: string
}

export type SharePusherMember = {
  id: string
  name: string
}

type SendMessageInput = {
  text: string
  senderId?: string
  channelName?: string
}

type SendMessageResponse = {
  message: SharePusherMessage
}

let pusherClient: Pusher | null = null
const channels = new Map<string, Channel>()

export function connectPusher() {
  if (pusherClient) {
    return pusherClient
  }

  const key = import.meta.env.VITE_PUSHER_KEY
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER

  if (!key || !cluster) {
    throw new Error('Missing VITE_PUSHER_KEY or VITE_PUSHER_CLUSTER')
  }

  pusherClient = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: '/api/pusher-auth',
      transport: 'ajax',
      params: {
        user_id: getDefaultSenderId(),
        user_name: getDefaultSenderName()
      }
    }
  })

  return pusherClient
}

export function disconnectPusher() {
  channels.clear()
  pusherClient?.disconnect()
  pusherClient = null
}

export function getPusherConnectionState() {
  return (pusherClient?.connection.state ||
    'initialized') as PusherConnectionState
}

export function listenToPusherConnection(
  listener: (state: PusherConnectionState) => void
) {
  const pusher = connectPusher()
  const stateChangeHandler = (state: { current: PusherConnectionState }) => {
    listener(state.current)
  }

  listener(pusher.connection.state as PusherConnectionState)
  pusher.connection.bind('state_change', stateChangeHandler)

  return () => {
    pusher.connection.unbind('state_change', stateChangeHandler)
  }
}

export function listenToPusherMessages(
  listener: (message: SharePusherMessage) => void,
  channelName = PUSHER_CHANNEL_NAME
) {
  const channel = getChannel(channelName)
  const messageHandler = (message: SharePusherMessage) => {
    listener(message)
  }

  channel.bind(PUSHER_MESSAGE_EVENT, messageHandler)

  return () => {
    channel.unbind(PUSHER_MESSAGE_EVENT, messageHandler)
  }
}

export function listenToPusherSubscription(
  listener: (state: PusherSubscriptionState) => void,
  channelName = PUSHER_CHANNEL_NAME
) {
  const channel = getChannel(channelName)
  const successHandler = () => {
    listener('subscribed')
  }
  const errorHandler = () => {
    listener('error')
  }

  listener(channel.subscribed ? 'subscribed' : 'pending')
  channel.bind('pusher:subscription_succeeded', successHandler)
  channel.bind('pusher:subscription_error', errorHandler)

  return () => {
    channel.unbind('pusher:subscription_succeeded', successHandler)
    channel.unbind('pusher:subscription_error', errorHandler)
  }
}

export function listenToPusherMembers(
  listener: (members: SharePusherMember[]) => void,
  channelName = PUSHER_CHANNEL_NAME
) {
  const channel = getPresenceChannel(channelName)
  const updateMembers = () => {
    listener(getPusherMembers(channel))
  }

  updateMembers()
  channel.bind('pusher:subscription_succeeded', updateMembers)
  channel.bind('pusher:member_added', updateMembers)
  channel.bind('pusher:member_removed', updateMembers)

  return () => {
    channel.unbind('pusher:subscription_succeeded', updateMembers)
    channel.unbind('pusher:member_added', updateMembers)
    channel.unbind('pusher:member_removed', updateMembers)
  }
}

export async function sendPusherMessage({
  text,
  senderId = getDefaultSenderId(),
  channelName = PUSHER_CHANNEL_NAME
}: SendMessageInput) {
  const response = await fetch('/api/pusher-send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ channelName, senderId, text })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'Failed to send Pusher message')
  }

  const data = (await response.json()) as SendMessageResponse
  return data.message
}

function getChannel(channelName: string) {
  const existingChannel = channels.get(channelName)

  if (existingChannel) {
    return existingChannel
  }

  const channel = connectPusher().subscribe(channelName)
  channels.set(channelName, channel)

  return channel
}

function getPresenceChannel(channelName: string) {
  return getChannel(channelName) as PresenceChannel
}

function getPusherMembers(channel: PresenceChannel) {
  const members: SharePusherMember[] = []

  channel.members.each((member: { id: string; info?: { name?: string } }) => {
    members.push({
      id: member.id,
      name: member.info?.name || member.id
    })
  })

  return members.sort((a, b) => a.name.localeCompare(b.name))
}

function getDefaultSenderId() {
  const storageKey = 'simple-bench-pusher-sender-id'
  const existingSenderId = window.localStorage.getItem(storageKey)

  if (existingSenderId) {
    return existingSenderId
  }

  const senderId = crypto.randomUUID()
  window.localStorage.setItem(storageKey, senderId)

  return senderId
}

function getDefaultSenderName() {
  const senderId = getDefaultSenderId()
  return `Member ${senderId.slice(0, 8)}`
}
