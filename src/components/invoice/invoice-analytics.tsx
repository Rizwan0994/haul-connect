"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { invoiceAPI, Invoice } from '@/lib/invoice-api'
import { useToast } from '@/components/ui/use-toast'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Loader2
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, isAfter } from 'date-fns'

interface InvoiceAnalytics {
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  overdueInvoices: number
  draftInvoices: number
  averageInvoiceAmount: number
  monthlyRevenue: number
  previousMonthRevenue: number
  revenueGrowth: number
  recentInvoices: Invoice[]
}

export function InvoiceAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const invoices = await invoiceAPI.getAllInvoices()
        
        // Calculate analytics
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
        const totalInvoices = invoices.length
        const paidInvoices = invoices.filter(i => i.status === 'paid').length
        const unpaidInvoices = invoices.filter(i => i.status === 'sent').length
        const draftInvoices = invoices.filter(i => i.status === 'draft').length
        
        // Calculate overdue invoices
        const now = new Date()
        const overdueInvoices = invoices.filter(invoice => 
          invoice.status === 'sent' && isAfter(now, new Date(invoice.dueDate))
        ).length
        
        const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
        
        // Monthly revenue calculations
        const currentMonth = new Date()
        const previousMonth = subMonths(currentMonth, 1)
        
        const monthlyRevenue = invoices
          .filter(invoice => {
            const invoiceDate = new Date(invoice.issueDate)
            return invoiceDate >= startOfMonth(currentMonth) && invoiceDate <= endOfMonth(currentMonth)
          })
          .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
          
        const previousMonthRevenue = invoices
          .filter(invoice => {
            const invoiceDate = new Date(invoice.issueDate)
            return invoiceDate >= startOfMonth(previousMonth) && invoiceDate <= endOfMonth(previousMonth)
          })
          .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
          
        const revenueGrowth = previousMonthRevenue > 0 
          ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
          : 0
          
        // Recent invoices (last 5)
        const recentInvoices = invoices
          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
          .slice(0, 5)
        
        setAnalytics({
          totalRevenue,
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          overdueInvoices,
          draftInvoices,
          averageInvoiceAmount,
          monthlyRevenue,
          previousMonthRevenue,
          revenueGrowth,
          recentInvoices
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
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

    fetchAnalytics()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load analytics'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.totalInvoices} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.monthlyRevenue)}</div>
            <p className={`text-xs ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(analytics.revenueGrowth)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.totalRevenue * (analytics.paidInvoices / analytics.totalInvoices))} collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            {analytics.overdueInvoices > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Clock className="h-4 w-4 text-amber-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.overdueInvoices > 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {analytics.unpaidInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.overdueInvoices} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Breakdown of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Paid</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.paidInvoices}</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {((analytics.paidInvoices / analytics.totalInvoices) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Sent</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.unpaidInvoices}</span>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {((analytics.unpaidInvoices / analytics.totalInvoices) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Draft</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.draftInvoices}</span>
                <Badge variant="secondary">
                  {((analytics.draftInvoices / analytics.totalInvoices) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            {analytics.overdueInvoices > 0 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Overdue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-600">{analytics.overdueInvoices}</span>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    Urgent
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.carrierInfo?.name || 'Unknown Carrier'}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {format(new Date(invoice.dueDate), 'MMM dd')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
