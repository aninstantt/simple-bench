import { format } from 'date-fns'
import { useState } from 'react'

import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type RoutineCalendarProps = {
  startDate: string
  endDate: string
  timesPerDay: number
  checkIns: Routine.CheckInItem[]
}

const dotBase = 'h-1 w-1 rounded-full'
const dots = {
  future: 'future',
  full: 'full',
  partial: 'partial',
  none: 'none'
} as const

type DotKey = (typeof dots)[keyof typeof dots]

const tierConfig: Record<
  DotKey,
  {
    label: string
    textClass: string
    dotClass: string
    bgClass: string
    borderClass: string
  }
> = {
  future: {
    label: '未到日期',
    textClass: 'text-zinc-400',
    dotClass: `bg-zinc-300 ${dotBase}`,
    bgClass: 'bg-zinc-400/10',
    borderClass: 'border-zinc-400/30'
  },
  full: {
    label: '已全部打卡',
    textClass: 'text-teal-400',
    dotClass: `bg-teal-400 ${dotBase}`,
    bgClass: 'bg-teal-400/10',
    borderClass: 'border-teal-400/30'
  },
  partial: {
    label: '部分打卡',
    textClass: 'text-orange-400',
    dotClass: `bg-orange-400 ${dotBase}`,
    bgClass: 'bg-orange-400/10',
    borderClass: 'border-orange-400/30'
  },
  none: {
    label: '未打卡',
    textClass: 'text-red-500',
    dotClass: `bg-red-500 ${dotBase}`,
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30'
  }
}

function RoutineCalendar({
  startDate,
  endDate,
  timesPerDay,
  checkIns
}: RoutineCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date())
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  function inRange(date: Date) {
    const ds = format(date, 'yyyy-MM-dd')
    return ds >= startDate && ds <= endDate
  }

  const countByDate: Record<string, number> = {}
  const checkInsByDate: Record<string, Routine.CheckInItem[]> = {}
  for (const ci of checkIns) {
    countByDate[ci.dateStr] = (countByDate[ci.dateStr] || 0) + 1
    if (!checkInsByDate[ci.dateStr]) checkInsByDate[ci.dateStr] = []
    checkInsByDate[ci.dateStr].push(ci)
  }

  function getDotKey(date: Date): DotKey {
    const ds = format(date, 'yyyy-MM-dd')
    if (ds > todayStr) return 'future'
    const count = countByDate[ds] || 0
    if (count >= timesPerDay) return 'full'
    if (count > 0) return 'partial'
    return 'none'
  }

  const selectedStr = selected ? format(selected, 'yyyy-MM-dd') : null
  const selectedKey = selected ? getDotKey(selected) : null
  const selectedCheckIns = selectedStr ? checkInsByDate[selectedStr] || [] : []

  return (
    <Card className="w-fit overflow-hidden p-4">
      <CardContent className="flex flex-col gap-4 p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          showOutsideDays={false}
          className="[--cell-size:--spacing(9)] md:[--cell-size:--spacing(12)]"
          defaultMonth={new Date(startDate)}
          disabled={date => !inRange(date)}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const outside = !inRange(day.date)

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  <span className="text-xs leading-none font-medium">
                    {children}
                  </span>
                  {!outside && !modifiers.outside && (
                    <span
                      className={tierConfig[getDotKey(day.date)].dotClass}
                    />
                  )}
                </CalendarDayButton>
              )
            }
          }}
        />

        {selectedStr && (
          <>
            <Separator />
            <div
              className={`flex flex-col gap-3 rounded-xl border p-4 ${tierConfig[selectedKey!].bgClass} ${tierConfig[selectedKey!].borderClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {selected!.toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <span
                  className={`text-xs font-medium ${tierConfig[selectedKey!].textClass}`}
                >
                  {tierConfig[selectedKey!].label}
                </span>
              </div>

              {selectedCheckIns.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  无打卡记录
                </p>
              ) : (
                <ul className="space-y-1">
                  {selectedCheckIns.map(ci => (
                    <li
                      key={ci.id}
                      className="text-sm text-zinc-600 dark:text-zinc-300"
                    >
                      {format(new Date(ci.timestamp * 1000), 'HH:mm:ss')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { RoutineCalendar }
