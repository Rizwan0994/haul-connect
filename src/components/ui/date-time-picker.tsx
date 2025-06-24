import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showTime?: boolean;
  required?: boolean;
  clearable?: boolean;
  label?: string;
  error?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  className,
  showTime = false,
  required = false,
  clearable = true,
  label,
  error,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Initialize with current date/time if no date is provided
  const currentDate = React.useMemo(() => date && isValid(date) ? date : new Date(), [date]);
  
  const [timeValue, setTimeValue] = React.useState(() => 
    format(currentDate, "HH:mm")
  );

  // Set default date to current date/time on mount if no date provided and required
  React.useEffect(() => {
    if (!date && onDateChange && required) {
      const now = new Date();
      onDateChange(now);
      setTimeValue(format(now, "HH:mm"));
    }
  }, [date, onDateChange, required]);

  // Keep time value in sync with date prop when it changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange?.(undefined);
      return;
    }

    let newDate = new Date(selectedDate);
    
    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      newDate.setHours(hours, minutes);
    } else {
      // If not showing time, set time to noon to avoid timezone issues
      newDate.setHours(12, 0, 0, 0);
    }
    
    onDateChange?.(newDate);
    
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    
    if (!date) {
      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      now.setHours(hours, minutes, 0, 0);
      onDateChange?.(now);
      return;
    }
    
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    onDateChange?.(newDate);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
    setTimeValue(format(new Date(), "HH:mm"));
  };

  const formatDate = (date: Date | undefined) => {
    if (!date || !isValid(date)) return "";
    return showTime ? format(date, "PPP 'at' p") : format(date, "PPP");
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label} {required && <span className="text-destructive">*</span>}
          </span>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                error && "border-destructive ring-1 ring-destructive"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date && isValid(date) ? formatDate(date) : <span>{placeholder}</span>}
            </Button>
            {clearable && date && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-0 hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Clear date</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 min-w-[320px]" align="start">          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disabled}
            className="rounded-md border"
          />
          {showTime && (
            <div className="border-t bg-background p-3">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Set time</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-auto text-center"
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">
                  {format(
                    parse(timeValue, "HH:mm", new Date()),
                    "h:mm a"
                  )}
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const now = new Date();
                    const timeNow = format(now, "HH:mm");
                    setTimeValue(timeNow);
                    onDateChange?.(now);
                  }}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
