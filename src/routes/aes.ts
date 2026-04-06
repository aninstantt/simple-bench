import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { AesPage } from '../modules/aes/page'

export function registerAesRoutes(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: 'aes',
    component: AesPage
  })
}
