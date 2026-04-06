import { useAtom } from 'jotai/react'
import {
  CircleOff,
  Contrast,
  Layers,
  Moon,
  PartyPopper,
  Settings,
  Stars,
  Sun
} from 'lucide-react'
import { useLayoutEffect, useState, type ReactNode } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { CogIcon } from '@/components/animated-icons/cog'
import AnimatedTextGradientMotion from '@/components/shadcn-space/animated-text/animated-text-02'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { themeAtom } from '@/states/user-config'
import { backgroundAtom } from '@/states/user-config'

export type PageHeaderProps = {
  icon: ReactNode
  title: string
  description?: string
  className?: string
}

export function PageHeader({
  icon,
  title,
  description,
  className
}: PageHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [theme, setTheme] = useAtom(themeAtom)
  const [bgMode, setBgMode] = useAtom(backgroundAtom)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className={cn(description && 'mb-4 text-[#415557]', className)}>
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100  dark:bg-zinc-600/50">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="[&>div]:items-start [&>div]:justify-start [&>div]:p-0">
            <AnimatedTextGradientMotion text={title} />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="size-9 shrink-0 rounded-full p-0"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <CogIcon className="size-4" />
        </Button>
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      ) : null}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-4" />
            </DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <Contrast className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      主题
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        在浅色与深色外观之间切换界面配色。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                <Button
                  type="button"
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2.5"
                  aria-label="浅色"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2.5"
                  aria-label="深色"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <Layers className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      页面背景
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        选择是否启用动态背景，以及星空或烟花效果。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                <Button
                  type="button"
                  variant={bgMode === 'none' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2.5"
                  aria-label="关闭背景"
                  onClick={() => setBgMode('none')}
                >
                  <CircleOff className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={bgMode === 'gravity' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2.5"
                  aria-label="星空"
                  onClick={() => setBgMode('gravity')}
                >
                  <Stars className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={bgMode === 'fireworks' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2.5"
                  aria-label="烟花"
                  onClick={() => setBgMode('fireworks')}
                >
                  <PartyPopper className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
