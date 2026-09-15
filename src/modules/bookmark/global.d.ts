declare global {
  namespace Bookmark {
    type Folder = {
      id?: number
      name: string
      sortOrder: number
    }

    type TableFolder = {
      id: number
      name: string
      sortOrder: number
    }

    type Item = {
      id?: number
      folderId: number | null
      name: string
      url: string
      sortOrder: number
    }

    type TableItem = {
      id: number
      folderId: number | null
      name: string
      url: string
      sortOrder: number
    }
  }
}

export {}
