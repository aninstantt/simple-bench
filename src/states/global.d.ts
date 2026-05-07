export {}

declare global {
  namespace State {
    namespace UserConfig {
      type Theme = 'dark' | 'light'
      type Language = 'chinese' | 'english'
      type BackgroundMode = 'gravity' | 'fireworks' | 'none'
      type DockMenuKey = 'home' | 'aes' | 'share' | 'todo' | 'note'
      type DockMenuItem = {
        key: DockMenuKey
        visible: boolean
      }
    }

    namespace Todo {
      type ShowButtons = boolean
    }

    namespace Password {
      type RandomOptions = {
        length: number
        withDigits: boolean
        withSymbols: boolean
        withoutSimilarLetters: boolean
      }
    }
  }
}
