import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
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
}

function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  className
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const dateValue = value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 w-full cursor-pointer justify-start text-left font-normal transition-all hover:bg-muted/50 focus:ring-2 focus:ring-primary/20',
            !dateValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4 opacity-70" />
          {dateValue ? format(dateValue, 'yyyy-MM-dd') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-muted/20 p-0 shadow-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={date => {
            if (date) {
              onChange?.(format(date, 'yyyy-MM-dd'))
            }
            setOpen(false)
          }}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
