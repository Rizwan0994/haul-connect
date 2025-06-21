import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/dispatch-management/columns'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dispatchAPI, Dispatch } from '@/lib/dispatch-api'
import { useToast } from '@/components/ui/use-toast'
import { DashboardStats } from '@/components/dispatch-management/dashboard-stats'
import { CommissionDistribution } from '@/components/dispatch-management/commission-distribution'
import { TopDispatchers } from '@/components/dispatch-management/top-dispatchers'
import { PermissionGate } from '@/components/auth/permission-gate'

export default function DispatchManagement() {
  const { toast } = useToast();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dispatches from API
  const fetchDispatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const dispatchData = await dispatchAPI.getAllDispatches();
      setDispatches(dispatchData);
    } catch (err: any) {
      console.error('Error fetching dispatches:', err);
      setError('Failed to load dispatches. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load dispatches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dispatches on component mount
  useEffect(() => {
    fetchDispatches();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header section - always visible */}
      <div className="flex-none space-y-4 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch Management</h1>
            <p className="text-muted-foreground">
              Manage your dispatches and load assignments
            </p>          </div>
          <PermissionGate requiredPermission="dispatch.create">
            <Link to="/dispatch-management/new">
              <Button disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                New Dispatch
              </Button>
            </Link>
          </PermissionGate>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">
                  Error loading dispatches
                </h3>
                <div className="mt-2 text-sm text-destructive">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDispatches}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Try Again'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        {/* Content area - scrollable */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center pb-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <span className="mt-2 block">Loading dispatches...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-6 pb-6 overflow-auto space-y-6">
          {/* Dashboard Statistics */}
          <DashboardStats dispatches={dispatches} loading={loading} />
          
          {/* Commission and Top Dispatchers Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <CommissionDistribution dispatches={dispatches} loading={loading} />
            <TopDispatchers dispatches={dispatches} loading={loading} />
          </div>
          
          {/* Data Table */}
          <div className="border rounded-md">            <DataTable 
              columns={columns} 
              data={dispatches}
              searchPlaceholder="Search by carrier company name..."
              searchColumn="carrier_company_name"
            />
          </div>
        </div>
      )}
    </div>
  );
}