import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_THEME = 'user-config:theme'
const STORAGE_KEY_BACKGROUND = 'user-config:background'
const STORAGE_KEY_DOCK_VISIBLE = 'user-config:dock-visible'
const STORAGE_KEY_DOCK_MENU_ITEMS = 'user-config:dock-menu-items'
const STORAGE_KEY_HOME_COPY = 'user-config:home-copy'

export const DEFAULT_HOME_COPY =
  '一个轻量的工具箱 🎐，适配移动端与电脑端 🍃，可以离线使用 ✨'

export const DEFAULT_DOCK_MENU_ITEMS: State.UserConfig.DockMenuItem[] = [
  { key: 'home', visible: true },
  { key: 'aes', visible: true },
  { key: 'todo', visible: true },
  { key: 'note', visible: true },
  { key: 'share', visible: true }
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
    nextItems.push({ key: item.key, visible: item.visible !== false })
    seenKeys.add(item.key)
  }

  for (const defaultItem of DEFAULT_DOCK_MENU_ITEMS) {
    if (seenKeys.has(defaultItem.key)) continue
    nextItems.push({ ...defaultItem })
  }

  if (!nextItems.some(item => item.visible)) {
    return nextItems.map((item, index) => ({
      ...item,
      visible: index === 0
    }))
  }

  return nextItems
}

export const themeAtom = atomWithStorage<State.UserConfig.Theme>(
  STORAGE_KEY_THEME,
  'light'
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
