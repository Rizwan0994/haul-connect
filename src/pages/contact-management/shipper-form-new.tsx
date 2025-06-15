import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import { shipperApi, Shipper } from '@/services/shipperApi'
import { useToast } from '@/components/ui/use-toast'

interface ShipperFormData {
  shipper_name: string
  contact: string
  email: string
  telephone: string
  address: string
  ext: string
  notes: string
  attachment?: File | null
}

export default function ShipperForm({ isEdit = false }: { isEdit?: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [formData, setFormData] = useState<ShipperFormData>({
    shipper_name: '',
    contact: '',
    email: '',
    telephone: '',
    address: '',
    ext: '',
    notes: '',
    attachment: null,
  })
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && id) {
      fetchShipper(parseInt(id))
    }
  }, [isEdit, id])

  const fetchShipper = async (shipperId: number) => {
    try {
      setLoadingData(true)
      const shipper = await shipperApi.getShipperById(shipperId)
      setFormData({
        shipper_name: shipper.shipper_name,
        contact: shipper.contact || '',
        email: shipper.email || '',
        telephone: shipper.telephone || '',
        address: shipper.address || '',
        ext: shipper.ext || '',
        notes: shipper.notes || '',
        attachment: null,
      })
      setExistingAttachment(shipper.attachment_filename || null)
    } catch (err) {
      console.error('Error fetching shipper:', err)
      toast({
        title: "Error",
        description: "Failed to fetch shipper details",
        variant: "destructive",
      })
      navigate('/contact-management/shippers')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, attachment: file }))
  }

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, attachment: null }))
    // Reset file input
    const fileInput = document.getElementById('attachment') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.shipper_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Shipper name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEdit && id) {
        await shipperApi.updateShipper(parseInt(id), formData)
        toast({
          title: "Success",
          description: "Shipper updated successfully",
        })
      } else {
        await shipperApi.createShipper(formData)
        toast({
          title: "Success",
          description: "Shipper created successfully",
        })
      }
      
      navigate('/contact-management/shippers')
    } catch (err) {
      console.error('Error saving shipper:', err)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} shipper`,
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/contact-management/shippers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Shipper' : 'Add New Shipper'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update shipper information' : 'Create a new shipper contact'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipper Information</CardTitle>
            <CardDescription>
              Enter the shipper's details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipper_name">
                  Shipper Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="shipper_name"
                  name="shipper_name"
                  value={formData.shipper_name}
                  onChange={handleInputChange}
                  placeholder="Enter shipper name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Phone Number</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ext">Extension</Label>
                <Input
                  id="ext"
                  name="ext"
                  value={formData.ext}
                  onChange={handleInputChange}
                  placeholder="Enter extension"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Optional notes and file attachment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">File Attachment</Label>
              {existingAttachment && !formData.attachment && (
                <div className="text-sm text-muted-foreground mb-2">
                  Current file: {existingAttachment}
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {formData.attachment && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.attachment && (
                <div className="text-sm text-muted-foreground">
                  Selected: {formData.attachment.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contact-management/shippers')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update' : 'Create'} Shipper
          </Button>
        </div>
      </form>
    </div>
  )
}
