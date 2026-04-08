import type { ReactNode } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'

type ColorButtonStyle = { bg: string; hoverBg: string; color?: string }

type ColorButtonType =
  | 'green'
  | 'orange'
  | 'red'
  | 'pink'
  | 'yellow'
  | 'blue'
  | 'purple'

const COLOR_BUTTON_STYLES: Record<ColorButtonType, ColorButtonStyle> = {
  green: {
    bg: 'bg-[#44803F]',
    hoverBg: 'hover:bg-[#44803F]/90'
  },
  orange: {
    bg: 'bg-[#FF5A33]',
    hoverBg: 'hover:bg-[#FF5A33]/90'
  },
  red: {
    bg: 'bg-(--my-red-1)',
    hoverBg: 'hover:bg-(--my-red-1)/90'
  },
  pink: {
    bg: 'bg-red-100',
    hoverBg: 'hover:bg-red-100/90',
    color: 'text-red-500'
  },
  yellow: {
    bg: 'bg-amber-200',
    hoverBg: 'hover:bg-amber-200/90',
    color: 'text-amber-900'
  },
  blue: {
    bg: 'bg-[#efedff]',
    hoverBg: 'hover:bg-[#efedff]/90',
    color: 'text-[#5e68c2]'
  },
  purple: {
    bg: 'bg-[#ffe4f4]',
    hoverBg: 'hover:bg-[#ffe4f4]/90',
    color: 'text-[#c25e86]'
  }
}

type ColorButtonProps = {
  type?: ColorButtonType
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function ColorButton({
  type = 'green',
  onClick,
  children,
  className,
  disabled,
  'aria-label': ariaLabel,
  ...props
}: ColorButtonProps) {
  const styles = COLOR_BUTTON_STYLES[type]

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`h-9 w-full px-4 ${styles.color || 'text-[#f0f0f0]'} ${styles.bg} ${styles.hoverBg} ${className ?? ''}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Button>
  )
}
