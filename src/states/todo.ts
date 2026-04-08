import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_SHOW = 'todo:show-buttons'

export const showButtonsAtom = atomWithStorage<State.Todo.ShowButtons>(
  STORAGE_KEY_SHOW,
  true
)
