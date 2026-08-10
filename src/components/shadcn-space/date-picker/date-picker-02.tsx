'use client'

import { format } from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateRangePickerProps = {
  value?: { from?: string; to?: string }
  onChange?: (range: { from: string; to: string }) => void
  placeholder?: string
  className?: string
}

function DateRangePicker({
  value,
  onChange,
  placeholder = '选择日期范围',
  className
}: DateRangePickerProps) {
  const dateRange: DateRange | undefined =
    value?.from || value?.to
      ? {
          from: value.from ? new Date(value.from) : undefined,
          to: value.to ? new Date(value.to) : undefined
        }
      : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 w-full cursor-pointer justify-start text-left font-normal transition-all hover:bg-muted/50 focus:ring-2 focus:ring-primary/20',
            !dateRange?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4 opacity-70" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'yyyy-MM-dd')} —{' '}
                {format(dateRange.to, 'yyyy-MM-dd')}
              </>
            ) : (
              format(dateRange.from, 'yyyy-MM-dd')
            )
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-muted/20 p-0 shadow-xl"
        align="start"
      >
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={range => {
            if (range?.from) {
              onChange?.({
                from: format(range.from, 'yyyy-MM-dd'),
                to: range.to ? format(range.to, 'yyyy-MM-dd') : ''
              })
            }
          }}
          numberOfMonths={2}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
