declare global {
  namespace Routine {
    type RoutineItem = {
      id?: number
      name: string
      startDate: string
      endDate: string
      timesPerDay: number
      minIntervalSeconds: number
      desc: string
    }

    type TableRoutine = {
      id: number
      name: string
      startDate: string
      endDate: string
      timesPerDay: number
      minIntervalSeconds: number
      desc: string
    }

    type CheckInItem = {
      id?: number
      routineId: number
      dateStr: string
      timestamp: number
    }

    type TableCheckIn = {
      id: number
      routineId: number
      dateStr: string
      timestamp: number
    }
  }
}

export {}
