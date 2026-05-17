import {
  DoorOpen,
  FileSpreadsheet,
  FolderDown,
  MessageCircleMore,
  Radio,
  UsersRound,
  X
} from 'lucide-react'
import { useState } from 'react'

import { ColorButton } from '@/components/custom/color-button'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import Button05 from '@/components/shadcn-space/button/button-05'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { getDefaultSenderId, getDefaultSenderName } from './identity'
import { MemberList } from './member-list'
import { MessagePanel } from './message-panel'
import { ReceivedListPanel } from './received-list-panel'
import { ShareListPanel } from './share-list-panel'
import { useSharePeer } from './use-share-peer'
import { useShareRealtime } from './use-share-realtime'

export function SharePage() {
  const [input, setInput] = useState('')
  const [receivedItems, setReceivedItems] = useState<Share.ListItem[]>([])
  const [senderId] = useState(() => getDefaultSenderId())
  const [senderName] = useState(() => getDefaultSenderName())
  const [shareItems, setShareItems] = useState<Share.ListItem[]>([])
  const [showMembers, setShowMembers] = useState(false)
  const [showMessages, setShowMessages] = useState(true)
  const [showReceivedList, setShowReceivedList] = useState(false)
  const [showShareList, setShowShareList] = useState(false)
  const {
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
  } = useShareRealtime()
  const peerState = useSharePeer(!shouldShowJoin, items => {
    setReceivedItems(currentItems => [...items, ...currentItems])
    setShowReceivedList(true)
  })

  const transferProgress =
    peerState.outgoingTransfer || peerState.incomingProgress

  function handleJoin() {
    setInput('')
    setShowMembers(false)
    setShowMessages(true)
    setShowReceivedList(false)
    setShowShareList(false)
    joinRoom()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sent = await submitMessage(input)

    if (sent) {
      setInput('')
    }
  }

  function handleSendTransfer(member: Share.PusherMember) {
    peerState.sendTransfer(member, shareItems)
  }

  function handleTransferResponse(accepted: boolean) {
    if (accepted) {
      setShowMembers(true)
      setShowShareList(true)
    }

    peerState.respondToTransfer(accepted)
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
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#44803F]/15 bg-[#44803F]/8 px-2.5 py-1 text-xs font-normal text-[#44803F] dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <span className="shrink-0 text-[#44803F]/70 dark:text-emerald-300/70">
                    (You)
                  </span>
                  <span className="min-w-0 truncate">{senderName}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ColorButton
                  type="yellow2"
                  gray={!showMembers}
                  onClick={() => setShowMembers(value => !value)}
                  className="h-9 w-auto px-3"
                  aria-label="在线成员"
                >
                  <UsersRound className="size-3.5" />
                </ColorButton>
                <ColorButton
                  type="green2"
                  gray={!showShareList}
                  onClick={() => setShowShareList(value => !value)}
                  className="h-9 w-auto px-3"
                  aria-label="文件列表"
                >
                  <FileSpreadsheet className="size-3.5" />
                </ColorButton>
                <ColorButton
                  type="blue2"
                  gray={!showReceivedList}
                  onClick={() => setShowReceivedList(value => !value)}
                  className="h-9 w-auto px-3"
                  aria-label="接收文件"
                >
                  <FolderDown className="size-3.5" />
                </ColorButton>
                <ColorButton
                  type="purple2"
                  gray={!showMessages}
                  onClick={() => setShowMessages(value => !value)}
                  className="h-9 w-auto px-3"
                  aria-label="消息"
                >
                  <MessageCircleMore className="size-3.5" />
                </ColorButton>
              </div>
            </div>

            {showMembers ? (
              <div className="relative">
                <div
                  className={cn(
                    transferProgress
                      ? 'pointer-events-none opacity-50 transition-opacity'
                      : 'transition-opacity'
                  )}
                >
                  <MemberList
                    currentPeerId={peerState.peerId}
                    hasShareItems={
                      shareItems.length > 0 &&
                      peerState.state === 'connected' &&
                      !transferProgress
                    }
                    members={members}
                    onSend={handleSendTransfer}
                  />
                </div>
                {transferProgress ? (
                  <TransferProgressOverlay
                    onCancel={peerState.cancelTransfer}
                    onDone={peerState.clearTransferProgress}
                    progress={transferProgress}
                  />
                ) : null}
              </div>
            ) : null}
            <div className={showShareList ? undefined : 'hidden'}>
              <ShareListPanel
                items={shareItems}
                onPeerReconnect={peerState.reconnect}
                peerError={peerState.error}
                peerState={peerState.state}
                setItems={setShareItems}
              />
            </div>
            {showReceivedList ? (
              <ReceivedListPanel items={receivedItems} />
            ) : null}

            {showMessages ? (
              <MessagePanel
                connectionState={connectionState}
                currentSenderId={senderId}
                error={error}
                input={input}
                members={members}
                messages={messages}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                sending={sending}
                subscribed={subscribed}
                subscriptionState={subscriptionState}
              />
            ) : null}
            <TransferRequestDialog
              request={peerState.incomingTransfer}
              onRespond={handleTransferResponse}
            />
          </>
        )}
      </section>
    </WithLoading>
  )
}

