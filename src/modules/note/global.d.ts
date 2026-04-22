declare global {
  namespace Note {
    type NoteListItem = {
      id: number
      title: string
      group: string
      updateTime: number
    }

    type NoteItem = {
      id: number
      title: string
      group: string
      content: string
      updateTime: number
    }

    type TableNote = {
      id: number
      title: string
      group: string
      content: string
      updateTime: number
    }
  }
}

export {}
