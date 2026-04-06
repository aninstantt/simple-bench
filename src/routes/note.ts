import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { NoteDetailPage } from '../modules/note/detail-page'
import { NotePage } from '../modules/note/page'

export function registerNoteRoutes(rootRoute: AnyRoute) {
  const noteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'note',
    component: NotePage
  })

  const noteDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'note/$id',
    component: NoteDetailPage
  })

  return [noteRoute, noteDetailRoute] as const
}
