import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { SharePage } from '../modules/share/page'

export function registerShareRoutes(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: 'share',
    component: SharePage
  })
}
