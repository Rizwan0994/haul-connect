
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CarrierForm, CarrierFormValues } from '@/components/carrier-management/carrier-form'
import { getCarrierById, updateCarrier } from '@/lib/carriers-data'
import { useToast } from '@/components/ui/use-toast'

export default function CarrierEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [carrier, setCarrier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch carrier data
  useEffect(() => {
    const fetchCarrier = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const data = await getCarrierById(id)
        setCarrier(data)
      } catch (err: any) {
        setError(err.message || "Failed to load carrier details")
        toast({
          title: "Error",
          description: "Failed to load carrier details. " + err.message,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCarrier()
    // Remove toast from the dependency array to prevent infinite loops
  }, [id])

  // Handle form submission
  const handleSubmit = async (values: CarrierFormValues) => {
    if (!id) return
    
    try {
      setSaving(true)
      await updateCarrier(id, values)
      toast({
        title: "Success",
        description: "Carrier updated successfully",
      })
      navigate('/carrier-management')
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update carrier. " + err.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading carrier details...</p>
      </div>
    )
  }

  if (error && !carrier) {
    return (
      <div className="rounded-md bg-destructive/15 p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Error Loading Carrier</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={() => navigate('/carrier-management')}>Back to Carrier List</Button>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Carrier</h1>
          <p className="text-muted-foreground">Update carrier profile information</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Carrier Details</CardTitle>
          </div>
          <CardDescription>
            {carrier?.company_name} ({carrier?.mc_number})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierForm 
            initialData={carrier} 
            onSubmit={handleSubmit} 
            isLoading={saving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
