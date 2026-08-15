import Dexie from 'dexie'
import { getDefaultStore } from 'jotai'

import { hasUnsyncedChangesAtom } from './states/simple-bench'

const store = getDefaultStore()

const originalOpen = Dexie.prototype.open

Dexie.prototype.open = function () {
  const db = this as Dexie

  db.tables.forEach(table => {
    table.hook('creating', () => {
      globalMarkAsDirty(db.name, table.name, 'creating')
    })
    table.hook('updating', () => {
      globalMarkAsDirty(db.name, table.name, 'updating')
    })
    table.hook('deleting', () => {
      globalMarkAsDirty(db.name, table.name, 'deleting')
    })
  })

  return originalOpen.apply(this)
}

function globalMarkAsDirty(
  _dbName: string,
  _tableName: string,
  _action: string
) {
  store.set(hasUnsyncedChangesAtom, true)
}
