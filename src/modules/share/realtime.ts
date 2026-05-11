import Pusher, { type Channel, type PresenceChannel } from 'pusher-js'

import { getDefaultSenderId, getDefaultSenderName } from './identity'

export const PUSHER_CHANNEL_NAME = 'presence-share'
export const PUSHER_MESSAGE_EVENT = 'share-message'

type SendMessageInput = {
  text: string
  senderId?: string
  senderName?: string
  channelName?: string
}

type SendMessageResponse = {
  message: Share.PusherMessage
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
        user_name: getDefaultSenderName(),
        user_peer_id: getDefaultSenderId()
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
    'initialized') as Share.PusherConnectionState
}

export function listenToPusherConnection(
  listener: (state: Share.PusherConnectionState) => void
) {
  const pusher = connectPusher()
  const stateChangeHandler = (state: {
    current: Share.PusherConnectionState
  }) => {
    listener(state.current)
  }

  listener(pusher.connection.state as Share.PusherConnectionState)
  pusher.connection.bind('state_change', stateChangeHandler)

  return () => {
    pusher.connection.unbind('state_change', stateChangeHandler)
  }
}

export function listenToPusherMessages(
  listener: (message: Share.PusherMessage) => void,
  channelName = PUSHER_CHANNEL_NAME
) {
  const channel = getChannel(channelName)
  const messageHandler = (message: Share.PusherMessage) => {
    listener(message)
  }

  channel.bind(PUSHER_MESSAGE_EVENT, messageHandler)

  return () => {
    channel.unbind(PUSHER_MESSAGE_EVENT, messageHandler)
  }
}

export function listenToPusherSubscription(
  listener: (state: Share.PusherSubscriptionState) => void,
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
  listener: (members: Share.PusherMember[]) => void,
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
  senderName = getDefaultSenderName(),
  channelName = PUSHER_CHANNEL_NAME
}: SendMessageInput) {
  const response = await fetch('/api/pusher-send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ channelName, senderId, senderName, text })
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
  const members: Share.PusherMember[] = []

  channel.members.each(
    (member: { id: string; info?: { name?: string; peerId?: string } }) => {
      members.push({
        id: member.id,
        name: member.info?.name || member.id,
        peerId: member.info?.peerId || member.id
      })
    }
  )

  return members.sort((a, b) => a.name.localeCompare(b.name))
}
