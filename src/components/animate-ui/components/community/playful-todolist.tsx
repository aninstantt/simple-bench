'use client'

import { DragDropProvider, type DragDropEventHandlers } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { Pencil } from 'lucide-react'
import { motion, type Transition } from 'motion/react'

import {
  Checkbox,
  CheckboxIndicator
} from '@/components/animate-ui/primitives/radix/checkbox'
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
  onEdit: (id: string) => void
  showButtons?: boolean
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
  index: number
  item: PlayfulTodoItem
  onToggle: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  showButtons?: boolean
}

function PlayfulTodoRow({
  index,
  item,
  onToggle,
  onEdit,
  showButtons = true
}: PlayfulTodoRowProps) {
  const { ref, sourceRef, targetRef, isDragging } = useSortable({
    id: item.id,
    index,
    group: 'playful-todo-list'
  })

  return (
    <div
      ref={node => {
        ref(node)
        sourceRef(node)
        targetRef(node)
      }}
      className={cn(
        'relative flex items-center gap-3 py-3',
        isDragging ? 'cursor-grabbing' : undefined
      )}
    >
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

      <div className="pointer-events-none absolute top-1/2 right-0 z-30 -translate-y-1/2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-white/70 p-1 backdrop-blur-[8px] dark:bg-zinc-700/70">
          {showButtons && (
            <>
              <button
                type="button"
                aria-label="Edit todo"
                onClick={() => onEdit(item.id)}
                className="inline-flex size-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 transition-colors transition-transform hover:scale-[1.03] hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
              >
                <Pencil className="size-3.5" />
              </button>
              <CopyButton
                text={item.label}
                className="inline-flex size-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 transition-colors transition-transform hover:scale-[1.03] hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700/50 dark:focus-visible:ring-offset-zinc-600"
                iconClassName="size-3.5"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayfulTodolist({
  value,
  defaultValue = DEFAULT_ITEMS,
  onChange,
  onEdit,
  showButtons = true,
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

  const handleDragEnd: DragDropEventHandlers['onDragEnd'] = ({
    canceled,
    operation
  }) => {
    if (canceled) return

    const sourceId = operation.source?.id
    const targetId = operation.target?.id
    const sourceSortable = operation.source as
      | { initialIndex?: number; index?: number }
      | undefined

    const from =
      sourceId != null
        ? items.findIndex(item => item.id === String(sourceId))
        : (sourceSortable?.initialIndex ?? -1)
    const targetIndexFromId =
      targetId != null
        ? items.findIndex(item => item.id === String(targetId))
        : (sourceSortable?.index ?? -1)
    const projectedIndex = sourceSortable?.index ?? -1
    const to =
      projectedIndex >= 0 && projectedIndex !== from
        ? projectedIndex
        : targetIndexFromId

    if (from < 0 || to < 0) {
      return
    }
    if (from === to) {
      return
    }

    const nextItems = [...items]
    const [moved] = nextItems.splice(from, 1)
    nextItems.splice(to, 0, moved)
    setItems(nextItems)
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
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-600">
            {items.map((item, index) => (
              <PlayfulTodoRow
                key={item.id}
                index={index}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={onEdit}
                showButtons={showButtons}
              />
            ))}
          </div>
        </DragDropProvider>
      )}
    </div>
  )
}

export { PlayfulTodolist }
