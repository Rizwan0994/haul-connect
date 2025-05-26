
'use client'

import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Edit, ArrowLeft } from 'lucide-react'
import { carriersData } from '@/lib/carriers-data'

export default function CarrierDetail() {
  const { id } = useParams()
  const carrier = carriersData.find(c => c.id === id)

  if (!carrier) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Carrier not found</h2>
          <p className="text-muted-foreground mb-4">The carrier you're looking for doesn't exist.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{carrier.companyName}</h1>
          <p className="text-muted-foreground">Carrier Profile Details</p>
        </div>
        <Link to={`/carrier-management/${id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
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
              <p className="font-medium">{carrier.companyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MC Number</label>
              <p className="font-medium">{carrier.mcNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">DOT Number</label>
              <p className="font-medium">{carrier.dotNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={carrier.status === 'Active' ? 'default' : 'secondary'}>
                  {carrier.status}
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
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p className="font-medium">{carrier.contactPerson}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="font-medium">{carrier.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{carrier.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="font-medium">{carrier.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
