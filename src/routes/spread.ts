import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { SpreadPage } from '../modules/spread/page'

export function registerSpreadRoutes(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: 'spread',
    component: SpreadPage
  })
}
