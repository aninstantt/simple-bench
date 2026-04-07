import type { AnyRoute } from '@tanstack/react-router'

import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import * as React from 'react'

import { WithLoading } from '../components/custom/with-loading'
import { NotePage } from '../modules/note/page'

const NoteDetailPage = lazyRouteComponent(
  () => import('../modules/note/detail-page'),
  'NoteDetailPage'
)

function PendingRoute() {
  return React.createElement(WithLoading, {
    loading: true,
    children: React.createElement('div', {
      className: 'min-h-[40vh]'
    })
  })
}

export function registerNoteRoutes(rootRoute: AnyRoute) {
  const noteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'note',
    component: NotePage
  })

  const noteDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'note/$id',
    component: NoteDetailPage,
    pendingComponent: PendingRoute
  })

  return [noteRoute, noteDetailRoute] as const
}
