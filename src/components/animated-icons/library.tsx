'use client'

import type { HTMLAttributes } from 'react'

import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface LibraryIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface LibraryIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
}

const LibraryIcon = forwardRef<LibraryIconHandle, LibraryIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
          <path d="m16 6 4 14" />
          <path d="M12 6v14" />
          <path d="M8 8v12" />
          <path d="M4 4v16" />
        </motion.svg>
      </div>
    )
  }
)

LibraryIcon.displayName = 'LibraryIcon'

export { LibraryIcon }
