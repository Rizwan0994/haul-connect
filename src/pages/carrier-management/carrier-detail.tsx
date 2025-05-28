import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft, CalendarCheck2 } from 'lucide-react'
import { getCarrierById, type Carrier } from '@/lib/carriers-data'

export default function CarrierDetail() {
  const { id } = useParams()
  const [carrier, setCarrier] = useState<Carrier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCarrier = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const data = await getCarrierById(id)
        setCarrier(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCarrier()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </div>
    )
  }

  if (error || !carrier) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Carrier not found</h2>
          <p className="text-muted-foreground mb-4">{error || "The carrier you're looking for doesn't exist."}</p>
          <Link to="/carrier-management">
            <Button>Back to Carriers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/carrier-management">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{carrier.company_name}</h1>
          <p className="text-muted-foreground">Carrier Profile Details</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/carrier-management/assignments/${id}`}>
            <Button variant="outline">
              <CalendarCheck2 className="mr-2 h-4 w-4" />
              Manage Assignments
            </Button>
          </Link>
          <Link to={`/carrier-management/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="font-medium">{carrier.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
              <p className="font-medium">{carrier.owner_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MC Number</label>
              <p className="font-medium">{carrier.mc_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">US DOT Number</label>
              <p className="font-medium">{carrier.us_dot_number || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={carrier.status === 'active' ? 'default' : 'secondary'}>
                  {carrier.status.charAt(0).toUpperCase() + carrier.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Primary contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p className="font-medium">{carrier.phone_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <p className="font-medium">{carrier.email_address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="font-medium">{carrier.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Truck Type</label>
              <p className="font-medium">{carrier.truck_type}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Information</CardTitle>
          <CardDescription>Details about the assigned driver</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Driver Name</label>
            <p className="font-medium">{carrier.driver_name || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Driver Phone</label>
            <p className="font-medium">{carrier.driver_phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Driver Email</label>
            <p className="font-medium">{carrier.driver_email || 'Not provided'}</p>
          </div>
          {carrier.driver_license_number && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Driver License</label>
              <p className="font-medium">
                {carrier.driver_license_number} ({carrier.driver_license_state || 'Unknown State'})
                {carrier.driver_license_expiration && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Expires: {carrier.driver_license_expiration}
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
