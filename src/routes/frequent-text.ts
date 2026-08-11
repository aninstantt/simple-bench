import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { FrequentTextPage } from '../modules/frequent-text/page'

export function registerFrequentTextRoutes(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: 'frequent-text',
    component: FrequentTextPage
  })
}
