import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  isInvalid?: boolean
  className?: string
  align?: "start" | "center" | "end"
}

export function DateTimePicker({ value, onChange, placeholder, isInvalid, className, align = "start" }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : "12:00"
  )

  React.useEffect(() => {
    if (value) {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate)
        setTime(format(parsedDate, "HH:mm"))
      }
    } else {
      setDate(undefined)
      setTime("12:00")
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    updateValue(selectedDate, time)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    updateValue(date, newTime)
  }

  const updateValue = (d: Date | undefined, t: string) => {
    if (!d || !onChange) return
    const [hours, minutes] = t.split(":").map(Number)
    const newDate = new Date(d)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    // Return a format that acts like datetime-local (YYYY-MM-DDTHH:mm)
    // Avoids timezone shift issues when saving locally before submit
    const localTime = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    onChange(localTime)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            aria-invalid={isInvalid}
            className={cn(
              "w-full justify-start text-left font-normal bg-transparent border-input overflow-hidden",
              !date && "text-muted-foreground",
              isInvalid && "border-destructive ring-1 ring-destructive",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">
          {date ? format(date, "PP p") : <span>{placeholder || "Pick a date"}</span>}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          autoFocus
        />
        <div className="p-3 border-t border-border flex items-center justify-between gap-4 bg-muted/20">
          <Label className="text-sm whitespace-nowrap">Time</Label>
          <Input
            type="time"
            className="w-full h-9 bg-background"
            value={time}
            onChange={handleTimeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
