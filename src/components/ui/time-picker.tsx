import { cn } from '@/lib/utils'

type TimePickerProps = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  min?: string
  max?: string
  className?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function TimePicker({
  value,
  onChange,
  disabled,
  min,
  max,
  className
}: TimePickerProps) {
  const [h = '00', m = '00'] = (value || '').split(':')

  const maxHour = max ? parseInt(max.split(':')[0]) : 23
  const minHour = min ? parseInt(min.split(':')[0]) : 0

  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) =>
    pad(minHour + i)
  )

  const isAtMaxHour = parseInt(h) === maxHour

  const minutes = isAtMaxHour
    ? ['00']
    : Array.from({ length: 60 }, (_, i) => pad(i))

  const handleHourChange = (hour: string) => {
    const nextHour = parseInt(hour)
    const currentM = nextHour === maxHour ? '00' : m || '00'
    onChange?.(`${hour}:${currentM}`)
  }

  const handleMinuteChange = (minute: string) => {
    onChange?.(`${h}:${minute}`)
  }

  const selectClass = cn(
    'h-full rounded border-0 bg-transparent px-1 text-center text-sm focus:outline-none',
    disabled && 'opacity-50'
  )

  return (
    <div
      className={cn(
        'flex h-10 items-center gap-0.5 rounded-md border bg-background px-2 transition-all focus-within:ring-2 focus-within:ring-primary/20',
        className
      )}
    >
      <select
        value={h}
        onChange={e => handleHourChange(e.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {hours.map(hour => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-sm text-zinc-400">:</span>
      <select
        value={m}
        onChange={e => handleMinuteChange(e.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {minutes.map(minute => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  )
}

export { TimePicker }
