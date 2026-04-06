declare global {
  namespace Todo {
    type TodoItem = {
      label: string
      checked: boolean
    }

    type TableTodo = {
      id: typeof ITEMS_ROW_ID
      items: TodoItem[]
    }
  }
}

export {}
