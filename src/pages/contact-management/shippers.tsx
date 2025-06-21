import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { shipperApi, Shipper } from '@/services/shipperApi'
import { useToast } from '@/components/ui/use-toast'
import { shipperColumns } from '@/components/contact-management/shipper-columns'
import { PermissionGate } from '@/components/auth/permission-gate'

export default function ShipperManagement() {
  const { toast } = useToast()
  const [shippers, setShippers] = useState<Shipper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)

  // Fetch shippers from API
  const fetchShippers = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await shipperApi.getAllShippers(page, limit, search)
      setShippers(response.shippers)
      setTotalCount(response.total)
    } catch (err) {
      console.error('Error fetching shippers:', err)
      setError('Failed to fetch shippers')
      toast({
        title: "Error",
        description: "Failed to fetch shippers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShippers(pagination.pageIndex + 1, pagination.pageSize)
  }, [pagination.pageIndex, pagination.pageSize])

  const handleDelete = async (id: number) => {
    try {
      await shipperApi.deleteShipper(id)
      toast({
        title: "Success",
        description: "Shipper deleted successfully",
      })
      // Refresh the list
      fetchShippers(pagination.pageIndex + 1, pagination.pageSize)
    } catch (err) {
      console.error('Error deleting shipper:', err)
      toast({
        title: "Error",
        description: "Failed to delete shipper",
        variant: "destructive",
      })
    }
  }

  const columns = shipperColumns({ onDelete: handleDelete })

  if (loading && shippers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchShippers()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipper Management</h1>
          <p className="text-muted-foreground">
            Manage your shipper contacts and information
          </p>        </div>
        <PermissionGate requiredPermission="shippers.create">
          <Link to="/contact-management/shippers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Shipper
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <DataTable
        columns={columns}
        data={shippers}
      />
    </div>
  )
}
