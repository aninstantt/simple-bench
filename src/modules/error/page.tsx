import type { ErrorComponentProps } from '@tanstack/react-router'

import { CopyButton } from '@/components/custom/copy'

export function GlobalErrorPage({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error)
  const hasMessage = message.trim().length > 0

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center justify-center space-y-4 px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-xl tracking-[0.2em] text-foreground/70 uppercase">
        Application Error
      </p>
      <p className="mt-6 text-sm leading-6 text-foreground/50">
        Below is the detailed error message
      </p>

      {hasMessage ? (
        <div className=" w-full rounded-xl bg-foreground/[0.04] px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <pre className="max-h-52 min-w-0 flex-1 overflow-auto text-left text-xs leading-5 [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-foreground/75">
              <code>{message}</code>
            </pre>
            <CopyButton
              text={message}
              className="inline-flex size-7 shrink-0 items-center justify-center self-end rounded-md text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground sm:self-center"
              iconClassName="size-3.5"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
