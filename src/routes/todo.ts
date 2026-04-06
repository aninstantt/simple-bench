import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { TodoPage } from '../modules/todo/page'

export function registerTodoRoutes(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: 'todo',
    component: TodoPage
  })
}
