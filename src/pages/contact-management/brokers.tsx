import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { brokerApi, Broker } from '@/services/brokerApi'
import { useToast } from '@/components/ui/use-toast'
import { brokerColumns } from '@/components/contact-management/broker-columns'

export default function BrokerManagement() {
  const { toast } = useToast()
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch brokers from API
  const fetchBrokers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await brokerApi.getAllBrokers()
      setBrokers(response.brokers)
    } catch (err) {
      console.error('Error fetching brokers:', err)
      setError('Failed to fetch brokers')
      toast({
        title: "Error",
        description: "Failed to fetch brokers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrokers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await brokerApi.deleteBroker(id)
      toast({
        title: "Success",
        description: "Broker deleted successfully",
      })
      // Refresh the list
      fetchBrokers()
    } catch (err) {
      console.error('Error deleting broker:', err)
      toast({
        title: "Error",
        description: "Failed to delete broker",
        variant: "destructive",
      })
    }
  }

  const columns = brokerColumns({ onDelete: handleDelete })

  if (loading && brokers.length === 0) {
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
          <Button onClick={() => fetchBrokers()} variant="outline">
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
          <h1 className="text-2xl font-bold tracking-tight">Broker Management</h1>
          <p className="text-muted-foreground">
            Manage your broker contacts and information
          </p>
        </div>
        <Link to="/contact-management/brokers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Broker
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={brokers}
      />
    </div>
  )
}
