import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import AnimatedTypingMotion from '@/components/shadcn-space/animated-text/animated-text-03'

const HOME_COPY =
  '这是一个装在浏览器里的离线工具箱🧰，断网也能用🛜，数据只存在你自己的设备上🔒'

const TYPING_DURATION_MS = HOME_COPY.length * 20 + 200

export function HomePage() {
  const [showPoweredBy, setShowPoweredBy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowPoweredBy(true), TYPING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<Home className="size-4" />} title="主页" />

        <div className="rounded-[12px] border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-600 dark:bg-zinc-600">
          <AnimatedTypingMotion
            words={[HOME_COPY]}
            stepMs={20}
            loop={false}
            className="text-sm leading-6 text-zinc-700 dark:text-zinc-100"
          />
          <p
            className={`mt-4 text-right text-xs text-zinc-400 transition-opacity duration-500 ${showPoweredBy ? 'opacity-100' : 'opacity-0'}`}
          >
            Built with{' '}
            <a
              href="https://viteplus.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Vite+
            </a>
          </p>
        </div>
      </section>
    </WithLoading>
  )
}
