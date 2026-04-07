import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { GithubIcon } from '@/components/animated-icons/github'
import { MapPinHouseIcon } from '@/components/animated-icons/map-pin-house'
import { WrenchIcon } from '@/components/animated-icons/wrench'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import AnimatedTypingMotion from '@/components/shadcn-space/animated-text/animated-text-03'

const HOME_COPY =
  '这是一个装在浏览器里的离线工具箱🧰，断网也能用🛜，数据只存在你自己的设备上🔒'
const VITE_PLUS_URL = 'https://viteplus.dev/'
const GITHUB_URL = 'https://github.com/aninstantt/simple-bench'
const PERSONAL_HOME_URL = 'https://goyave.space'

const TYPING_DURATION_MS = HOME_COPY.length * 20 + 200

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function HomePage() {
  const [showPoweredBy, setShowPoweredBy] = useState(false)
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowPoweredBy(true), TYPING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<Home className="size-4" />} title="主页" />

        <div className="rounded-[12px] border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-600 dark:bg-zinc-600">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <AnimatedTypingMotion
              words={[HOME_COPY]}
              stepMs={20}
              loop={false}
              className="text-sm leading-6 text-zinc-700 dark:text-zinc-100"
            />
            <div
              className={`text-sm transition-opacity duration-500 ${showPoweredBy ? 'opacity-100' : 'opacity-0'}`}
            >
              {installPrompt ? (
                <>
                  点击{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-1"
                    onClick={async () => {
                      const prompt = installPrompt
                      if (!prompt) return
                      await prompt.prompt()
                      await prompt.userChoice
                      setInstallPrompt(null)
                    }}
                  >
                    安装
                  </Button>{' '}
                  添加到桌面
                </>
              ) : null}
            </div>
          </div>
          <div
            className={`mt-4 flex w-full flex-col items-end gap-2 text-xs text-zinc-400 transition-opacity duration-500 ${showPoweredBy ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="flex items-center justify-end">
              <WrenchIcon
                size={12}
                className="mr-1 inline-block align-[-2px]"
              />
              <span>Built with&nbsp;</span>
              <a
                href={VITE_PLUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Vite+
              </a>
            </p>

            <p className="flex items-center justify-end">
              <GithubIcon size={12} className="mr-1 text-zinc-400" />
              <span>Source code on&nbsp;</span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                GitHub
              </a>
            </p>

            <p className="flex items-center justify-end">
              <MapPinHouseIcon size={12} className="mr-1 text-zinc-400" />
              <span>Personal</span>&nbsp;
              <a
                href={PERSONAL_HOME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Space
              </a>
            </p>
          </div>
        </div>
      </section>
    </WithLoading>
  )
}
