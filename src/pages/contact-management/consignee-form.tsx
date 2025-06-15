import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import { consigneeApi, Consignee } from '@/services/consigneeApi'
import { useToast } from '@/components/ui/use-toast'

interface ConsigneeFormData {
  consignee_name: string
  contact: string
  email: string
  telephone: string
  address: string
  ext: string
  notes: string
  attachment?: File | null
}

export default function ConsigneeForm({ isEdit = false }: { isEdit?: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [formData, setFormData] = useState<ConsigneeFormData>({
    consignee_name: '',
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
      fetchConsignee(parseInt(id))
    }
  }, [isEdit, id])

  const fetchConsignee = async (consigneeId: number) => {
    try {
      setLoadingData(true)
      const consignee = await consigneeApi.getConsigneeById(consigneeId)
      setFormData({
        consignee_name: consignee.consignee_name,
        contact: consignee.contact || '',
        email: consignee.email || '',
        telephone: consignee.telephone || '',
        address: consignee.address || '',
        ext: consignee.ext || '',
        notes: consignee.notes || '',
        attachment: null,
      })
      setExistingAttachment(consignee.attachment_filename || null)
    } catch (err) {
      console.error('Error fetching consignee:', err)
      toast({
        title: "Error",
        description: "Failed to fetch consignee details",
        variant: "destructive",
      })
      navigate('/contact-management/consignees')
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
    if (!formData.consignee_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Consignee name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      if (isEdit && id) {
        await consigneeApi.updateConsignee(parseInt(id), formData)
        toast({
          title: "Success",
          description: "Consignee updated successfully",
        })
      } else {
        await consigneeApi.createConsignee(formData)
        toast({
          title: "Success",
          description: "Consignee created successfully",
        })
      }
      
      navigate('/contact-management/consignees')
    } catch (err) {
      console.error('Error saving consignee:', err)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} consignee`,
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
          onClick={() => navigate('/contact-management/consignees')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Consignee' : 'Add New Consignee'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update consignee information' : 'Create a new consignee contact'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Consignee Information</CardTitle>
            <CardDescription>
              Enter the consignee's details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consignee_name">
                  Consignee Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="consignee_name"
                  name="consignee_name"
                  value={formData.consignee_name}
                  onChange={handleInputChange}
                  placeholder="Enter consignee name"
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
            onClick={() => navigate('/contact-management/consignees')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update' : 'Create'} Consignee
          </Button>
        </div>
      </form>
    </div>
  )
}
