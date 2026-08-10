'use client'

import { format } from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: (date: Date) => boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = '',
  className,
  disabled
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const dateValue = value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 w-full cursor-pointer justify-start text-left font-normal transition-all hover:bg-muted/50',
            !dateValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4 opacity-70" />
          {dateValue ? format(dateValue, 'yyyy-MM-dd') : placeholder}
          <ChevronDown className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-muted-foreground/10 p-0 shadow-2xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={d => {
            if (d) {
              onChange?.(format(d, 'yyyy-MM-dd'))
            }
            setOpen(false)
          }}
          disabled={disabled}
          className="rounded-md border-none"
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
