'use client'

import type { Variants } from 'motion/react'
import type { HTMLAttributes, MouseEvent } from 'react'

import { motion, useAnimation } from 'motion/react'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface RadioIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface RadioIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
}

const waveVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.25 }
  },
  animate: {
    opacity: [0.35, 1, 0.35],
    pathLength: [0.25, 1, 0.25],
    transition: {
      duration: 0.9,
      ease: 'easeInOut',
      repeat: Number.POSITIVE_INFINITY
    }
  }
}

const dotVariants: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.18, 1],
    transition: {
      duration: 0.9,
      ease: 'easeInOut',
      repeat: Number.POSITIVE_INFINITY
    }
  }
}

const RadioIcon = forwardRef<RadioIconHandle, RadioIconProps>(
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

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(event)
      } else {
        void controls.start('animate')
      }
    }

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(event)
      } else {
        void controls.start('normal')
      }
    }

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
            d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"
            initial="normal"
            variants={waveVariants}
          />
          <motion.path
            animate={controls}
            d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"
            initial="normal"
            variants={waveVariants}
          />
          <motion.circle
            animate={controls}
            cx="12"
            cy="12"
            initial="normal"
            r="2"
            style={{ transformOrigin: '12px 12px' }}
            variants={dotVariants}
          />
          <motion.path
            animate={controls}
            d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"
            initial="normal"
            variants={waveVariants}
          />
          <motion.path
            animate={controls}
            d="M19.1 4.9C23 8.8 23 15.1 19.1 19"
            initial="normal"
            variants={waveVariants}
          />
        </svg>
      </div>
    )
  }
)

RadioIcon.displayName = 'RadioIcon'

export { RadioIcon }
