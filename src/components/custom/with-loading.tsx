import type { ReactNode } from 'react'

import { LoaderPinwheel } from 'lucide-react'

type WithLoadingProps = {
  loading: boolean
  children: ReactNode
}

export function WithLoading({ loading, children }: WithLoadingProps) {
  return (
    <div className="relative">
      <div
        className={
          loading
            ? 'pointer-events-none opacity-0 transition-opacity duration-200'
            : 'opacity-100 transition-opacity duration-200'
        }
        aria-hidden={loading}
      >
        {children}
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center py-10 text-sm text-zinc-500 dark:text-zinc-400">
          <LoaderPinwheel className="size-5 animate-spin text-gray-300" />
        </div>
      ) : null}
    </div>
  )
}
