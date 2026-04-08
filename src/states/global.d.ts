export {}

declare global {
  namespace State {
    namespace UserConfig {
      type Theme = 'dark' | 'light'
      type Language = 'chinese' | 'english'
      type BackgroundMode = 'gravity' | 'fireworks' | 'none'
    }

    namespace Todo {
      type ShowButtons = boolean
    }
  }
}
