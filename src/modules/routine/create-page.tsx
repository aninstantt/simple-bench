import { useNavigate } from '@tanstack/react-router'
import { addMonths, format, startOfDay } from 'date-fns'
import { CalendarDays, LoaderPinwheel, Check, Undo2 } from 'lucide-react'
import { useState } from 'react'

import { ColorButton } from '@/components/custom/color-button'
import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'
import { DatePicker } from '@/components/shadcn-space/date-picker/date-picker-01'
import { Input } from '@/components/ui/input'

import { addRoutine } from './db'

function hoursToSeconds(h: string): number {
  return (Number(h) || 0) * 3600
}

const today = startOfDay(new Date())

const notBeforeToday = (date: Date) => date < today
const label = 'w-24 shrink-0 text-sm text-zinc-600 dark:text-zinc-300'
const input = 'h-9 flex-1 text-sm'

export function CreateRoutinePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(
    format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [timesPerDay, setTimesPerDay] = useState('')
  const [intervalHours, setIntervalHours] = useState('')

  const canSave = name.trim() && startDate && endDate

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    await addRoutine({
      name: name.trim(),
      startDate,
      endDate,
      timesPerDay: Number(timesPerDay) || 1,
      minIntervalSeconds: hoursToSeconds(intervalHours || '4'),
      desc: ''
    })
    void navigate({ to: '/routine' })
  }

  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-5">
        <PageHeader
          icon={<CalendarDays className="size-4" />}
          title="创建日常"
          hideActions
        />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={label}>任务名称</span>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className={input}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <span className={label}>开始日期</span>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              disabled={notBeforeToday}
              className={`${input} w-full`}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className={label}>结束日期</span>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              disabled={notBeforeToday}
              className={`${input} w-full`}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className={label}>每天打卡次数</span>
            <Input
              value={timesPerDay}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                const n = Number(val)
                if (val === '' || n <= 10) setTimesPerDay(val)
              }}
              placeholder="1~10, 默认 1"
              className={input}
              inputMode="numeric"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className={label}>每次间隔时间</span>
            <Input
              value={intervalHours}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                const n = Number(val)
                if (val === '' || n <= 12) setIntervalHours(val)
              }}
              placeholder="0~12 小时, 默认 4"
              className={input}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <ColorButton
            type="green2"
            className="h-9 w-9 p-0"
            onClick={() => void navigate({ to: '/routine' })}
            aria-label="取消"
          >
            <Undo2 className="size-4" />
          </ColorButton>
          <ColorButton
            type="green"
            className="h-9 w-9 p-0"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? (
              <LoaderPinwheel className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
          </ColorButton>
        </div>
      </section>
    </WithLoading>
  )
}
