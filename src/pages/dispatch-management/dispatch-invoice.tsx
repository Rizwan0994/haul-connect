
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Dispatch } from '@/lib/dispatch-api'
import { dispatchAPI } from '@/lib/dispatch-api'
import { DispatchInvoiceView } from '@/components/invoice/dispatch-invoice-view'
import { useToast } from '@/components/ui/use-toast'

export default function DispatchInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [dispatch, setDispatch] = useState<Dispatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDispatch = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dispatchAPI.getDispatchById(parseInt(id))
        setDispatch(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dispatch'
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDispatch()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/dispatch-management')} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dispatch Management
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dispatch) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/dispatch-management')} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dispatch Management
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">{error || 'Dispatch not found'}</p>
              <Button 
                onClick={() => navigate('/dispatch-management')} 
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dispatch Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/dispatch-management')} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dispatch Management
          </Button>
          <Button 
            onClick={() => navigate(`/dispatch-management/${dispatch.id}`)} 
            variant="outline"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Invoice View Component */}
      <DispatchInvoiceView dispatch={dispatch} />
    </div>
  )
}
