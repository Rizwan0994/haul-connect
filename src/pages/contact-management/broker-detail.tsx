import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Loader2, Mail, Phone, Building, User, Calendar } from 'lucide-react'
import { brokerApi, Broker } from '@/services/brokerApi'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function BrokerDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [broker, setBroker] = useState<Broker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchBroker(parseInt(id))
    }
  }, [id])

  const fetchBroker = async (brokerId: number) => {
    try {
      setLoading(true)
      const brokerData = await brokerApi.getBrokerById(brokerId)
      setBroker(brokerData)
    } catch (err) {
      console.error('Error fetching broker:', err)
      toast({
        title: "Error",
        description: "Failed to fetch broker details",
        variant: "destructive",
      })
      navigate('/contact-management/brokers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!broker) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Broker not found</p>
          <Button onClick={() => navigate('/contact-management/brokers')} className="mt-4">
            Back to Brokers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/contact-management/brokers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{broker.brokerage_company}</h1>
            <p className="text-muted-foreground">Broker Details</p>
          </div>
        </div>
        <Link to={`/contact-management/brokers/${broker.id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Broker
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic broker and company details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Brokerage Company</Label>
                  <p className="text-sm font-medium">{broker.brokerage_company}</p>
                </div>
                <div>
                  <Label>Agent Name</Label>
                  <p className="text-sm font-medium">{broker.agent_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {broker.agent_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{broker.agent_email}</p>
                  </div>
                </div>
              )}
              
              {broker.agent_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{broker.agent_phone}</p>
                  </div>
                </div>
              )}

              {!broker.agent_email && !broker.agent_phone && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Created Date</Label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(broker.created_at), "MMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
            <div>
              <Label>Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(broker.updated_at), "MMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
            {broker.createdBy && (
              <div>
                <Label>Created By</Label>
                <p className="text-sm text-muted-foreground">{broker.createdBy.username}</p>
              </div>
            )}
            {broker.updatedBy && (
              <div>
                <Label>Updated By</Label>
                <p className="text-sm text-muted-foreground">{broker.updatedBy.username}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-muted-foreground">{children}</label>
}
