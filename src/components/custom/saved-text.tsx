import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type SavedTextProps = {
  className?: string
  iconClassName?: string
  text?: string
}

export function SavedText({
  className,
  iconClassName,
  text = '已保存'
}: SavedTextProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400',
        className
      )}
    >
      <Check className={cn('size-3 ', iconClassName)} />
      {text}
    </span>
  )
}
