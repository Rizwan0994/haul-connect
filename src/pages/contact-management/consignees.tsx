import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { consigneeApi, Consignee } from '@/services/consigneeApi'
import { useToast } from '@/components/ui/use-toast'
import { consigneeColumns } from '@/components/contact-management/consignee-columns'

export default function ConsigneeManagement() {
  const { toast } = useToast()
  const [consignees, setConsignees] = useState<Consignee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)

  // Fetch consignees from API
  const fetchConsignees = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await consigneeApi.getAllConsignees(page, limit, search)
      setConsignees(response.consignees)
      setTotalCount(response.total)
    } catch (err) {
      console.error('Error fetching consignees:', err)
      setError('Failed to fetch consignees')
      toast({
        title: "Error",
        description: "Failed to fetch consignees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsignees(pagination.pageIndex + 1, pagination.pageSize)
  }, [pagination.pageIndex, pagination.pageSize])

  const handleDelete = async (id: number) => {
    try {
      await consigneeApi.deleteConsignee(id)
      toast({
        title: "Success",
        description: "Consignee deleted successfully",
      })
      // Refresh the list
      fetchConsignees(pagination.pageIndex + 1, pagination.pageSize)
    } catch (err) {
      console.error('Error deleting consignee:', err)
      toast({
        title: "Error",
        description: "Failed to delete consignee",
        variant: "destructive",
      })
    }
  }

  const columns = consigneeColumns({ onDelete: handleDelete })

  if (loading && consignees.length === 0) {
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
          <Button onClick={() => fetchConsignees()} variant="outline">
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
          <h1 className="text-2xl font-bold tracking-tight">Consignee Management</h1>
          <p className="text-muted-foreground">
            Manage your consignee contacts and information
          </p>
        </div>
        <Link to="/contact-management/consignees/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Consignee
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={consignees}
      />
    </div>
  )
}
