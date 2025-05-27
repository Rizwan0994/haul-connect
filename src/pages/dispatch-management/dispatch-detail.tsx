
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, FileText, Truck, MapPin, Calendar, CreditCard, User, Clock } from 'lucide-react'
import { Dispatch } from '@/lib/dispatch-api'
import { dispatchAPI } from '@/lib/dispatch-api'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

export default function DispatchDetail() {
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
  }, [id]) // Removed toast dependency

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading dispatch details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dispatch) {
    return (
      <div className="container mx-auto py-6">
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/dispatch-management')} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dispatch #{dispatch.id}</h1>
            <p className="text-muted-foreground">Created {formatDate(dispatch.created_at)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate(`/dispatch-management/${dispatch.id}/edit`)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            onClick={() => navigate(`/dispatch-management/${dispatch.id}/invoice`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Invoice
          </Button>
        </div>
      </div>

      {/* Status and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Dispatch Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(dispatch.status)}>
                  {dispatch.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Load Number</label>
              <p className="mt-1 font-medium">{dispatch.load_no}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">BOL Number</label>
              <p className="mt-1 font-medium">BOL-{dispatch.load_no}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Carrier Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="mt-1 font-medium">{dispatch.carrier?.company_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MC Number</label>
              <p className="mt-1 font-medium">{dispatch.carrier?.mc_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p className="mt-1 font-medium">{dispatch.carrier?.owner_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="mt-1 font-medium">{dispatch.carrier?.phone_number || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Route Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pickup Location</label>
              <p className="mt-1 font-medium">{dispatch.origin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Location</label>
              <p className="mt-1 font-medium">{dispatch.destination}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pickup Date</label>
              <p className="mt-1 font-medium">{formatDate(dispatch.pickup_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
              <p className="mt-1 font-medium">{formatDate(dispatch.dropoff_date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Financial Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="mt-1 text-lg font-bold text-green-600">{formatCurrency(dispatch.load_amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Carrier Percentage</label>
              <p className="mt-1 font-medium">{dispatch.charge_percent}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Carrier Amount</label>
              <p className="mt-1 font-medium text-blue-600">
                {formatCurrency((dispatch.load_amount * dispatch.charge_percent) / 100)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Profit</label>
              <p className="mt-1 font-medium text-green-600">
                {formatCurrency(dispatch.load_amount - (dispatch.load_amount * dispatch.charge_percent) / 100)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Additional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created By</label>
              <p className="mt-1 font-medium">{dispatch.user_details?.first_name} {dispatch.user_details?.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1 font-medium">{formatDate(dispatch.updated_at)}</p>
            </div>
          </div>
          {dispatch.brokerage_agent && (
            <div className="mt-6">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md">{dispatch.brokerage_agent}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
