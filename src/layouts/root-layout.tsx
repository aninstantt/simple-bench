import type { ReactNode } from 'react'

import { Outlet, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Suspense, lazy } from 'react'

const GravityStarsBackground = lazy(() =>
  import('@/components/animate-ui/components/backgrounds/gravity-stars').then(
    m => ({
      default: m.GravityStarsBackground
    })
  )
)
const FireworksBackground = lazy(() =>
  import('@/components/animate-ui/components/backgrounds/fireworks').then(
    m => ({
      default: m.FireworksBackground
    })
  )
)
import { FolderLockIcon } from '@/components/animated-icons/aes'
import { BookTextIcon } from '@/components/animated-icons/book-text'
import { HomeIcon } from '@/components/animated-icons/home'
import { RadioIcon } from '@/components/animated-icons/radio'
import { MessageCircleCheckIcon } from '@/components/animated-icons/todo'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import { Toaster } from '@/components/ui/sonner'
import {
  backgroundAtom,
  dockMenuItemsAtom,
  dockVisibleAtom,
  normalizeDockMenuItems
} from '@/states/user-config'

const dockAnimatedIconClass = 'size-full [&_svg]:h-full [&_svg]:w-full'
const dockIconSize = 32

type DockNavItem = {
  key: State.UserConfig.DockMenuKey
  label: string
  onClick: () => void
  icon: ReactNode
}

const itemClass =
  'cursor-pointer aspect-square rounded-lg bg-gray-200 dark:bg-neutral-800 hover:text-[var(--my-red-1)]'

export function RootLayout() {
  const navigate = useNavigate()
  const [dockVisible, setDockVisible] = useAtom(dockVisibleAtom)
  const [backgroundMode] = useAtom(backgroundAtom)
  const [dockMenuItems] = useAtom(dockMenuItemsAtom)

  const navItemsByKey: Record<State.UserConfig.DockMenuKey, DockNavItem> = {
    home: {
      key: 'home',
      label: '主页',
      onClick: () => navigate({ to: '/' }),
      icon: <HomeIcon className={dockAnimatedIconClass} size={dockIconSize} />
    },
    aes: {
      key: 'aes',
      label: '加解密',
      onClick: () => navigate({ to: '/aes' }),
      icon: (
        <FolderLockIcon className={dockAnimatedIconClass} size={dockIconSize} />
      )
    },
    share: {
      key: 'share',
      label: '互传',
      onClick: () => navigate({ to: '/share' }),
      icon: <RadioIcon className={dockAnimatedIconClass} size={dockIconSize} />
    },
    todo: {
      key: 'todo',
      label: '待办',
      onClick: () => navigate({ to: '/todo' }),
      icon: (
        <MessageCircleCheckIcon
          className={dockAnimatedIconClass}
          size={dockIconSize}
        />
      )
    },
    note: {
      key: 'note',
      label: '笔记',
      onClick: () => navigate({ to: '/note' }),
      icon: (
        <BookTextIcon className={dockAnimatedIconClass} size={dockIconSize} />
      )
    }
  }

  const navItems = normalizeDockMenuItems(dockMenuItems)
    .filter(item => item.visible)
    .map(item => navItemsByKey[item.key])

  return (
    <div
      className="relative flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-100/50 via-transparent to-transparent  text-left dark:from-zinc-600/20"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="flex flex-1 flex-col rounded-2xl border-zinc-200/70 bg-white p-4 pb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] dark:border-zinc-600/60 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.15)]"
        style={{ contain: 'layout paint' }}
      >
        <div className="fixed inset-0 -z-10">
          <Suspense fallback={null}>
            {backgroundMode === 'gravity' ? (
              <GravityStarsBackground className="h-full w-full text-zinc-900/25 dark:text-white/30" />
            ) : backgroundMode === 'fireworks' ? (
              <FireworksBackground
                className="h-full w-full opacity-60"
                population={0.6}
                canvasProps={{ className: 'opacity-80' }}
              />
            ) : null}
          </Suspense>
        </div>
        <Outlet />
      </div>

      <div className="fixed bottom-0 left-1/2 z-50 max-w-full -translate-x-1/2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          {dockVisible ? (
            <motion.div
              key="dock"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Dock className="items-end pb-3" magnification={50} distance={50}>
                {navItems.map(item => (
                  <DockItem
                    key={item.key}
                    onClick={item.onClick}
                    className={itemClass}
                  >
                    <DockIcon>{item.icon}</DockIcon>
                    <DockLabel>{item.label}</DockLabel>
                  </DockItem>
                ))}

                <DockItem
                  onClick={() => setDockVisible(false)}
                  className={itemClass}
                >
                  <DockIcon>
                    <ChevronDown className="size-full text-zinc-400 dark:text-zinc-600" />
                  </DockIcon>
                </DockItem>
              </Dock>
            </motion.div>
          ) : (
            <motion.button
              key="toggle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={() => setDockVisible(true)}
              className="mx-auto flex items-center justify-center rounded-full bg-gray-50 p-2 shadow-sm transition-colors hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <ChevronUp className="size-4 text-zinc-600 dark:text-zinc-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <Toaster />
    </div>
  )
}
