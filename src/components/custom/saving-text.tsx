import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

type SavingTextProps = {
  className?: string
  iconClassName?: string
  text?: string
}

export function SavingText({
  className,
  iconClassName,
  text = '保存中'
}: SavingTextProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-zinc-400',
        className
      )}
    >
      <LoaderCircle className={cn('size-3 animate-spin', iconClassName)} />
      {text}
    </span>
  )
}
