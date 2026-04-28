import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from '@tanstack/react-router'

import { RootLayout } from './layouts/root-layout'
import { GlobalErrorPage } from './modules/error/page'
import { HomePage } from './modules/home/page'
import { NotFoundPage } from './modules/not-found/page'
import { registerAesRoutes } from './routes/aes'
import { registerCatchAllRoute } from './routes/catch-all'
import { registerNoteRoutes } from './routes/note'
import { registerSpreadRoutes } from './routes/spread'
import { registerTodoRoutes } from './routes/todo'

const rootRoute = createRootRoute({
  component: RootLayout
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
})

const aesRoute = registerAesRoutes(rootRoute)
const spreadRoute = registerSpreadRoutes(rootRoute)
const todoRoute = registerTodoRoutes(rootRoute)
const [noteRoute, noteDetailRoute] = registerNoteRoutes(rootRoute)
const catchAllRoute = registerCatchAllRoute(rootRoute)

export const routeTree = rootRoute.addChildren([
  indexRoute,
  aesRoute,
  spreadRoute,
  todoRoute,
  noteRoute,
  noteDetailRoute,
  catchAllRoute
])

const router = createRouter({
  routeTree,
  defaultErrorComponent: GlobalErrorPage,
  defaultNotFoundComponent: NotFoundPage
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
