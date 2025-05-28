import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CarrierForm, CarrierFormValues } from '@/components/carrier-management/carrier-form'
import { createCarrier } from '@/lib/carriers-data'
import { useToast } from '@/components/ui/use-toast'

export default function CarrierCreate() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // Handle form submission
  const handleSubmit = async (values: CarrierFormValues) => {
    try {
      setSaving(true)
      await createCarrier(values as any)
      toast({
        title: "Success",
        description: "Carrier created successfully",
      })
      navigate('/carrier-management')
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create carrier. " + err.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/carrier-management')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Carrier</h1>
          <p className="text-muted-foreground">Create a new carrier profile</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Carrier Information</CardTitle>
          </div>
          <CardDescription>
            Enter the carrier's details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierForm 
            onSubmit={handleSubmit} 
            isLoading={saving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
