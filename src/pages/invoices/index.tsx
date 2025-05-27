import { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { createInvoiceColumns } from '@/components/invoice/invoice-columns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { invoiceAPI, Invoice } from '@/lib/invoice-api'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, DollarSign, FileText, Clock, CheckCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInvoices = async () => {      try {
        setLoading(true)
        setError(null)
        const data = await invoiceAPI.getAllInvoices()
        setInvoices(data.invoices)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices'
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

    fetchInvoices()
  }, [])

  // Action handlers for invoice operations
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/dispatch-management/${invoice.dispatch_id}/invoice`)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/dispatch-management/${invoice.dispatch_id}/invoice?edit=true`)
  }
  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await invoiceAPI.sendInvoiceEmail({
        invoiceId: invoice.id,
        recipientEmail: invoice.dispatch?.carrier?.email_address || '',
        subject: `Invoice ${invoice.invoice_number}`,
        message: `Please find attached invoice ${invoice.invoice_number}.`
      })
      toast({
        title: "Email sent",
        description: `Invoice ${invoice.invoice_number} has been sent successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice email.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const pdfBlob = await invoiceAPI.downloadInvoicePDF(invoice.id)
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `invoice-${invoice.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "PDF downloaded",
        description: `Invoice ${invoice.invoice_number} has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice PDF.",
        variant: "destructive",
      })
    }
  }
  // Create columns with action handlers
  const columns = createInvoiceColumns(
    handleViewInvoice,
    handleEditInvoice,
    handleSendEmail,
    handleDownloadPDF
  )
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount.toString()), 0)
  const paidAmount = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount.toString()), 0)
  const unpaidAmount = invoices
    .filter(invoice => invoice.status === 'sent')
    .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount.toString()), 0)
  const draftAmount = invoices
    .filter(invoice => invoice.status === 'draft')
    .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount.toString()), 0)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoice payments
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoice payments
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoice payments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              From {invoices.length} invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'paid').length} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(unpaidAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'sent').length} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{formatCurrency(draftAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'draft').length} drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            A list of all your invoices including their status and payment information.
          </CardDescription>
        </CardHeader>        <CardContent>
          <DataTable columns={columns} data={invoices} />
        </CardContent>
      </Card>
    </div>
  )
}