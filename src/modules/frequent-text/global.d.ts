export {}

declare global {
  namespace FrequentText {
    type TextItem = {
      id: number
      name: string
      content: string
      updateTime: number
    }
    type TableText = {
      id: number
      name: string
      content: string
      updateTime: number
    }
  }
}