function TransferProgressOverlay({
  onCancel,
  onDone,
  progress
}: {
  onCancel: (transferId: string) => void
  onDone: () => void
  progress: Share.TransferProgress
}) {
  const canCancelTransfer =
    progress.direction === 'outgoing' &&
    !isTerminalTransferStatus(progress.status)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const shouldShowAction =
    canCancelTransfer || isTerminalTransferStatus(progress.status)
  const shouldConfirmAction =
    progress.status !== 'completed' &&
    progress.status !== 'cancelled' &&
    progress.status !== 'declined'
  const progressValue =
    progress.itemCount > 0
      ? Math.round((progress.processedCount / progress.itemCount) * 100)
      : 0
  const actionButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      onClick={shouldConfirmAction ? undefined : handleProgressAction}
      aria-label={canCancelTransfer ? '取消传输' : '关闭传输提示'}
    >
      <X className="size-3.5" />
    </Button>
  )

  function handleProgressAction() {
    if (canCancelTransfer) {
      onCancel(progress.transferId)
      return
    }

    onDone()
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-zinc-200/70 bg-white/65 p-4 backdrop-blur-[1px] dark:border-zinc-700/60 dark:bg-zinc-900/70">
      {shouldShowAction && shouldConfirmAction ? (
        <ConfirmPopover
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => {
            setConfirmOpen(false)
            handleProgressAction()
          }}
          trigger={actionButton}
        />
      ) : shouldShowAction ? (
        actionButton
      ) : null}
      <div className="w-full max-w-xs space-y-2 text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {getTransferProgressText(progress)}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-[#44803F] transition-all"
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {progress.processedCount}/{progress.itemCount}
        </p>
        {getTransferProgressHint(progress) ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {getTransferProgressHint(progress)}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function isTerminalTransferStatus(status: Share.TransferProgress['status']) {
  return (
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'declined' ||
    status === 'error'
  )
}

function getTransferProgressText(progress: Share.TransferProgress) {
  if (progress.direction === 'incoming') {
    if (progress.status === 'cancelled') {
      return `${progress.peerName} 已取消传输`
    }

    if (progress.status === 'completed') {
      return `已接收 ${progress.peerName} 的 ${progress.itemCount} 个文件`
    }

    return `正在接收 ${progress.peerName} 的 ${progress.itemCount} 个文件`
  }

  if (progress.status === 'waiting') {
    return `正在等待 ${progress.peerName} 接受 ${progress.itemCount} 个文件`
  }

  if (progress.status === 'declined') {
    return `${progress.peerName} 已拒绝接收`
  }

  if (progress.status === 'cancelled') {
    return `已取消发送给 ${progress.peerName}`
  }

  if (progress.status === 'completed') {
    return `已发送给 ${progress.peerName} ${progress.itemCount} 个文件`
  }

  if (progress.status === 'error') {
    return `发送给 ${progress.peerName} 失败`
  }

  return `正在发送给 ${progress.peerName} ${progress.itemCount} 个文件`
}

function getTransferProgressHint(progress: Share.TransferProgress) {
  if (progress.status === 'cancelled') {
    return progress.direction === 'incoming'
      ? '本次传输未完成，未接收的文件不会继续下载'
      : '本次传输已停止，未发送的文件不会继续发送'
  }

  if (progress.status === 'declined') {
    return '本次传输未开始'
  }

  if (progress.status === 'error') {
    return '本次传输未完成，可以稍后重试'
  }

  return ''
}

function TransferRequestDialog({
  onRespond,
  request
}: {
  onRespond: (accepted: boolean) => void
  request: Share.IncomingTransferRequest | null
}) {
  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={open => !open && onRespond(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文件传输</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          是否接受 {request?.senderName ?? ''} 发送的 {request?.itemCount ?? 0}{' '}
          个文件？
        </p>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onRespond(false)}
          >
            拒绝
          </Button>
          <Button
            type="button"
            className="bg-[#44803F] text-white hover:bg-[#44803F]/90"
            onClick={() => onRespond(true)}
          >
            接受
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
