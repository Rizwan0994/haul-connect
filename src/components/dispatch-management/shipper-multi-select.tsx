import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { shipperApi, Shipper } from '@/services/shipperApi'
import { useToast } from '@/components/ui/use-toast'

interface ShipperMultiSelectProps {
  value: Shipper[]
  onChange: (shippers: Shipper[]) => void
  placeholder?: string
  className?: string
  single?: boolean // Allow only single selection
}

export function ShipperMultiSelect({
  value = [],
  onChange,
  placeholder = "Select shippers...",
  className,
  single = false
}: ShipperMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [shippers, setShippers] = useState<Shipper[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch shippers on component mount
  useEffect(() => {
    fetchShippers()
  }, [])

  const fetchShippers = async () => {
    try {
      setLoading(true)
      const response = await shipperApi.getAllShippers()
      setShippers(response.shippers)
    } catch (error) {
      console.error('Error fetching shippers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch shippers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (shipper: Shipper) => {
    const isSelected = value.some(s => s.id === shipper.id)
    if (isSelected) {
      // Remove shipper
      onChange(value.filter(s => s.id !== shipper.id))
    } else {
      // Add shipper
      if (single) {
        onChange([shipper])
      } else {
        onChange([...value, shipper])
      }
    }
    if (single) {
      setOpen(false)
    }
  }

  const handleRemove = (shipperId: number) => {
    onChange(value.filter(s => s.id !== shipperId))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0 
              ? single 
                ? value[0].shipper_name 
                : `${value.length} shipper${value.length > 1 ? 's' : ''} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search shippers..." />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading shippers...</CommandEmpty>
              ) : shippers.length === 0 ? (
                <CommandEmpty>No shippers found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {shippers.map((shipper) => {
                    const isSelected = value.some(s => s.id === shipper.id)
                    return (
                      <CommandItem
                        key={shipper.id}
                        value={`${shipper.shipper_name} ${shipper.contact || ''}`}
                        onSelect={() => handleSelect(shipper)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{shipper.shipper_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {shipper.shipper_id}
                            {shipper.contact && ` • Contact: ${shipper.contact}`}
                            {shipper.email && ` • ${shipper.email}`}
                          </div>
                          {shipper.address && (
                            <div className="text-xs text-muted-foreground">
                              {shipper.address}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>      {/* Selected Shippers Display - Chip Style */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Selected Shippers ({value.length})
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {value.map((shipper) => (
              <TooltipProvider key={shipper.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm max-w-[200px]">
                      <Badge variant="outline" className="text-xs px-1 py-0">S</Badge>
                      <span className="truncate flex-1">{shipper.shipper_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(shipper.id!)}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm">
                    <div className="space-y-1">
                      <div className="font-medium">{shipper.shipper_name}</div>                      {shipper.contact && (
                        <div className="text-xs">Contact: {shipper.contact}</div>
                      )}
                      {shipper.telephone && (
                        <div className="text-xs">Phone: {shipper.telephone}</div>
                      )}
                      {shipper.email && (
                        <div className="text-xs">Email: {shipper.email}</div>
                      )}
                      {shipper.address && (
                        <div className="text-xs">Address: {shipper.address}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
