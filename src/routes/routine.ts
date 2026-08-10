import type { AnyRoute } from '@tanstack/react-router'

import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import * as React from 'react'

import { WithLoading } from '../components/custom/with-loading'
import { RoutinePage } from '../modules/routine/page'

const CreateRoutinePage = lazyRouteComponent(
  () => import('../modules/routine/create-page'),
  'CreateRoutinePage'
)

const RoutineDetailPage = lazyRouteComponent(
  () => import('../modules/routine/detail-page'),
  'RoutineDetailPage'
)

function PendingRoute() {
  return React.createElement(WithLoading, {
    loading: true,
    children: React.createElement('div', {
      className: 'min-h-[40vh]'
    })
  })
}

export function registerRoutineRoutes(rootRoute: AnyRoute) {
  const routineRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'routine',
    component: RoutinePage
  })

  const routineCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'routine/create',
    component: CreateRoutinePage,
    pendingComponent: PendingRoute
  })

  const routineDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'routine/$id',
    component: RoutineDetailPage,
    pendingComponent: PendingRoute
  })

  return [routineRoute, routineCreateRoute, routineDetailRoute] as const
}
