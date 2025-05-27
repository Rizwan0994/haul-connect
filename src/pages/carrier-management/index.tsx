import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/carrier-management/columns'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useCarrierModal } from '@/hooks/use-carrier-modal'
import { carrierApiService, CarrierProfile } from '@/services/carrierApi'
import { useToast } from '@/components/ui/use-toast'

export default function CarrierManagement() {
  const { onOpen } = useCarrierModal()
  const { toast } = useToast()
  const [carriers, setCarriers] = useState<CarrierProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch carriers from API
  const fetchCarriers = async () => {
    try {
      setLoading(true)
      setError(null)
      const carrierData = await carrierApiService.getAllCarriers()
      setCarriers(carrierData)
    } catch (err) {
      console.error('Error fetching carriers:', err)
      setError('Failed to load carriers. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load carriers. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Load carriers on component mount
  useEffect(() => {
    fetchCarriers()
  }, [])

  return (
    <div className="container mx-auto max-w-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carrier Management</h1>
            <p className="text-muted-foreground">
              Manage your carrier profiles and assignments
            </p>
          </div>
          <Button onClick={() => onOpen('create')} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Carrier
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">
                  Error loading carriers
                </h3>
                <div className="mt-2 text-sm text-destructive">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchCarriers}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading carriers...</span>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={carriers} 
            searchPlaceholder="Search carriers..."
          />
        )}
      </div>
    </div>
  )
}