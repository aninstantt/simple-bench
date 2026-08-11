'use client'

import type { ReactNode } from 'react'

import { CheckCheck } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type StrictConfirmPopoverProps = {
  title?: string
  trigger: ReactNode
  onConfirm: () => void

  open?: boolean
  onOpenChange?: (open: boolean) => void

  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'

  popoverClassName?: string
}

const CONFIRM_WORD = 'confirm'

export function StrictConfirmPopover({
  title = '请输入 confirm 以确认',
  trigger,
  onConfirm,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'end',
  popoverClassName
}: StrictConfirmPopoverProps) {
  const [input, setInput] = useState('')
  const isConfirmed = input.trim().toLowerCase() === CONFIRM_WORD

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
        <div className="space-y-2">
          <div className="min-w-0">
            <PopoverTitle className="text-xs font-normal text-zinc-600 dark:text-zinc-300">
              {title}
            </PopoverTitle>
            <PopoverDescription className="sr-only">
              Type {CONFIRM_WORD} to confirm action
            </PopoverDescription>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={CONFIRM_WORD}
              aria-label="Type confirm to confirm"
              className="h-6 w-24 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-600 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-50 dark:focus:border-zinc-300"
            />
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isConfirmed}
              aria-label="Confirm"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-(--my-red-1) transition-colors hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-100 dark:bg-zinc-600/60 dark:hover:bg-zinc-600 dark:disabled:hover:bg-zinc-600/60"
            >
              <CheckCheck className="size-3.5" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
