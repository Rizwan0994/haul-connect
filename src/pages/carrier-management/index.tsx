import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/ui/data-table'
import { createColumns } from '@/components/carrier-management/columns'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { carrierApiService, CarrierProfile } from '@/services/carrierApi'
import { useToast } from '@/components/ui/use-toast'
import { Carrier } from '@/components/carrier-management/columns'
import { UserAssignmentProvider } from '@/components/carrier-management/user-assignment-provider'

export default function CarrierManagement() {
  const { toast } = useToast()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch carriers from API
  const fetchCarriers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using the carriers data service for fetching
      const carrierData = await carrierApiService.getAllCarriers()      // Convert CarrierProfile[] to Carrier[]
      const formattedCarriers = carrierData.map(c => ({
        id: c.id?.toString() || '',
        mc_number: c.mc_number || '',
        company_name: c.company_name || '',
        owner_name: c.owner_name || '',
        driver_name: c.driver_name || '',
        driver_phone: c.driver_phone || '',
        driver_email: c.driver_email || '',
        phone_number: c.phone_number || '',
        email_address: c.email_address || '',
        truck_type: c.truck_type || '',
        status: c.status || 'pending',
        created_at: c.created_at || '',
        approval_status: c.approval_status || 'pending',
        approved_by_manager: c.approved_by_manager || '',
        approved_by_accounts: c.approved_by_accounts || '',
        manager_approved_at: c.manager_approved_at || '',
        accounts_approved_at: c.accounts_approved_at || '',
        // Commission tracking fields
        commission_status: c.commission_status,
        commission_amount: c.commission_amount,
        commission_paid_at: c.commission_paid_at,
        loads_completed: c.loads_completed,
        first_load_completed_at: c.first_load_completed_at
      }))
      setCarriers(formattedCarriers)
    } catch (err: any) {
      console.error('Error fetching carriers:', err)
      setError('Failed to load carriers. Please try again.')
      toast({
        title: 'Error',
        description: `Failed to load carriers: ${err.message}`,
        variant: 'destructive',
      })    } finally {
      setLoading(false)
    }
  }

  // Create columns with refresh function
  const columns = useMemo(() => createColumns(fetchCarriers), [])

  // Load carriers on component mount
  useEffect(() => {
    fetchCarriers()
  }, []);

  return (
    <UserAssignmentProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-none space-y-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Carrier Management</h1>
              <p className="text-muted-foreground">
                Manage your carrier profiles and assignments
              </p>
            </div><Link to="/carrier-management/create">
              <Button disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Carrier
              </Button>
            </Link>
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
          )}        {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading carriers...</span>
            </div>
          ) : (
            <div className="flex-grow overflow-hidden px-6 pb-6">
              <div className="h-full overflow-auto rounded-md border">
                <DataTable 
                  columns={columns} 
                  data={carriers} 
                  searchPlaceholder="Search carriers..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </UserAssignmentProvider>
  )
}