import type { AnyRoute } from '@tanstack/react-router'

import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import * as React from 'react'

import { WithLoading } from '../components/custom/with-loading'
import { EntryPage } from '../modules/entry/page'

const EntrySpacePage = lazyRouteComponent(
  () => import('../modules/entry/space-page'),
  'EntrySpacePage'
)

const EntryDetailPage = lazyRouteComponent(
  () => import('../modules/entry/entry-detail-page'),
  'EntryDetailPage'
)

function PendingRoute() {
  return React.createElement(WithLoading, {
    loading: true,
    children: React.createElement('div', {
      className: 'min-h-[40vh]'
    })
  })
}

export function registerEntryRoutes(rootRoute: AnyRoute) {
  const entryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'entry',
    component: EntryPage
  })

  const entrySpaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'entry/$spaceId',
    component: EntrySpacePage,
    pendingComponent: PendingRoute
  })

  const entryDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'entry/$spaceId/$entryName',
    component: EntryDetailPage,
    pendingComponent: PendingRoute
  })

  return [entryRoute, entrySpaceRoute, entryDetailRoute] as const
}
