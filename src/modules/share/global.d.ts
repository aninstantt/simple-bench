declare global {
  namespace Share {
    type PusherConnectionState =
      | 'initialized'
      | 'connecting'
      | 'connected'
      | 'unavailable'
      | 'failed'
      | 'disconnected'

    type PusherSubscriptionState = 'pending' | 'subscribed' | 'error'

    type PusherMessage = {
      id: string
      text: string
      senderId: string
      senderName?: string
      createdAt: string
    }

    type PusherMember = {
      id: string
      name: string
      peerId: string
    }

    type PeerConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

    type TransferItemMeta = {
      id: string
      name: string
      path?: string
      size: number
      type: ListItem['type']
    }

    type IncomingTransferRequest = {
      connectionId: string
      itemCount: number
      items: TransferItemMeta[]
      senderId: string
      senderName: string
      transferId: string
    }

    type TransferProgress = {
      direction: 'incoming' | 'outgoing'
      itemCount: number
      peerName: string
      processedCount: number
      status:
        | 'connecting'
        | 'waiting'
        | 'transferring'
        | 'completed'
        | 'cancelled'
        | 'declined'
        | 'error'
      transferId: string
    }

    type ListItem =
      | {
          id: string
          file: File
          type: 'file'
          name: string
          size: number
          path?: string
          createdAt: string
        }
      | {
          id: string
          type: 'text'
          name: string
          text: string
          size: number
          createdAt: string
        }
  }
}

export {}
