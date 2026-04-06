declare global {
  namespace Note {
    type NoteListItem = {
      id: number
      title: string
      group: string
    }

    type NoteItem = {
      id: number
      title: string
      group: string
      content: string
    }

    type TableNote = {
      id: number
      title: string
      group: string
      content: string
    }
  }
}

export {}
