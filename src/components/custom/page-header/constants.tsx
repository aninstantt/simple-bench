import type { ReactNode } from 'react'

import {
  BookText,
  CalendarDays,
  ClipboardList,
  Home,
  Library,
  Lock,
  MessageCircleCheck,
  Radio
} from 'lucide-react'

export const dockMenuItemLabels: Record<State.UserConfig.DockMenuKey, string> =
  {
    home: '主页',
    aes: '加解密',
    share: '互传',
    todo: '待办',
    note: '笔记',
    routine: '日常',
    'frequent-text': '文本片段',
    entry: '词条'
  }

export const navItemConfig: Record<
  State.UserConfig.DockMenuKey,
  { label: string; path: string; icon: ReactNode }
> = {
  home: { label: '主页', path: '/', icon: <Home className="size-3.5" /> },
  todo: {
    label: '待办',
    path: '/todo',
    icon: <MessageCircleCheck className="size-3.5" />
  },
  note: {
    label: '笔记',
    path: '/note',
    icon: <BookText className="size-3.5" />
  },
  routine: {
    label: '日常',
    path: '/routine',
    icon: <CalendarDays className="size-3.5" />
  },
  'frequent-text': {
    label: '文本片段',
    path: '/frequent-text',
    icon: <ClipboardList className="size-3.5" />
  },
  entry: {
    label: '词条',
    path: '/entry',
    icon: <Library className="size-3.5" />
  },
  aes: {
    label: '加解密',
    path: '/aes',
    icon: <Lock className="size-3.5" />
  },
  share: {
    label: '互传',
    path: '/share',
    icon: <Radio className="size-3.5" />
  }
}

export const NAV_COLORS = [
  { label: '无', value: '' },
  { label: '红', value: '#ef4444' },
  { label: '橙', value: '#f97316' },
  { label: '琥珀', value: '#f59e0b' },
  { label: '黄', value: '#eab308' },
  { label: '柠', value: '#84cc16' },
  { label: '绿', value: '#22c55e' },
  { label: '青', value: '#14b8a6' },
  { label: '天', value: '#0ea5e9' },
  { label: '蓝', value: '#3b82f6' },
  { label: '靛', value: '#6366f1' },
  { label: '紫', value: '#8b5cf6' },
  { label: '粉', value: '#ec4899' },
  { label: '玫', value: '#f43f5e' },
  { label: '茶', value: '#d97706' },
  { label: '墨', value: '#0f172a' }
]

export function colorStyle(value: string): React.CSSProperties {
  if (!value)
    return { background: 'linear-gradient(135deg, #d4d4d8 50%, #a1a1aa 50%)' }
  return { backgroundColor: value }
}

export function resolveColor(color: string | undefined): string | undefined {
  if (!color) return undefined
  return color
}

export const MAX_HOME_COPY_LENGTH = 240
