import { useAtom } from 'jotai/react'
import {
  CircleOff,
  Cloud,
  Contrast,
  Database,
  FileText,
  HardDrive,
  Layers,
  List,
  PartyPopper,
  PenSquare,
  RefreshCw,
  Settings,
  ShieldCheck,
  Stars,
  Sun,
  Tag,
  Cog,
  Moon
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { checkForUpdate } from '@/components/custom/pwa-update-handler'
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
import { backgroundAtom, themeAtom } from '@/states/user-config'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenSync: () => void
  onOpenHomeCopy: () => void
  onOpenDockMenu: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  onOpenSync,
  onOpenHomeCopy,
  onOpenDockMenu
}: SettingsDialogProps) {
  const [persistErrorDialogOpen, setPersistErrorDialogOpen] = useState(false)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [persistError, setPersistError] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (navigator.storage?.persisted) {
      navigator.storage
        .persisted()
        .then(setPersisted)
        .catch(() => setPersisted(false))
    }
  }, [])

  useEffect(() => {
    if (!open) setPersistError(false)
  }, [open])

  const [theme, setTheme] = useAtom(themeAtom)
  const [bgMode, setBgMode] = useAtom(backgroundAtom)

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={open => {
          onOpenChange(open)
          if (!open) setPersistError(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-4" />
              <span className="text-xs font-normal text-zinc-400">
                点击文字以显示说明
              </span>
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
                onClick={onOpenHomeCopy}
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
                      导航栏
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        支持勾选显示项并调整顺序。
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
                aria-label="编辑导航栏"
                onClick={onOpenDockMenu}
              >
                <PenSquare className="size-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <Cloud className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      同步
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        同步数据以支持跨设备使用。
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
                aria-label="同步设置"
                onClick={onOpenSync}
              >
                <Cog className="size-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <Database className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      防清理保护
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        打开防清理保护，防止数据被浏览器清除。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                {persistError && (
                  <button
                    type="button"
                    className="text-xs text-red-500 underline decoration-red-500/50 underline-offset-2 hover:decoration-red-500 dark:text-red-400 dark:decoration-red-400/50 dark:hover:decoration-red-400"
                    onClick={() => {
                      setPersistErrorDialogOpen(true)
                      setPersistError(false)
                    }}
                  >
                    未开启
                  </button>
                )}
                {persisted === true ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center"
                      >
                        <ShieldCheck className="size-4 text-zinc-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="end"
                      className="w-fit border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      已开启
                    </PopoverContent>
                  </Popover>
                ) : persisted === false ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="请求防清理保护"
                    onClick={async () => {
                      try {
                        const granted = await navigator.storage.persist()
                        setPersisted(granted)
                        setPersistError(!granted)
                      } catch {
                        setPersistError(true)
                      }
                    }}
                    disabled={persistError}
                  >
                    <HardDrive className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <Tag className="size-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
                <Popover modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-0 rounded-md text-left font-medium underline decoration-zinc-400/0 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
                    >
                      版本
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <PopoverHeader>
                      <PopoverDescription className="text-[12px]">
                        当前应用版本号，点击右侧按钮可以手动更新。
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  v{__APP_VERSION__}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="检查更新"
                  disabled={checking}
                  onClick={async () => {
                    setChecking(true)
                    await checkForUpdate()
                    setChecking(false)
                  }}
                >
                  <RefreshCw
                    className={`size-3.5 ${checking ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={persistErrorDialogOpen}
        onOpenChange={setPersistErrorDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Database className="size-4" />
              数据防清理保护未开启
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="mb-1 block">
                仅用于防止极端情况下系统自动清理数据，不影响正常使用。
              </span>
              <span>如需开启此长效存储保护，建议使用 Chrome 浏览器。</span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
