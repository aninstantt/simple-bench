import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  CalendarDays,
  CalendarRange,
  Check,
  CircleChevronLeft,
  Hash,
  History,
  SquareSplitHorizontal,
  Timer,
  Undo2
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { ColorButton } from '@/components/custom/color-button'
import { WithLoading } from '@/components/custom/with-loading'
import { RoutineCalendar } from '@/components/shadcn-space/calendar/calendar-15'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { addCheckIn, getRoutine, loadCheckIns, updateRoutineDesc } from './db'
import { RoutineDescription } from './routine-description'

export function RoutineDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false }) as { id: string }
  const routineId = Number(id)

  const [hydrated, setHydrated] = useState(false)
  const [routine, setRoutine] = useState<Routine.RoutineItem | undefined>()
  const [checkIns, setCheckIns] = useState<Routine.CheckInItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const [data, items] = await Promise.all([
        getRoutine(routineId),
        loadCheckIns(routineId)
      ])
      setRoutine(data)
      setCheckIns(items)
      setHydrated(true)
    })()
  }, [routineId])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayCheckIns = checkIns.filter(ci => ci.dateStr === todayStr)
  const lastCheckIn = todayCheckIns.length
    ? todayCheckIns[todayCheckIns.length - 1]
    : null
  const lastCheckInEver = checkIns.length ? checkIns[checkIns.length - 1] : null

  const nextCheckInTime =
    routine && lastCheckIn
      ? lastCheckIn.timestamp + routine.minIntervalSeconds
      : null
  const todayFull =
    routine != null && todayCheckIns.length >= routine.timesPerDay

  const canCheckIn =
    routine != null &&
    todayCheckIns.length < routine.timesPerDay &&
    (lastCheckIn == null ||
      Math.floor(Date.now() / 1000) - lastCheckIn.timestamp >=
        routine.minIntervalSeconds)

  const handleCheckIn = async () => {
    if (!routine) return
    const nowTs = Math.floor(Date.now() / 1000)
    const currentDateStr = format(new Date(), 'yyyy-MM-dd')
    const latest = await loadCheckIns(routineId)
    const todayItems = latest.filter(ci => ci.dateStr === currentDateStr)
    const last = todayItems.length ? todayItems[todayItems.length - 1] : null
    if (todayItems.length >= routine.timesPerDay) return
    if (last && nowTs - last.timestamp < routine.minIntervalSeconds) return

    await addCheckIn({
      routineId,
      dateStr: currentDateStr,
      timestamp: nowTs
    })
    setCheckIns(await loadCheckIns(routineId))
    setDialogOpen(false)
  }

  const handleSaveDesc = async (desc: string) => {
    if (!routine) return
    await updateRoutineDesc(routineId, desc)
    setRoutine({ ...routine, desc })
  }

  if (!hydrated) {
    return (
      <WithLoading loading={true}>
        <section className="mx-auto min-h-[40vh] max-w-lg" />
      </WithLoading>
    )
  }

  if (!routine) {
    return (
      <WithLoading loading={false}>
        <section className="mx-auto max-w-lg space-y-4">
          <p className="text-sm text-zinc-500">日常任务不存在</p>
          <Button
            variant="ghost"
            onClick={() => void navigate({ to: '/routine' })}
          >
            <Undo2 className="size-4" />
          </Button>
        </section>
      </WithLoading>
    )
  }

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-600/50">
            <CalendarDays className="size-4" />
          </div>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-700 dark:text-zinc-200">
            {routine.name}
          </h1>
          <Button
            type="button"
            variant="outline"
            className="size-9 shrink-0 rounded-full p-0"
            aria-label="返回"
            onClick={() => void navigate({ to: '/routine' })}
          >
            <CircleChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              日期范围
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <CalendarRange className="size-3.5 text-zinc-400" />
              {routine.startDate} ~ {routine.endDate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              每天次数
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <Hash className="size-3.5 text-zinc-400" />
              {routine.timesPerDay}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              最小间隔
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <SquareSplitHorizontal className="size-3.5 text-zinc-400" />
              {routine.minIntervalSeconds / 3600} 小时
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              上次打卡时间
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <History className="size-3.5 text-zinc-400" />
              {lastCheckInEver
                ? format(
                    new Date(lastCheckInEver.timestamp * 1000),
                    'yyyy-MM-dd HH:mm:ss'
                  )
                : '—'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              下次可打卡
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-200">
              <Timer className="size-3.5 text-zinc-400" />
              {todayFull
                ? '今日已完成'
                : nextCheckInTime
                  ? format(new Date(nextCheckInTime * 1000), 'HH:mm:ss')
                  : '现在'}
            </span>
          </div>
        </div>

        <ColorButton
          type="green"
          className="h-9 w-full text-sm"
          disabled={!canCheckIn}
          onClick={() => setDialogOpen(true)}
        >
          <Check className="size-4" />
          打卡
        </ColorButton>

        <RoutineDescription desc={routine.desc} onSave={handleSaveDesc} />

        <div className="flex justify-center">
          <RoutineCalendar
            startDate={routine.startDate}
            endDate={routine.endDate}
            timesPerDay={routine.timesPerDay}
            checkIns={checkIns}
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">确认打卡吗？</DialogTitle>
              <DialogDescription className="sr-only">
                确认本次打卡记录
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <ColorButton
                type="blue"
                className="h-9 w-auto px-4 text-sm"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </ColorButton>
              <ColorButton
                type="green"
                className="h-9 w-auto px-4 text-sm"
                onClick={handleCheckIn}
              >
                确认
              </ColorButton>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </WithLoading>
  )
}
