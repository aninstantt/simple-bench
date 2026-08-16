import { useAtom } from 'jotai/react'
import { Check, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { DragHandle, SortableList } from '@/components/custom/drag-sort-list'
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
  PopoverTrigger
} from '@/components/ui/popover'
import {
  DEFAULT_DOCK_MENU_ITEMS,
  dockMenuItemsAtom,
  normalizeDockMenuItems
} from '@/states/user-config'

import { colorStyle, dockMenuItemLabels, NAV_COLORS } from './constants'

type DockMenuDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DockMenuDialog({ open, onOpenChange }: DockMenuDialogProps) {
  const [dockMenuItems, setDockMenuItems] = useAtom(dockMenuItemsAtom)
  const [draft, setDraft] = useState(() =>
    normalizeDockMenuItems(dockMenuItems)
  )

  useEffect(() => {
    if (open) setDraft(normalizeDockMenuItems(dockMenuItems))
  }, [open, dockMenuItems])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">导航栏设置</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            勾选控制菜单显示，拖动以调整顺序。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <SortableList
            items={draft}
            getKey={item => item.key}
            group="dock-menu"
            onReorder={setDraft}
          >
            {(menuItem, _index, dragHandle) => {
              const visibleCount = draft.filter(item => item.visible).length
              const disableCheck = !menuItem.visible && visibleCount >= 5
              return (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950/20">
                  <div className="flex min-w-0 items-center gap-2">
                    <DragHandle
                      dragHandleRef={dragHandle.dragHandleRef}
                      className="shrink-0"
                    />
                    <label className="flex min-w-0 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={menuItem.visible}
                        disabled={disableCheck}
                        onChange={e => {
                          const checked = e.target.checked
                          setDraft(prev =>
                            prev.map(item =>
                              item.key === menuItem.key
                                ? { ...item, visible: checked }
                                : item
                            )
                          )
                        }}
                        className="size-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
                      />
                      <span
                        className="truncate"
                        style={
                          menuItem.color ? { color: menuItem.color } : undefined
                        }
                      >
                        {dockMenuItemLabels[menuItem.key]}
                      </span>
                    </label>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`rounded-full transition-all hover:ring-1 hover:ring-zinc-400 ${
                          menuItem.color
                            ? 'size-4'
                            : 'size-4 border border-zinc-300 dark:border-zinc-600'
                        }`}
                        style={colorStyle(menuItem.color ?? '')}
                        aria-label="选择颜色"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      align="center"
                      className="w-fit border-zinc-200 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-950"
                    >
                      <div className="grid grid-cols-4 gap-1.5">
                        {NAV_COLORS.map(c => {
                          const isActive = menuItem.color === c.value
                          return (
                            <button
                              key={c.value}
                              type="button"
                              aria-label={c.label}
                              className={`rounded-full transition-all ${
                                c.value
                                  ? 'size-5'
                                  : 'size-5 border border-zinc-300 dark:border-zinc-600'
                              } ${
                                isActive
                                  ? 'ring-2 ring-zinc-900 ring-offset-1 dark:ring-zinc-100 dark:ring-offset-zinc-950'
                                  : 'hover:ring-1 hover:ring-zinc-400'
                              }`}
                              style={colorStyle(c.value)}
                              onClick={() => {
                                setDraft(prev =>
                                  prev.map(item =>
                                    item.key === menuItem.key
                                      ? {
                                          ...item,
                                          color: isActive
                                            ? undefined
                                            : c.value || undefined
                                        }
                                      : item
                                  )
                                )
                              }}
                            />
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )
            }}
          </SortableList>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 border-zinc-200 p-0 dark:border-zinc-600"
              aria-label="恢复默认导航栏"
              onClick={() =>
                setDraft(DEFAULT_DOCK_MENU_ITEMS.map(item => ({ ...item })))
              }
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="保存导航栏"
              onClick={() => {
                setDockMenuItems(normalizeDockMenuItems(draft))
                onOpenChange(false)
              }}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
