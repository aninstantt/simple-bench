import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai/react'
import { cloneElement, useLayoutEffect, useState, type ReactNode } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/animate-ui/components/radix/dropdown-menu'
import { CogIcon } from '@/components/animated-icons/cog'
import { MenuIcon } from '@/components/animated-icons/menu'
import AnimatedTextGradientMotion from '@/components/shadcn-space/animated-text/animated-text-02'
import { cn } from '@/lib/utils'
import {
  dockMenuItemsAtom,
  normalizeDockMenuItems,
  themeAtom
} from '@/states/user-config'

import { navItemConfig, resolveColor } from './constants'
import { DockMenuDialog } from './dock-menu-dialog'
import { HomeCopyDialog } from './home-copy-dialog'
import { SettingsDialog } from './settings-dialog'
import { SyncDialog } from './sync-dialog'
import { SyncNotice } from './sync-notice'

export type PageHeaderProps = {
  icon: ReactNode
  title: string
  description?: string
  className?: string
  hideActions?: boolean
}

export function PageHeader({
  icon,
  title,
  description,
  className,
  hideActions
}: PageHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [homeCopyDialogOpen, setHomeCopyDialogOpen] = useState(false)
  const [dockMenuDialogOpen, setDockMenuDialogOpen] = useState(false)

  const [dockMenuItems] = useAtom(dockMenuItemsAtom)
  const [theme] = useAtom(themeAtom)

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
        {!hideActions && (
          <>
            <SyncNotice />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="size-9 shrink-0 rounded-full p-0 focus-visible:ring-0 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  aria-label="Menu"
                >
                  <MenuIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-xs">导航</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(() => {
                  const ordered = normalizeDockMenuItems(dockMenuItems)
                  return ordered.map(item => {
                    const config = navItemConfig[item.key]
                    if (!config) return null
                    return (
                      <DropdownMenuItem
                        key={item.key}
                        className="text-xs"
                        disabled={location.pathname === config.path}
                        onSelect={() => navigate({ to: config.path })}
                      >
                        <span className="-mt-px">
                          {config.icon && item.color
                            ? cloneElement(
                                config.icon as React.ReactElement<{
                                  className?: string
                                  style?: React.CSSProperties
                                }>,
                                { style: { color: resolveColor(item.color) } }
                              )
                            : config.icon}
                        </span>
                        <span
                          style={
                            item.color
                              ? { color: resolveColor(item.color) }
                              : undefined
                          }
                        >
                          {config.label}
                        </span>
                      </DropdownMenuItem>
                    )
                  })
                })()}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              className="size-9 shrink-0 rounded-full p-0"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <CogIcon className="size-4" />
            </Button>
          </>
        )}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      ) : null}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onOpenSync={() => setSyncDialogOpen(true)}
        onOpenHomeCopy={() => setHomeCopyDialogOpen(true)}
        onOpenDockMenu={() => setDockMenuDialogOpen(true)}
      />

      <SyncDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen} />

      <HomeCopyDialog
        open={homeCopyDialogOpen}
        onOpenChange={setHomeCopyDialogOpen}
      />

      <DockMenuDialog
        open={dockMenuDialogOpen}
        onOpenChange={setDockMenuDialogOpen}
      />
    </div>
  )
}
