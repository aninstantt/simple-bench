'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { motion, type Transition } from 'motion/react'

import {
  Checkbox,
  CheckboxIndicator
} from '@/components/animate-ui/primitives/radix/checkbox'
import { ConfirmPopover } from '@/components/custom/confirm-popover'
import { CopyButton } from '@/components/custom/copy'
import { Label } from '@/components/ui/label'
import { useControlledState } from '@/hooks/use-controlled-state'
import { cn } from '@/lib/utils'

type PlayfulTodoItem = {
  id: string
  label: string
  checked: boolean
}

type PlayfulTodolistProps = {
  value?: PlayfulTodoItem[]
  defaultValue?: PlayfulTodoItem[]
  onChange?: (next: PlayfulTodoItem[]) => void
  onEdit?: (id: string) => void
  className?: string
}

const DEFAULT_ITEMS: PlayfulTodoItem[] = [
  // intentionally empty: consumers should provide items
]

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0
})

const getPathTransition = (isChecked: boolean): Transition => ({
  // Keep it snappy; also avoid delayed hide when unchecking.
  pathLength: { duration: 0.5, ease: 'easeInOut' },
  opacity: isChecked
    ? { duration: 0.08, delay: 0 }
    : { duration: 0.08, delay: 0 }
})

type PlayfulTodoRowProps = {
  item: PlayfulTodoItem
  onToggle: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
}

function PlayfulTodoRow({
  item,
  onToggle,
  onDelete,
  onEdit
}: PlayfulTodoRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Checkbox
        checked={item.checked}
        onCheckedChange={val => onToggle(item.id, val === true)}
        id={`checkbox-${item.id}`}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-[12px] border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
      >
        <CheckboxIndicator className="size-4 text-zinc-600 dark:text-zinc-50" />
      </Checkbox>
      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full align-top">
          <Label
            htmlFor={`checkbox-${item.id}`}
            className="text-sm leading-6 font-normal wrap-anywhere text-zinc-600 dark:text-zinc-50"
          >
            {item.label}
          </Label>
          <motion.svg
            width="340"
            height="32"
            viewBox="0 0 340 32"
            className="pointer-events-none absolute top-1/2 left-0 z-20 h-8 w-full -translate-y-1/2"
          >
            <motion.path
              d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
              vectorEffect="non-scaling-stroke"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeMiterlimit={10}
              fill="none"
              initial={false}
              animate={getPathAnimate(!!item.checked)}
              transition={getPathTransition(!!item.checked)}
              className="stroke-zinc-600/90 dark:stroke-zinc-100/90"
            />
          </motion.svg>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onEdit ? (
          <button
            type="button"
            aria-label="Edit todo"
            onClick={() => onEdit(item.id)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
          >
            <Pencil className="size-4" />
          </button>
        ) : null}

        <CopyButton
          text={item.label}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
          iconClassName="size-4"
        />

        <ConfirmPopover
          side="left"
          align="center"
          onConfirm={() => onDelete(item.id)}
          trigger={
            <button
              type="button"
              aria-label="Delete todo"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
            >
              <Trash2 className="size-4" />
            </button>
          }
        />
      </div>
    </div>
  )
}

function PlayfulTodolist({
  value,
  defaultValue = DEFAULT_ITEMS,
  onChange,
  onEdit,
  className
}: PlayfulTodolistProps) {
  const [items, setItems] = useControlledState<PlayfulTodoItem[]>({
    value,
    defaultValue,
    onChange
  })

  const handleToggle = (id: string, checked: boolean) => {
    setItems(items.map(t => (t.id === id ? { ...t, checked } : t)))
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(t => t.id !== id))
  }

  return (
    <div
      className={cn(
        'rounded-[12px] border border-zinc-200 bg-white px-4 dark:border-zinc-600 dark:bg-zinc-600',
        className
      )}
    >
      {items.length === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center gap-1 rounded-[12px] border-zinc-200 px-5 py-7 text-center dark:border-zinc-600 dark:bg-zinc-600">
          <p className="text-sm text-zinc-600 dark:text-zinc-100">是空的</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-600">
          {items.map(item => (
            <PlayfulTodoRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { PlayfulTodolist }
