import type { HTMLAttributes } from 'react'

import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface ClipboardListIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface ClipboardListIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
}

const ClipboardListIcon = forwardRef<
  ClipboardListIconHandle,
  ClipboardListIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
  const controls = useAnimation()
  const isControlledRef = useRef(false)

  useImperativeHandle(ref, () => {
    isControlledRef.current = true

    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal')
    }
  })

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e)
      } else {
        void controls.start('animate')
      }
    },
    [controls, onMouseEnter]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e)
      } else {
        void controls.start('normal')
      }
    },
    [controls, onMouseLeave]
  )

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.svg
        animate={controls}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        variants={{
          animate: {
            scale: [1, 1.04, 1],
            rotate: [0, -4, 4, -4, 0],
            y: [0, -1, 0],
            transition: {
              duration: 0.5,
              ease: 'easeInOut',
              times: [0, 0.2, 0.5, 0.8, 1]
            }
          },
          normal: {
            scale: 1,
            rotate: 0,
            y: 0
          }
        }}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
        <line x1="9" x2="15" y1="9" y2="9" />
        <line x1="9" x2="15" y1="13" y2="13" />
        <line x1="9" x2="13" y1="17" y2="17" />
      </motion.svg>
    </div>
  )
})

ClipboardListIcon.displayName = 'ClipboardListIcon'

export { ClipboardListIcon }
