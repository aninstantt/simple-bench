import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_THEME = 'user-config:theme'
const STORAGE_KEY_BACKGROUND = 'user-config:background'
const STORAGE_KEY_DOCK_VISIBLE = 'user-config:dock-visible'
const STORAGE_KEY_DOCK_MENU_ITEMS = 'user-config:dock-menu-items'
const STORAGE_KEY_HOME_COPY = 'user-config:home-copy'
const STORAGE_KEY_HOME_VIEW = 'user-config:home-view'

export const DEFAULT_HOME_COPY =
  '一个轻量的工具箱 🎐，适配移动端与电脑端 🍃，可以离线使用 ✨'

export const DEFAULT_DOCK_MENU_ITEMS: State.UserConfig.DockMenuItem[] = [
  { key: 'home', visible: true, color: '#3b82f6' },
  { key: 'todo', visible: true, color: '#ef4444' },
  { key: 'entry', visible: true, color: '#84cc16' },
  { key: 'routine', visible: true, color: '#14b8a6' },
  { key: 'frequent-text', visible: false, color: '#d97706' },
  { key: 'aes', visible: false, color: '#8b5cf6' },
  { key: 'share', visible: false, color: '#ec4899' },
  { key: 'note', visible: false }
]

export function normalizeDockMenuItems(
  input: State.UserConfig.DockMenuItem[]
): State.UserConfig.DockMenuItem[] {
  if (!Array.isArray(input)) return [...DEFAULT_DOCK_MENU_ITEMS]

  const knownKeys = new Set<State.UserConfig.DockMenuKey>(
    DEFAULT_DOCK_MENU_ITEMS.map(item => item.key)
  )
  const nextItems: State.UserConfig.DockMenuItem[] = []
  const seenKeys = new Set<State.UserConfig.DockMenuKey>()

  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    if (!knownKeys.has(item.key)) continue
    if (seenKeys.has(item.key)) continue
    nextItems.push({
      key: item.key,
      visible: item.visible !== false,
      color:
        typeof item.color === 'string' && item.color.length > 0
          ? item.color
          : undefined
    })
    seenKeys.add(item.key)
  }

  for (const defaultItem of DEFAULT_DOCK_MENU_ITEMS) {
    if (seenKeys.has(defaultItem.key)) continue
    nextItems.push({ ...defaultItem })
  }

  return nextItems
}

export const themeAtom = atomWithStorage<State.UserConfig.Theme>(
  STORAGE_KEY_THEME,
  'light',
  undefined,
  { getOnInit: true }
)

export const backgroundAtom = atomWithStorage<State.UserConfig.BackgroundMode>(
  STORAGE_KEY_BACKGROUND,
  'none'
)

export const dockVisibleAtom = atomWithStorage<boolean>(
  STORAGE_KEY_DOCK_VISIBLE,
  true
)

export const dockMenuItemsAtom = atomWithStorage<
  State.UserConfig.DockMenuItem[]
>(STORAGE_KEY_DOCK_MENU_ITEMS, DEFAULT_DOCK_MENU_ITEMS)

export const homeCopyAtom = atomWithStorage<string>(
  STORAGE_KEY_HOME_COPY,
  DEFAULT_HOME_COPY
)

export const homeViewAtom = atomWithStorage<State.UserConfig.HomeView>(
  STORAGE_KEY_HOME_VIEW,
  'bookmark',
  undefined,
  { getOnInit: true }
)
