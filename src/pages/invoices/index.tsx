
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/invoice/columns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for now - replace with actual data fetching
const mockInvoices = [
  {
    id: '1',
    invoice_number: 'INV-001',
    carrier_name: 'Swift Transportation',
    invoice_date: '2024-01-15',
    amount: 1500,
    status: 'Paid' as const,
  },
  {
    id: '2',
    invoice_number: 'INV-002',
    carrier_name: 'Schneider National',
    invoice_date: '2024-01-18',
    amount: 2200,
    status: 'Unpaid' as const,
  },
  {
    id: '3',
    invoice_number: 'INV-003',
    carrier_name: 'JB Hunt',
    invoice_date: '2024-01-20',
    amount: 1800,
    status: 'Draft' as const,
  },
]

export default function Invoices() {
  const totalAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = mockInvoices
    .filter(invoice => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const unpaidAmount = totalAmount - paidAmount

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Manage and track your invoice payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <CardDescription className="text-xs text-muted-foreground">
              All invoices combined
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
            <CardDescription className="text-xs text-muted-foreground">
              Successfully collected
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${unpaidAmount.toLocaleString()}</div>
            <CardDescription className="text-xs text-muted-foreground">
              Pending payment
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={mockInvoices} />
    </div>
  )
}
