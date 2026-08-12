declare global {
  namespace Entry {
    type Space = {
      id?: number
      name: string
      description: string
      sortOrder: number
    }

    type TableSpace = {
      id: number
      name: string
      description: string
      sortOrder: number
    }

    type EntryItem = {
      id?: number
      spaceId: number
      name: string
      description: string
      category: string
    }

    type TableEntry = {
      id: number
      spaceId: number
      name: string
      description: string
      category: string
    }
  }
}

export {}
