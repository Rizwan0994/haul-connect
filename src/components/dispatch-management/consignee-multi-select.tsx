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
import { consigneeApi, Consignee } from '@/services/consigneeApi'
import { useToast } from '@/components/ui/use-toast'

interface ConsigneeMultiSelectProps {
  value: Consignee[]
  onChange: (consignees: Consignee[]) => void
  placeholder?: string
  className?: string
  single?: boolean // Allow only single selection
}

export function ConsigneeMultiSelect({
  value = [],
  onChange,
  placeholder = "Select consignees...",
  className,
  single = false
}: ConsigneeMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [consignees, setConsignees] = useState<Consignee[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch consignees on component mount
  useEffect(() => {
    fetchConsignees()
  }, [])

  const fetchConsignees = async () => {
    try {
      setLoading(true)
      const response = await consigneeApi.getAllConsignees()
      setConsignees(response.consignees)
    } catch (error) {
      console.error('Error fetching consignees:', error)
      toast({
        title: "Error",
        description: "Failed to fetch consignees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (consignee: Consignee) => {
    const isSelected = value.some(c => c.id === consignee.id)
    if (isSelected) {
      // Remove consignee
      onChange(value.filter(c => c.id !== consignee.id))
    } else {
      // Add consignee
      if (single) {
        onChange([consignee])
      } else {
        onChange([...value, consignee])
      }
    }
    if (single) {
      setOpen(false)
    }
  }

  const handleRemove = (consigneeId: number) => {
    onChange(value.filter(c => c.id !== consigneeId))
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
                ? value[0].consignee_name 
                : `${value.length} consignee${value.length > 1 ? 's' : ''} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search consignees..." />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading consignees...</CommandEmpty>
              ) : consignees.length === 0 ? (
                <CommandEmpty>No consignees found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {consignees.map((consignee) => {
                    const isSelected = value.some(c => c.id === consignee.id)
                    return (
                      <CommandItem
                        key={consignee.id}
                        value={`${consignee.consignee_name} ${consignee.contact || ''}`}
                        onSelect={() => handleSelect(consignee)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{consignee.consignee_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {consignee.consignee_id}
                            {consignee.contact && ` • Contact: ${consignee.contact}`}
                            {consignee.email && ` • ${consignee.email}`}
                          </div>
                          {consignee.address && (
                            <div className="text-xs text-muted-foreground">
                              {consignee.address}
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
      </Popover>      {/* Selected Consignees Display - Chip Style */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Selected Consignees ({value.length})
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {value.map((consignee) => (
              <TooltipProvider key={consignee.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm max-w-[200px]">
                      <Badge variant="outline" className="text-xs px-1 py-0">C</Badge>
                      <span className="truncate flex-1">{consignee.consignee_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(consignee.id!)}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm">
                    <div className="space-y-1">
                      <div className="font-medium">{consignee.consignee_name}</div>
                      {consignee.contact && (
                        <div className="text-xs">Contact: {consignee.contact}</div>
                      )}
                      {consignee.telephone && (
                        <div className="text-xs">Phone: {consignee.telephone}</div>
                      )}
                      {consignee.email && (
                        <div className="text-xs">Email: {consignee.email}</div>
                      )}
                      {consignee.address && (
                        <div className="text-xs">Address: {consignee.address}</div>
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
