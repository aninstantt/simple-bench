import { SendHorizontal, User, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'

type MemberListProps = {
  currentPeerId: string
  hasShareItems: boolean
  members: Share.PusherMember[]
  onSend: (member: Share.PusherMember) => void
}

export function MemberList({
  currentPeerId,
  hasShareItems,
  members,
  onSend
}: MemberListProps) {
  const visibleMembers = members.filter(
    member => member.peerId !== currentPeerId
  )

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200/70 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        <UsersRound className="size-4 text-zinc-400" />
        <span>用户列表</span>
      </div>
      {visibleMembers.length ? (
        <div className="space-y-2">
          {visibleMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-md bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60"
            >
              <User className="size-3.5 shrink-0 text-zinc-400" />
              <span className="truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">
                {member.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto text-zinc-400 hover:text-[#44803F] disabled:pointer-events-none disabled:text-zinc-300 disabled:opacity-60 dark:disabled:text-zinc-600"
                onClick={() => onSend(member)}
                disabled={!hasShareItems}
                aria-label="发送"
              >
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
          暂无在线成员
        </p>
      )}
    </div>
  )
}
