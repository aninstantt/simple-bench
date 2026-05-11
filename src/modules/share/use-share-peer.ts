import Peer, { type DataConnection } from 'peerjs'
import { useEffect, useRef, useState } from 'react'

import { getDefaultSenderId, getDefaultSenderName } from './identity'

type SharePeerState = {
  cancelTransfer: (transferId: string) => void
  clearTransferProgress: () => void
  error: string
  incomingProgress: Share.TransferProgress | null
  incomingTransfer: Share.IncomingTransferRequest | null
  outgoingTransfer: Share.TransferProgress | null
  peerId: string
  reconnect: () => void
  respondToTransfer: (accepted: boolean) => void
  sendTransfer: (member: Share.PusherMember, items: Share.ListItem[]) => void
  state: Share.PeerConnectionState
}

const initialPeerState: SharePeerState = {
  cancelTransfer: () => {},
  clearTransferProgress: () => {},
  error: '',
  incomingProgress: null,
  incomingTransfer: null,
  outgoingTransfer: null,
  peerId: getDefaultSenderId(),
  reconnect: () => {},
  respondToTransfer: () => {},
  sendTransfer: () => {},
  state: 'idle'
}

export function useSharePeer(
  enabled: boolean,
  onItemsReceived?: (items: Share.ListItem[]) => void
) {
  const [peerState, setPeerState] = useState<SharePeerState>(initialPeerState)
  const onItemsReceivedRef = useRef(onItemsReceived)
  const peerRef = useRef<Peer | null>(null)
  const [reconnectToken, setReconnectToken] = useState(0)
  const cancelledTransfersRef = useRef(new Set<string>())
  const transferConnectionsRef = useRef(new Map<string, DataConnection>())

  useEffect(() => {
    onItemsReceivedRef.current = onItemsReceived
  }, [onItemsReceived])

  useEffect(() => {
    if (!enabled) {
      peerRef.current?.destroy()
      peerRef.current = null
      cancelledTransfersRef.current.clear()
      transferConnectionsRef.current.clear()
      setPeerState(currentState => ({
        ...currentState,
        error: '',
        incomingProgress: null,
        incomingTransfer: null,
        outgoingTransfer: null,
        state: 'idle'
      }))
      return
    }

    const peer = connectPeer()

    setPeerState(currentState => ({
      ...currentState,
      error: '',
      peerId: peer.id || getDefaultSenderId(),
      state: 'connecting'
    }))

    return () => {
      peer.destroy()
      peerRef.current = null
      cancelledTransfersRef.current.clear()
      transferConnectionsRef.current.clear()
    }
  }, [enabled, reconnectToken])

  function connectPeer() {
    const peerId = getDefaultSenderId()
    const peer = new Peer(peerId)
    peerRef.current = peer

    peer.on('open', id => {
      setPeerState(currentState => ({
        ...currentState,
        error: '',
        peerId: id,
        state: 'connected'
      }))
    })

    peer.on('error', error => {
      setPeerState(currentState => ({
        ...currentState,
        error: getPeerErrorMessage(error.message),
        peerId,
        state: 'error'
      }))
    })

    peer.on('connection', connection => {
      connection.on('data', data => {
        if (isTransferCancelMessage(data)) {
          handleTransferCancelled(data.transferId)
          connection.close()
          return
        }

        if (isTransferItemMessage(data)) {
          if (isIncomingTransferCancelled(data.transferId)) {
            return
          }

          const receivedItem = createReceivedListItem(data)

          if (receivedItem) {
            onItemsReceivedRef.current?.([receivedItem])
          }

          updateIncomingTransferCount(data.transferId)
          return
        }

        if (!isTransferRequestMessage(data)) {
          return
        }

        transferConnectionsRef.current.set(data.transferId, connection)
        setPeerState(currentState => ({
          ...currentState,
          incomingTransfer: {
            connectionId: connection.connectionId,
            itemCount: data.itemCount,
            items: data.items,
            senderId: data.senderId,
            senderName: data.senderName,
            transferId: data.transferId
          }
        }))
      })
    })

    return peer
  }

  function reconnect() {
    peerRef.current?.destroy()
    peerRef.current = null
    cancelledTransfersRef.current.clear()
    transferConnectionsRef.current.clear()
    setPeerState(currentState => ({
      ...currentState,
      error: '',
      incomingProgress: null,
      incomingTransfer: null,
      outgoingTransfer: null,
      state: 'connecting'
    }))
    setReconnectToken(currentToken => currentToken + 1)
  }

  function sendTransfer(member: Share.PusherMember, items: Share.ListItem[]) {
    const peer = peerRef.current

    if (!peer || peerState.state !== 'connected' || !items.length) {
      return
    }

    const transferId = crypto.randomUUID()
    const connection = peer.connect(member.peerId, {
      label: 'share-transfer',
      reliable: true
    })
    transferConnectionsRef.current.set(transferId, connection)

    setPeerState(currentState => ({
      ...currentState,
      outgoingTransfer: {
        direction: 'outgoing',
        itemCount: items.length,
        peerName: member.name,
        processedCount: 0,
        status: 'connecting',
        transferId
      }
    }))

    connection.on('error', () => {
      transferConnectionsRef.current.delete(transferId)
      setOutgoingTransferStatus(transferId, 'error')
    })

    connection.on('open', () => {
      if (cancelledTransfersRef.current.has(transferId)) {
        connection.close()
        return
      }

      setOutgoingTransferStatus(transferId, 'waiting')
      void connection.send({
        type: 'share-transfer-request',
        transferId,
        senderId: getDefaultSenderId(),
        senderName: getDefaultSenderName(),
        itemCount: items.length,
        items: items.map(createTransferItemMeta)
      })
    })

    connection.on('data', data => {
      if (cancelledTransfersRef.current.has(transferId)) {
        return
      }

      if (!isTransferResponseMessage(data)) {
        return
      }

      if (!data.accepted || data.transferId !== transferId) {
        setOutgoingTransferStatus(
          transferId,
          data.accepted ? 'error' : 'declined'
        )
        connection.close()
        transferConnectionsRef.current.delete(transferId)
        return
      }

      setOutgoingTransferStatus(transferId, 'transferring')

      void sendTransferItems(transferId, connection, items)
    })
  }

  async function sendTransferItems(
    transferId: string,
    connection: DataConnection,
    items: Share.ListItem[]
  ) {
    for (const item of items) {
      if (cancelledTransfersRef.current.has(transferId)) {
        return
      }

      try {
        await connection.send(createTransferDataMessage(transferId, item))
        updateOutgoingTransferCount(transferId, items.length)
      } catch {
        transferConnectionsRef.current.delete(transferId)
        setOutgoingTransferStatus(transferId, 'error')
        return
      }

      await new Promise<void>(resolve => setTimeout(resolve, 0))
    }
  }

  function respondToTransfer(accepted: boolean) {
    const incomingTransfer = peerState.incomingTransfer

    if (!incomingTransfer) {
      return
    }

    const connection = transferConnectionsRef.current.get(
      incomingTransfer.transferId
    )

    if (accepted) {
      setPeerState(currentState => ({
        ...currentState,
        incomingProgress: {
          direction: 'incoming',
          itemCount: incomingTransfer.itemCount,
          peerName: incomingTransfer.senderName,
          processedCount: 0,
          status: 'transferring',
          transferId: incomingTransfer.transferId
        }
      }))
    }

    void connection?.send({
      type: 'share-transfer-response',
      transferId: incomingTransfer.transferId,
      accepted
    })

    if (!accepted) {
      connection?.close()
      transferConnectionsRef.current.delete(incomingTransfer.transferId)
    }

    setPeerState(currentState => ({
      ...currentState,
      incomingTransfer: null
    }))
  }

  function clearTransferProgress() {
    cancelledTransfersRef.current.clear()
    setPeerState(currentState => ({
      ...currentState,
      incomingProgress: null,
      outgoingTransfer: null
    }))
  }

  function cancelTransfer(transferId: string) {
    cancelledTransfersRef.current.add(transferId)

    const connection = transferConnectionsRef.current.get(transferId)

    void Promise.resolve(
      connection?.send({
        type: 'share-transfer-cancel',
        transferId
      })
    )
      .catch(() => {
        // Connection may already be closed; the local cancelled state still wins.
      })
      .finally(() => {
        connection?.close()
      })

    transferConnectionsRef.current.delete(transferId)

    setPeerState(currentState => ({
      ...currentState,
      outgoingTransfer:
        currentState.outgoingTransfer?.transferId === transferId
          ? {
              ...currentState.outgoingTransfer,
              status: 'cancelled'
            }
          : currentState.outgoingTransfer,
      incomingProgress:
        currentState.incomingProgress?.transferId === transferId
          ? {
              ...currentState.incomingProgress,
              status: 'cancelled'
            }
          : currentState.incomingProgress,
      incomingTransfer:
        currentState.incomingTransfer?.transferId === transferId
          ? null
          : currentState.incomingTransfer
    }))
  }

  function handleTransferCancelled(transferId: string) {
    cancelledTransfersRef.current.add(transferId)
    transferConnectionsRef.current.delete(transferId)

    setPeerState(currentState => ({
      ...currentState,
      incomingTransfer:
        currentState.incomingTransfer?.transferId === transferId
          ? null
          : currentState.incomingTransfer,
      incomingProgress: getCancelledIncomingProgress(currentState, transferId),
      outgoingTransfer:
        currentState.outgoingTransfer?.transferId === transferId
          ? {
              ...currentState.outgoingTransfer,
              status: 'cancelled'
            }
          : currentState.outgoingTransfer
    }))
  }

  function isIncomingTransferCancelled(transferId: string) {
    return cancelledTransfersRef.current.has(transferId)
  }

  function getCancelledIncomingProgress(
    currentState: SharePeerState,
    transferId: string
  ) {
    if (currentState.incomingProgress?.transferId === transferId) {
      return {
        ...currentState.incomingProgress,
        status: 'cancelled' as const
      }
    }

    if (currentState.incomingTransfer?.transferId === transferId) {
      return {
        direction: 'incoming' as const,
        itemCount: currentState.incomingTransfer.itemCount,
        peerName: currentState.incomingTransfer.senderName,
        processedCount: 0,
        status: 'cancelled' as const,
        transferId
      }
    }

    return currentState.incomingProgress
  }

  function setOutgoingTransferStatus(
    transferId: string,
    status: Share.TransferProgress['status']
  ) {
    setPeerState(currentState => ({
      ...currentState,
      outgoingTransfer:
        currentState.outgoingTransfer?.transferId === transferId
          ? {
              ...currentState.outgoingTransfer,
              status:
                currentState.outgoingTransfer.status === 'cancelled'
                  ? 'cancelled'
                  : status
            }
          : currentState.outgoingTransfer
    }))
  }

  function updateOutgoingTransferCount(transferId: string, itemCount: number) {
    setPeerState(currentState => {
      const currentTransfer = currentState.outgoingTransfer

      if (currentTransfer?.transferId !== transferId) {
        return currentState
      }

      if (currentTransfer.status === 'cancelled') {
        return currentState
      }

      const processedCount = Math.min(
        currentTransfer.processedCount + 1,
        itemCount
      )

      return {
        ...currentState,
        outgoingTransfer: {
          ...currentTransfer,
          processedCount,
          status:
            processedCount >= currentTransfer.itemCount
              ? 'completed'
              : 'transferring'
        }
      }
    })
  }

  function updateIncomingTransferCount(transferId: string) {
    setPeerState(currentState => {
      const currentTransfer = currentState.incomingProgress

      if (currentTransfer?.transferId !== transferId) {
        return currentState
      }

      if (currentTransfer.status === 'cancelled') {
        return currentState
      }

      const processedCount = Math.min(
        currentTransfer.processedCount + 1,
        currentTransfer.itemCount
      )

      return {
        ...currentState,
        incomingProgress: {
          ...currentTransfer,
          processedCount,
          status:
            processedCount >= currentTransfer.itemCount
              ? 'completed'
              : 'transferring'
        }
      }
    })
  }

  return {
    ...peerState,
    cancelTransfer,
    clearTransferProgress,
    reconnect,
    respondToTransfer,
    sendTransfer
  }
}

