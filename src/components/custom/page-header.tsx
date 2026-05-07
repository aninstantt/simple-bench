import { useAtom } from 'jotai/react'
import {
  Check,
  ArrowDown,
  ArrowUp,
  CircleOff,
  Contrast,
  FileText,
  Layers,
  List,
  Moon,
  PenSquare,
  PartyPopper,
  RotateCcw,
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  backgroundAtom,
  DEFAULT_DOCK_MENU_ITEMS,
  DEFAULT_HOME_COPY,
  dockMenuItemsAtom,
  homeCopyAtom,
  normalizeDockMenuItems,
  themeAtom
} from '@/states/user-config'

const dockMenuItemLabels: Record<State.UserConfig.DockMenuKey, string> = {
  home: '主页',
  aes: '加解密',
  share: '互传',
  todo: '待办',
  note: '笔记'
}

export type PageHeaderProps = {
  icon: ReactNode
  title: string
  description?: string
  className?: string
}

const MAX_HOME_COPY_LENGTH = 240

export function PageHeader({
  icon,
  title,
  description,
  className
}: PageHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [homeCopyDialogOpen, setHomeCopyDialogOpen] = useState(false)
  const [dockMenuDialogOpen, setDockMenuDialogOpen] = useState(false)

  const [theme, setTheme] = useAtom(themeAtom)
  const [bgMode, setBgMode] = useAtom(backgroundAtom)
  const [homeCopy, setHomeCopy] = useAtom(homeCopyAtom)
  const [dockMenuItems, setDockMenuItems] = useAtom(dockMenuItemsAtom)
  const [homeCopyDraft, setHomeCopyDraft] = useState(homeCopy)
  const [dockMenuDraft, setDockMenuDraft] = useState(() =>
    normalizeDockMenuItems(dockMenuItems)
  )

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
            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
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
              <div className="flex gap-0.5 rounded-lg bg-zinc-100/70 p-0.5 dark:bg-zinc-800/70">
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

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
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
              <div className="flex gap-0.5 rounded-lg bg-zinc-100/70 p-0.5 dark:bg-zinc-800/70">
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

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <FileText className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      首页文本
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        修改首页展示的介绍文案。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="编辑首页文本"
                onClick={() => {
                  setHomeCopyDraft(homeCopy)
                  setHomeCopyDialogOpen(true)
                }}
              >
                <PenSquare className="size-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <List className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      菜单项
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        支持勾选显示项并调整菜单顺序。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="编辑菜单项"
                onClick={() => {
                  setDockMenuDraft(normalizeDockMenuItems(dockMenuItems))
                  setDockMenuDialogOpen(true)
                }}
              >
                <PenSquare className="size-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={homeCopyDialogOpen} onOpenChange={setHomeCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">编辑首页文本</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              首页文本会展示在主页底部，留空则使用默认文本。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={homeCopyDraft}
              onChange={e => setHomeCopyDraft(e.target.value)}
              placeholder="请输入首页文案"
              maxLength={MAX_HOME_COPY_LENGTH}
              className="min-h-24 text-sm"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-400">
                {homeCopyDraft.length}/{MAX_HOME_COPY_LENGTH}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 border-zinc-200 p-0 dark:border-zinc-600"
                  aria-label="恢复默认首页文本"
                  onClick={() => setHomeCopyDraft(DEFAULT_HOME_COPY)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="保存首页文本"
                  onClick={() => {
                    const nextHomeCopy =
                      homeCopyDraft.trim() || DEFAULT_HOME_COPY
                    setHomeCopy(nextHomeCopy)
                    setHomeCopyDialogOpen(false)
                  }}
                >
                  <Check className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dockMenuDialogOpen} onOpenChange={setDockMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">菜单项设置</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              勾选控制显示，使用上下箭头调整顺序。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              {dockMenuDraft.map((menuItem, index) => {
                const visibleCount = dockMenuDraft.filter(
                  item => item.visible
                ).length
                const disableUncheck = menuItem.visible && visibleCount === 1
                return (
                  <div
                    key={menuItem.key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950/20"
                  >
                    <label className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={menuItem.visible}
                        disabled={disableUncheck}
                        onChange={e => {
                          const checked = e.target.checked
                          setDockMenuDraft(prev =>
                            prev.map(item =>
                              item.key === menuItem.key
                                ? { ...item, visible: checked }
                                : item
                            )
                          )
                        }}
                        className="size-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
                      />
                      <span className="truncate">
                        {dockMenuItemLabels[menuItem.key]}
                      </span>
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label="上移"
                        disabled={index === 0}
                        onClick={() => {
                          setDockMenuDraft(prev => {
                            if (index <= 0) return prev
                            const next = [...prev]
                            const [current] = next.splice(index, 1)
                            next.splice(index - 1, 0, current)
                            return next
                          })
                        }}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label="下移"
                        disabled={index === dockMenuDraft.length - 1}
                        onClick={() => {
                          setDockMenuDraft(prev => {
                            if (index >= prev.length - 1) return prev
                            const next = [...prev]
                            const [current] = next.splice(index, 1)
                            next.splice(index + 1, 0, current)
                            return next
                          })
                        }}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 border-zinc-200 p-0 dark:border-zinc-600"
                aria-label="恢复默认菜单项"
                onClick={() =>
                  setDockMenuDraft(
                    DEFAULT_DOCK_MENU_ITEMS.map(item => ({ ...item }))
                  )
                }
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="保存菜单项"
                onClick={() => {
                  setDockMenuItems(normalizeDockMenuItems(dockMenuDraft))
                  setDockMenuDialogOpen(false)
                }}
              >
                <Check className="size-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
