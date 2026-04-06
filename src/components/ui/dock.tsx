'use client'

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react'
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { useIsTouchDevice } from '@/hooks/use-is-touch-device'
import { cn } from '@/lib/utils'

const DEFAULT_MAGNIFICATION = 80
const DEFAULT_DISTANCE = 150
const DEFAULT_PANEL_HEIGHT = 64
const TOUCH_ICON_SIZE = 40

export type DockProps = {
  children: React.ReactNode
  className?: string
  distance?: number
  panelHeight?: number
  magnification?: number
  spring?: SpringOptions
}

export type DockItemProps = {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export type DockLabelProps = {
  className?: string
  children: React.ReactNode
}

export type DockIconProps = {
  className?: string
  children: React.ReactNode
}

export type DocContextType = {
  mouseX: MotionValue
  spring: SpringOptions
  magnification: number
  distance: number
  isTouch: boolean
}

export type DockProviderProps = {
  children: React.ReactNode
  value: DocContextType
}

const DockContext = createContext<DocContextType | undefined>(undefined)

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>
}

function useDock() {
  const context = useContext(DockContext)
  if (!context) {
    throw new Error('useDock must be used within an DockProvider')
  }
  return context
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 180, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT
}: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const isTouch = useIsTouchDevice()

  return (
    <motion.div
      onMouseMove={isTouch ? undefined : ({ pageX }) => mouseX.set(pageX)}
      onMouseLeave={isTouch ? undefined : () => mouseX.set(Infinity)}
      className={cn(
        'mx-auto flex w-fit gap-4 rounded-2xl bg-gray-50 px-4 dark:bg-neutral-900',
        className
      )}
      style={{ height: panelHeight }}
      role="toolbar"
      aria-label="Application dock"
    >
      <DockProvider
        value={{ mouseX, spring, distance, magnification, isTouch }}
      >
        {children}
      </DockProvider>
    </motion.div>
  )
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { distance, magnification, mouseX, spring, isTouch } = useDock()

  const isHovered = useMotionValue(0)

  const mouseDistance = useTransform(mouseX, val => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - domRect.x - domRect.width / 2
  })
  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  )
  const animatedWidth = useSpring(widthTransform, spring)
  const staticWidth = useMotionValue(TOUCH_ICON_SIZE)
  const width = isTouch ? staticWidth : animatedWidth

  const handleClick = () => {
    if (isTouch) {
      isHovered.set(1)
      setTimeout(() => {
        isHovered.set(0)
        onClick?.()
      }, 600)
    } else {
      onClick?.()
    }
  }

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onHoverStart={isTouch ? undefined : () => isHovered.set(1)}
      onHoverEnd={isTouch ? undefined : () => isHovered.set(0)}
      onFocus={isTouch ? undefined : () => isHovered.set(1)}
      onBlur={isTouch ? undefined : () => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      onClick={handleClick}
    >
      {Children.map(children, child =>
        cloneElement(
          child as React.ReactElement<{
            width: MotionValue
            isHovered: MotionValue
          }>,
          { width, isHovered }
        )
      )}
    </motion.div>
  )
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>
  const isHovered = restProps['isHovered'] as MotionValue<number>
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1)
    })

    return () => unsubscribe()
  }, [isHovered])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute -top-6 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white',
            className
          )}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>
  const width = restProps['width'] as MotionValue<number>

  const widthTransform = useTransform(width, val => val / 2)

  return (
    <motion.div
      style={{ width: widthTransform }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </motion.div>
  )
}

export { Dock, DockIcon, DockItem, DockLabel }