type TransferRequestMessage = {
  itemCount: number
  items: Share.TransferItemMeta[]
  senderId: string
  senderName: string
  transferId: string
  type: 'share-transfer-request'
}

type TransferResponseMessage = {
  accepted: boolean
  transferId: string
  type: 'share-transfer-response'
}

type TransferItemMessage = {
  data: unknown
  item: Share.TransferItemMeta
  transferId: string
  type: 'share-transfer-item'
}

type TransferCancelMessage = {
  transferId: string
  type: 'share-transfer-cancel'
}

function createTransferItemMeta(item: Share.ListItem): Share.TransferItemMeta {
  return {
    id: item.id,
    name: item.name,
    path: item.type === 'file' ? item.path : undefined,
    size: item.size,
    type: item.type
  }
}

function createTransferDataMessage(transferId: string, item: Share.ListItem) {
  return {
    type: 'share-transfer-item',
    transferId,
    item: createTransferItemMeta(item),
    data: item.type === 'file' ? item.file : item.text
  }
}

function isTransferRequestMessage(
  data: unknown
): data is TransferRequestMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'share-transfer-request'
  )
}

function isTransferResponseMessage(
  data: unknown
): data is TransferResponseMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'share-transfer-response'
  )
}

function isTransferItemMessage(data: unknown): data is TransferItemMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'share-transfer-item' &&
    'item' in data &&
    'data' in data
  )
}

