'use client'

import type { ReactNode } from 'react'

import { CheckCheck } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type ConfirmPopoverProps = {
  title?: string
  trigger: ReactNode
  onConfirm: () => void

  open?: boolean
  onOpenChange?: (open: boolean) => void

  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'

  popoverClassName?: string
}

export function ConfirmPopover({
  title = '请确认',
  trigger,
  onConfirm,
  open,
  onOpenChange,
  side = 'left',
  align = 'center',
  popoverClassName
}: ConfirmPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className={cn(
          'w-auto min-w-16 border-zinc-200 bg-white text-zinc-600 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.18)] dark:border-zinc-600 dark:bg-zinc-600 dark:text-zinc-50',
          popoverClassName
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <PopoverTitle className="text-xs font-normal text-zinc-600 dark:text-zinc-300">
              {title}
            </PopoverTitle>
            <PopoverDescription className="sr-only">
              Confirm action
            </PopoverDescription>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            aria-label="Confirm"
            className="inline-flex size-6 items-center justify-center rounded-lg bg-zinc-100 text-(--my-red-1) transition-colors hover:bg-zinc-200 active:scale-[0.98] dark:bg-zinc-600/60 dark:hover:bg-zinc-600"
          >
            <CheckCheck className="size-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
