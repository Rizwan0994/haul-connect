import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { brokerApi, Broker, BrokerCreateRequest, BrokerUpdateRequest } from '@/services/brokerApi'
import { useToast } from '@/components/ui/use-toast'

export default function BrokerForm({ isEdit = false }: { isEdit?: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [formData, setFormData] = useState<BrokerCreateRequest>({
    brokerage_company: '',
    agent_name: '',
    agent_phone: '',
    agent_email: '',
  })

  useEffect(() => {
    if (isEdit && id) {
      fetchBroker(parseInt(id))
    }
  }, [isEdit, id])

  const fetchBroker = async (brokerId: number) => {
    try {
      setLoadingData(true)
      const broker = await brokerApi.getBrokerById(brokerId)
      setFormData({
        brokerage_company: broker.brokerage_company,
        agent_name: broker.agent_name,
        agent_phone: broker.agent_phone || '',
        agent_email: broker.agent_email || '',
      })
    } catch (err) {
      console.error('Error fetching broker:', err)
      toast({
        title: "Error",
        description: "Failed to fetch broker details",
        variant: "destructive",
      })
      navigate('/contact-management/brokers')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brokerage_company.trim() || !formData.agent_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Brokerage company and agent name are required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEdit && id) {
        const updateData: BrokerUpdateRequest = {
          brokerage_company: formData.brokerage_company,
          agent_name: formData.agent_name,
          agent_phone: formData.agent_phone || undefined,
          agent_email: formData.agent_email || undefined,
        }
        await brokerApi.updateBroker(parseInt(id), updateData)
        toast({
          title: "Success",
          description: "Broker updated successfully",
        })
      } else {
        await brokerApi.createBroker(formData)
        toast({
          title: "Success",
          description: "Broker created successfully",
        })
      }
      
      navigate('/contact-management/brokers')
    } catch (err) {
      console.error('Error saving broker:', err)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} broker`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/contact-management/brokers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Broker' : 'Add New Broker'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update broker information' : 'Create a new broker contact'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Broker Information</CardTitle>
          <CardDescription>
            Enter the broker's contact details and company information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brokerage_company">
                  Brokerage Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brokerage_company"
                  name="brokerage_company"
                  value={formData.brokerage_company}
                  onChange={handleInputChange}
                  placeholder="Enter brokerage company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_name">
                  Agent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agent_name"
                  name="agent_name"
                  value={formData.agent_name}
                  onChange={handleInputChange}
                  placeholder="Enter agent name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_phone">Phone Number</Label>
                <Input
                  id="agent_phone"
                  name="agent_phone"
                  type="tel"
                  value={formData.agent_phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_email">Email Address</Label>
                <Input
                  id="agent_email"
                  name="agent_email"
                  type="email"
                  value={formData.agent_email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/contact-management/brokers')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Create'} Broker
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
