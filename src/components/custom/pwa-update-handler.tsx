import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

let swRegistration: ServiceWorkerRegistration | null = null

export async function checkForUpdate() {
  if (!('serviceWorker' in navigator)) {
    toast.info('Service worker not supported')
    return
  }

  const registration =
    swRegistration ?? (await navigator.serviceWorker.getRegistration())

  if (!registration) {
    toast.info('No service worker registered')
    return
  }

  swRegistration = registration

  try {
    const newRegistration = await registration.update()

    if (newRegistration.installing || registration.waiting) {
      toast.loading('App updating...', { id: 'pwa-update' })
    } else {
      toast.info('No update available')
    }
  } catch {
    toast.error('Update check failed')
  }
}

export function PwaUpdateHandler() {
  const handleControllerChange = useCallback(() => {
    toast.success('App update complete', { duration: 3000 })
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange
    )

    void navigator.serviceWorker.getRegistration().then(registration => {
      if (!registration) return

      swRegistration = registration

      if (registration.installing) {
        toast.loading('App updating...', { id: 'pwa-update' })
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        toast.loading('App updating...', { id: 'pwa-update' })

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            toast.dismiss('pwa-update')
          }
        })
      })
    })

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange
      )
    }
  }, [handleControllerChange])

  return null
}
