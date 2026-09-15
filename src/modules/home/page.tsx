import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtom, useAtomValue } from 'jotai/react'
import { Bookmark, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { GithubIcon } from '@/components/animated-icons/github'
import { MapPinHouseIcon } from '@/components/animated-icons/map-pin-house'
import { WrenchIcon } from '@/components/animated-icons/wrench'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import AnimatedTypingMotion from '@/components/shadcn-space/animated-text/animated-text-03'
import { BookmarkSection } from '@/modules/bookmark/section'
import { homeCopyAtom, homeViewAtom } from '@/states/user-config'

const VITE_PLUS_URL = 'https://viteplus.dev/'
const GITHUB_URL = 'https://github.com/aninstantt/simple-bench'
const PERSONAL_HOME_URL = 'https://goyave.space'

export function HomePage() {
  const navigate = useNavigate()
  const { folder } = useSearch({ strict: false }) as { folder?: number }
  const homeCopy = useAtomValue(homeCopyAtom)
  const [homeView, setHomeView] = useAtom(homeViewAtom)
  const [showPoweredBy, setShowPoweredBy] = useState(false)

  const showBookmarks = folder != null || homeView === 'bookmark'

  const selectFolder = (nextFolderId: number | null) => {
    setHomeView('bookmark')
    if (nextFolderId == null) {
      void navigate({ to: '/', search: {}, replace: true })
      return
    }
    void navigate({ to: '/', search: { folder: nextFolderId } })
  }

  const toggleView = () => {
    if (showBookmarks) {
      setHomeView('home')
      if (folder != null) void navigate({ to: '/', search: {}, replace: true })
      return
    }
    setHomeView('bookmark')
  }

  useEffect(() => {
    const typingDurationMs = homeCopy.length * 20 + 200
    setShowPoweredBy(false)
    const timer = setTimeout(() => setShowPoweredBy(true), typingDurationMs)
    return () => clearTimeout(timer)
  }, [homeCopy])

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader
          icon={
            showBookmarks ? (
              <Bookmark className="size-4" />
            ) : (
              <Home className="size-4" />
            )
          }
          title={showBookmarks ? '书签' : '主页'}
          actions={
            <Button
              type="button"
              variant="outline"
              className="size-9 shrink-0 rounded-full p-0"
              aria-label={showBookmarks ? '返回主页' : '书签'}
              onClick={toggleView}
            >
              {showBookmarks ? (
                <Home className="size-4" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </Button>
          }
        />

        {showBookmarks ? (
          <BookmarkSection
            folderId={folder ?? null}
            onSelectFolder={selectFolder}
          />
        ) : (
          <div className="rounded-[12px] bg-white px-4 py-4 dark:bg-zinc-600">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              <AnimatedTypingMotion
                words={[homeCopy]}
                stepMs={20}
                loop={false}
                className="text-sm leading-6 text-zinc-700 dark:text-zinc-100"
              />
            </div>
            <div
              className={`mt-4 flex w-full flex-col items-end gap-2 text-xs text-zinc-400 transition-opacity duration-500 ${showPoweredBy ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="flex items-center justify-end">
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
              </div>

              <div className="flex items-center justify-end">
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
              </div>

              <div className="flex items-center justify-end">
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
              </div>
            </div>
          </div>
        )}
      </section>
    </WithLoading>
  )
}
