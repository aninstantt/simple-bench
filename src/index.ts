import Dexie from 'dexie'
import { getDefaultStore } from 'jotai'

import { hasUnsyncedChangesAtom, syncModulesAtom } from './states/simple-bench'

const store = getDefaultStore()

const originalOpen = Dexie.prototype.open

Dexie.prototype.open = function () {
  const db = this as Dexie

  db.tables.forEach(table => {
    table.hook('creating', () => {
      globalMarkAsDirty(db.name)
    })
    table.hook('updating', () => {
      globalMarkAsDirty(db.name)
    })
    table.hook('deleting', () => {
      globalMarkAsDirty(db.name)
    })
  })

  return originalOpen.apply(this)
}

function globalMarkAsDirty(dbName: string) {
  const enabledModules = store.get(syncModulesAtom) as string[]
  if (!enabledModules.includes(dbName)) return
  store.set(hasUnsyncedChangesAtom, true)
}
