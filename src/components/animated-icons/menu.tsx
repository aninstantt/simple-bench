'use client'

import type { Transition, Variants } from 'motion/react'
import type { HTMLAttributes } from 'react'

import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface MenuIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface MenuIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
}

const DEFAULT_TRANSITION: Transition = {
  duration: 0.4,
  opacity: { duration: 0.2 }
}

const PATH_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1
  },
  animate: (i: number) => ({
    pathLength: [0, 1],
    opacity: [0.5, 1],
    transition: { ...DEFAULT_TRANSITION, delay: i * 0.1 }
  })
}

const MenuIcon = forwardRef<MenuIconHandle, MenuIconProps>(
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
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            custom={0}
            d="M4 6h16"
            variants={PATH_VARIANTS}
            transition={DEFAULT_TRANSITION}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="M4 12h16"
            variants={PATH_VARIANTS}
            transition={DEFAULT_TRANSITION}
          />
          <motion.path
            animate={controls}
            custom={2}
            d="M4 18h16"
            variants={PATH_VARIANTS}
            transition={DEFAULT_TRANSITION}
          />
        </svg>
      </div>
    )
  }
)

MenuIcon.displayName = 'MenuIcon'

export { MenuIcon }
