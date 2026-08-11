import Dexie, { type EntityTable } from 'dexie'

const DB_NAME = 'routine'
const DB_VERSION = 1

const db = new Dexie(DB_NAME) as Dexie & {
  routines: EntityTable<Routine.TableRoutine, 'id'>
  check_ins: EntityTable<Routine.TableCheckIn, 'id'>
}

db.version(DB_VERSION).stores({
  routines: '++id',
  check_ins: '++id, routineId'
})

db.open().catch((e: unknown) => {
  console.error('Failed to open database', DB_NAME, e)
})

export async function loadRoutines(): Promise<Routine.RoutineItem[]> {
  return db.routines.toArray()
}

export async function addRoutine(
  data: Omit<Routine.RoutineItem, 'id'>
): Promise<number> {
  return db.routines.add(data as Routine.TableRoutine)
}

export async function getRoutine(
  id: number
): Promise<Routine.RoutineItem | undefined> {
  return db.routines.get(id)
}

export async function deleteRoutine(id: number): Promise<void> {
  await db.routines.delete(id)
  await db.check_ins.where('routineId').equals(id).delete()
}

export async function updateRoutineName(
  id: number,
  name: string
): Promise<void> {
  await db.routines.update(id, { name })
}

export async function loadCheckIns(
  routineId: number
): Promise<Routine.CheckInItem[]> {
  return db.check_ins.where('routineId').equals(routineId).toArray()
}

export async function addCheckIn(
  data: Omit<Routine.CheckInItem, 'id'>
): Promise<number> {
  return db.check_ins.add(data as Routine.TableCheckIn)
}

export async function deleteCheckIn(id: number): Promise<void> {
  await db.check_ins.delete(id)
}

export { db }
