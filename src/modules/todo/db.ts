import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'todo'
const DB_VERSION = 1
const ITEMS_ROW_ID = 1 as const

const db = new Dexie(DB_NAME) as Dexie & {
  todo: EntityTable<Todo.TableTodo, 'id'>
}

db.version(DB_VERSION).stores({
  todo: 'id'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadTodoItems(): Promise<Todo.TodoItem[]> {
  const row = await db.todo.get(ITEMS_ROW_ID)

  return row?.items ?? []
}

export async function saveTodoItems(items: Todo.TodoItem[]): Promise<void> {
  await db.todo.put({ id: ITEMS_ROW_ID, items })
}

export async function autoSync(items: Todo.TodoItem[]) {
  await saveTodoItems(items)
}
