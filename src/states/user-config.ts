import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_THEME = 'user-config:theme'
const STORAGE_KEY_BACKGROUND = 'user-config:background'
const STORAGE_KEY_DOCK_VISIBLE = 'user-config:dock-visible'

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
