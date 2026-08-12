'use client'

import type { ReactNode } from 'react'

import { DragDropProvider, type DragDropEventHandlers } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'

export type DragHandleProps = {
  dragHandleRef: (element: Element | null) => void
  isDragging: boolean
}

type SortableListProps<T> = {
  items: T[]
  getKey: (item: T) => string
  group: string
  onReorder: (ordered: T[]) => void
  children: (item: T, index: number, dragHandle: DragHandleProps) => ReactNode
  empty?: ReactNode
  className?: string
}

function SortableRow<T>({
  item,
  index,
  getKey,
  group,
  children
}: {
  item: T
  index: number
  getKey: (item: T) => string
  group: string
  children: (item: T, index: number, dragHandle: DragHandleProps) => ReactNode
}) {
  const { handleRef, ref, sourceRef, targetRef, isDragging } = useSortable({
    id: getKey(item),
    index,
    group
  })

  const setNodeRef = (node: Element | null) => {
    ref(node)
    sourceRef(node)
    targetRef(node)
  }

  return (
    <div ref={setNodeRef} className={cn(isDragging && 'opacity-60')}>
      {children(item, index, { dragHandleRef: handleRef, isDragging })}
    </div>
  )
}

export function DragHandle({
  dragHandleRef,
  className
}: {
  dragHandleRef: (element: Element | null) => void
  className?: string
}) {
  return (
    <span
      ref={dragHandleRef}
      className={cn(
        'inline-flex cursor-grab items-center justify-center text-zinc-300 transition-colors hover:text-zinc-400 active:cursor-grabbing dark:text-zinc-500 dark:hover:text-zinc-400',
        className
      )}
      aria-label="拖动以排序"
    >
      <GripVertical className="size-4" />
    </span>
  )
}

export function SortableList<T>({
  items,
  getKey,
  group,
  onReorder,
  children,
  empty,
  className
}: SortableListProps<T>) {
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
        ? items.findIndex(item => getKey(item) === String(sourceId))
        : (sourceSortable?.initialIndex ?? -1)

    const targetIndexFromId =
      targetId != null
        ? items.findIndex(item => getKey(item) === String(targetId))
        : (sourceSortable?.index ?? -1)

    const projectedIndex = sourceSortable?.index ?? -1
    const to =
      projectedIndex >= 0 && projectedIndex !== from
        ? projectedIndex
        : targetIndexFromId

    if (from < 0 || to < 0 || from === to) return

    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={cn('space-y-1.5', className)}>
        {items.map((item, index) => (
          <SortableRow
            key={getKey(item)}
            item={item}
            index={index}
            getKey={getKey}
            group={group}
            children={children}
          />
        ))}
        {items.length === 0 ? empty : null}
      </div>
    </DragDropProvider>
  )
}
