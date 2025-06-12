
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, Mail, Plus, Settings, Trash2, TestTube } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  SMTPSettings as SMTPSettingsType, 
  CreateSMTPSettingsRequest, 
  UpdateSMTPSettingsRequest,
  TestSMTPRequest,
  smtpApi 
} from '@/lib/smtp-api'
import { useAuth } from '@/components/auth/auth-context';
import { toast } from 'sonner'

export default function SMTPSettings() {
  const { currentUser, hasPermission } = useAuth()
  const [settings, setSettings] = useState<SMTPSettingsType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [selectedSettings, setSelectedSettings] = useState<SMTPSettingsType | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const [formData, setFormData] = useState<CreateSMTPSettingsRequest>({
    name: '',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    is_default: false,
    is_active: true
  })

  const [testData, setTestData] = useState<TestSMTPRequest>({
    test_email: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await smtpApi.getAll()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching SMTP settings:', error)
      toast.error('Failed to load SMTP settings')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await smtpApi.create(formData)
      toast.success('SMTP settings created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchSettings()
    } catch (error: any) {
      console.error('Error creating SMTP settings:', error)
      toast.error(error.response?.data?.message || 'Failed to create SMTP settings')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSettings) return
    
    try {
      await smtpApi.update(selectedSettings.id, formData as UpdateSMTPSettingsRequest)
      toast.success('SMTP settings updated successfully')
      setIsEditDialogOpen(false)
      resetForm()
      fetchSettings()
    } catch (error: any) {
      console.error('Error updating SMTP settings:', error)
      toast.error(error.response?.data?.message || 'Failed to update SMTP settings')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SMTP configuration?')) return
    
    try {
      await smtpApi.delete(id)
      toast.success('SMTP settings deleted successfully')
      fetchSettings()
    } catch (error: any) {
      console.error('Error deleting SMTP settings:', error)
      toast.error(error.response?.data?.message || 'Failed to delete SMTP settings')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await smtpApi.setDefault(id)
      toast.success('Default SMTP settings updated')
      fetchSettings()
    } catch (error: any) {
      console.error('Error setting default SMTP:', error)
      toast.error(error.response?.data?.message || 'Failed to set default SMTP settings')
    }
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSettings) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const result = await smtpApi.test(selectedSettings.id, testData)
      setTestResult({ success: true, message: result.message })
      toast.success('Test email sent successfully')
    } catch (error: any) {
      console.error('Error testing SMTP:', error)
      const message = error.response?.data?.message || 'Failed to send test email'
      setTestResult({ success: false, message })
      toast.error(message)
    } finally {
      setTesting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from_email: '',
      from_name: '',
      is_default: false,
      is_active: true
    })
    setSelectedSettings(null)
  }

  const resetTestData = () => {
    setTestData({
      test_email: ''
    })
    setTestResult(null)
  }

  const openEditDialog = (smtp: SMTPSettingsType) => {
    setSelectedSettings(smtp)
    setFormData({
      name: smtp.name,
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      username: smtp.username,
      password: '', // Don't pre-fill password for security
      from_email: smtp.from_email,
      from_name: smtp.from_name,
      is_default: smtp.is_default,
      is_active: smtp.is_active
    })
    setIsEditDialogOpen(true)
  }

  const openTestDialog = (smtp: SMTPSettingsType) => {
    setSelectedSettings(smtp)
    setTestData({
      test_email: currentUser?.email || ''
    })
    setTestResult(null)
    setIsTestDialogOpen(true)
  }
  // Check permissions
  const canManageSMTP = hasPermission(['settings.smtp'])

  if (!canManageSMTP) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage SMTP settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMTP Settings</h1>
          <p className="text-muted-foreground">Manage email server configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add SMTP Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SMTP Configuration</DialogTitle>
            </DialogHeader>
              {/* Common SMTP Settings Help */}
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Common SMTP Settings:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Gmail</p>
                  <p>Host: smtp.gmail.com</p>
                  <p>Port: 465 (SSL) or 587 (TLS)</p>
                  <p>Note: Use App Password, not regular password</p>
                </div>
                <div>
                  <p className="font-medium">Outlook/Hotmail</p>
                  <p>Host: smtp-mail.outlook.com</p>
                  <p>Port: 587 (TLS)</p>
                  <p>Secure: No (uses STARTTLS)</p>
                </div>
              </div>              <div className="mt-3 flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true
                  }))}
                >
                  Use Gmail SSL
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false
                  }))}
                >
                  Use Gmail TLS
                </Button>
              </div>
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Gmail Users:</strong> You must use an App Password instead of your regular Gmail password. 
                  Go to Gmail Settings → Security → 2-Step Verification → App passwords to generate one.
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gmail SMTP"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="host">SMTP Host</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="secure"
                    checked={formData.secure}
                    onCheckedChange={(checked) => setFormData({ ...formData, secure: checked })}
                  />
                  <Label htmlFor="secure">Use SSL/TLS</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    placeholder="noreply@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    placeholder="Company Name"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                  />
                  <Label htmlFor="is_default">Set as Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Configuration</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading SMTP configurations...</div>
      ) : (
        <div className="grid gap-6">
          {settings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No SMTP configurations found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first configuration to start sending emails.
                </p>
              </CardContent>
            </Card>
          ) : (
            settings.map((smtp) => (
              <Card key={smtp.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>{smtp.name}</span>
                      </CardTitle>
                      <div className="flex space-x-1">
                        {smtp.is_default && (
                          <Badge variant="default">Default</Badge>
                        )}
                        <Badge variant={smtp.is_active ? "outline" : "secondary"}>
                          {smtp.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTestDialog(smtp)}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(smtp)}
                      >
                        Edit
                      </Button>
                      {!smtp.is_default && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(smtp.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(smtp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Host</p>
                      <p>{smtp.host}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Port</p>
                      <p>{smtp.port} {smtp.secure ? "(SSL)" : "(TLS)"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Username</p>
                      <p>{smtp.username}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">From</p>
                      <p>"{smtp.from_name}" &lt;{smtp.from_email}&gt;</p>
                    </div>
                  </div>                  {smtp.last_tested_at && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm">
                        {smtp.test_status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                          Last tested: {new Date(smtp.last_tested_at).toLocaleString()}
                        </span>
                        {smtp.test_status === 'failed' && smtp.test_error && (
                          <span className="text-red-500">- {smtp.test_error}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SMTP Configuration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Configuration Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_host">SMTP Host</Label>
                <Input
                  id="edit_host"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_port">Port</Label>
                <Input
                  id="edit_port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit_secure"
                  checked={formData.secure}
                  onCheckedChange={(checked) => setFormData({ ...formData, secure: checked })}
                />
                <Label htmlFor="edit_secure">Use SSL/TLS</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_password">Password</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_from_email">From Email</Label>
                <Input
                  id="edit_from_email"
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_from_name">From Name</Label>
                <Input
                  id="edit_from_name"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="edit_is_default">Set as Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Configuration</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test SMTP Configuration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <Label htmlFor="test_email">Test Email Address</Label>
              <Input
                id="test_email"
                type="email"
                value={testData.test_email}
                onChange={(e) => setTestData({ ...testData, test_email: e.target.value })}
                placeholder="test@example.com"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                A test email will be sent to this address to verify the SMTP configuration.
              </p>
            </div>

            {testResult && (
              <Alert>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={testing}>
                {testing ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
