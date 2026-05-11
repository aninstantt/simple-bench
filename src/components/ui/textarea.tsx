import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base caret-muted-foreground transition-[color,box-shadow] outline-none placeholder:text-[13px] placeholder:text-zinc-400 focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/35',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
