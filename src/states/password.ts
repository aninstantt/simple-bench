import { atomWithStorage } from 'jotai/utils'

const STORAGE_KEY_RANDOM_PASSWORD_OPTIONS = 'password:random-options'

export const DEFAULT_RANDOM_PASSWORD_OPTIONS: State.Password.RandomOptions = {
  length: 20,
  withDigits: true,
  withSymbols: true,
  withoutSimilarLetters: false
}

export const randomPasswordOptionsAtom =
  atomWithStorage<State.Password.RandomOptions>(
    STORAGE_KEY_RANDOM_PASSWORD_OPTIONS,
    DEFAULT_RANDOM_PASSWORD_OPTIONS
  )
