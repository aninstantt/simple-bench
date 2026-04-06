import { useEffect, useState } from 'react'

const TOUCH_QUERY = '(hover: none) and (pointer: coarse)'

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia(TOUCH_QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(TOUCH_QUERY)
    setIsTouch(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isTouch
}
