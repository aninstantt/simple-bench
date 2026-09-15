import { cn } from '@/lib/utils'

type RevealHintProps = {
  desktop?: string
  className?: string
}

export function RevealHint({ desktop, className }: RevealHintProps) {
  return (
    <span
      className={cn(
        'ml-auto self-end text-xs text-zinc-400 dark:text-zinc-500',
        className
      )}
    >
      <span className="sm:hidden">长按显示操作</span>
      {desktop ? <span className="hidden sm:inline">{desktop}</span> : null}
    </span>
  )
}
