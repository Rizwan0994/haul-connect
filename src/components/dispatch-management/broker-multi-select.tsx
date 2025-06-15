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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { brokerApi, Broker } from '@/services/brokerApi'
import { useToast } from '@/components/ui/use-toast'

interface BrokerMultiSelectProps {
  value: Broker[]
  onChange: (brokers: Broker[]) => void
  placeholder?: string
  className?: string
}

export function BrokerMultiSelect({
  value = [],
  onChange,
  placeholder = "Select brokers...",
  className
}: BrokerMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch brokers on component mount
  useEffect(() => {
    fetchBrokers()
  }, [])

  const fetchBrokers = async () => {
    try {
      setLoading(true)
      const response = await brokerApi.getAllBrokers()
      setBrokers(response.brokers)
    } catch (error) {
      console.error('Error fetching brokers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch brokers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (broker: Broker) => {
    const isSelected = value.some(b => b.id === broker.id)
    if (isSelected) {
      // Remove broker
      onChange(value.filter(b => b.id !== broker.id))
    } else {
      // Add broker
      onChange([...value, broker])
    }
  }

  const handleRemove = (brokerId: number) => {
    onChange(value.filter(b => b.id !== brokerId))
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
              ? `${value.length} broker${value.length > 1 ? 's' : ''} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search brokers..." />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading brokers...</CommandEmpty>
              ) : brokers.length === 0 ? (
                <CommandEmpty>No brokers found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {brokers.map((broker) => {
                    const isSelected = value.some(b => b.id === broker.id)
                    return (
                      <CommandItem
                        key={broker.id}
                        value={`${broker.brokerage_company} ${broker.agent_name}`}
                        onSelect={() => handleSelect(broker)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{broker.brokerage_company}</div>
                          <div className="text-sm text-muted-foreground">
                            {broker.agent_name}
                            {broker.agent_email && ` • ${broker.agent_email}`}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Brokers Display */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((broker) => (
            <Card key={broker.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Broker</Badge>
                    <span className="font-medium">{broker.brokerage_company}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>Agent: {broker.agent_name}</div>
                    {broker.agent_email && <div>Email: {broker.agent_email}</div>}
                    {broker.agent_phone && <div>Phone: {broker.agent_phone}</div>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(broker.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