function isTransferCancelMessage(data: unknown): data is TransferCancelMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'share-transfer-cancel' &&
    'transferId' in data
  )
}

function createReceivedListItem(
  message: TransferItemMessage
): Share.ListItem | null {
  const createdAt = new Date().toISOString()

  if (message.item.type === 'text') {
    if (typeof message.data !== 'string') {
      return null
    }

    return {
      id: crypto.randomUUID(),
      type: 'text',
      name: message.item.name,
      text: message.data,
      size: new Blob([message.data]).size,
      createdAt
    }
  }

  const file = createReceivedFile(message.data, message.item.name)

  if (!file) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    file,
    type: 'file',
    name: message.item.name,
    path: message.item.path,
    size: message.item.size,
    createdAt
  }
}

function createReceivedFile(data: unknown, name: string) {
  if (data instanceof File) {
    return data
  }

  if (data instanceof Blob) {
    return new File([data], name)
  }

  if (data instanceof ArrayBuffer) {
    return new File([data], name)
  }

  if (ArrayBuffer.isView(data)) {
    const buffer = new ArrayBuffer(data.byteLength)
    new Uint8Array(buffer).set(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    )
    return new File([new DataView(buffer)], name)
  }

  return null
}

function getPeerErrorMessage(message: string) {
  if (message.startsWith('Could not connect to peer')) {
    return 'Could not connect to transfer channel'
  }

  return message
}
