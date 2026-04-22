import { useThrottleFn } from '@reactuses/core'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

type CopyButtonProps = {
  text: string
  className?: string
  iconClassName?: string
  showText?: boolean
}

export function CopyButton({
  text,
  className,
  iconClassName = 'size-3',
  showText = false
}: CopyButtonProps) {
  const normalizedText = text.trim()
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  if (!normalizedText) return null

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const { run: onCopy } = useThrottleFn(async () => {
    try {
      await navigator.clipboard.writeText(normalizedText)
      setCopied(true)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        setCopied(false)
        timerRef.current = null
      }, 1500)
    } catch {
      toast.error('复制失败，请手动选中复制', {
        description: normalizedText,
        richColors: true,
        closeButton: true,
        duration: 5000,
        position: 'top-center'
      })
    }
  }, 1000)

  return (
    <button
      type="button"
      onClick={onCopy}
      className={
        className ??
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.97] dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200'
      }
    >
      {copied ? (
        <>
          <Check className={cn(iconClassName, 'text-(--my-red-1)')} />
          {showText && '已复制'}
        </>
      ) : (
        <>
          <Copy className={iconClassName} />
          {showText && '复制'}
        </>
      )}
    </button>
  )
}
