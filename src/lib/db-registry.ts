import type Dexie from 'dexie'

const registry = new Set<Dexie>()

export function registerDexie(db: Dexie): void {
  registry.add(db)
}

export function closeDexieByName(name: string): void {
  for (const db of registry) {
    if (db.name !== name) continue
    try {
      db.close()
    } catch {
      // ignore
    }
  }
}
