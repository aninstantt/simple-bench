import type { AnyRoute } from '@tanstack/react-router'

import { createRoute } from '@tanstack/react-router'

import { NotFoundPage } from '../modules/not-found/page'

/** 放在 root 子路由最后；未知路径（如 /not）由 `$` 兜底，避免 fuzzy 下 Outlet 空白。 */
export function registerCatchAllRoute(rootRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
    component: NotFoundPage
  })
}
