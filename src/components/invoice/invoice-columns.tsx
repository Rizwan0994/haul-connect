"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Invoice } from "@/lib/invoice-api"
import { format } from "date-fns"
import { Eye, Download, Mail, MoreHorizontal, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

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
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
};

interface InvoiceActionsProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

const InvoiceActions = ({ invoice, onView, onEdit, onSendEmail, onDownloadPDF }: InvoiceActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(invoice.invoice_number)}
        >
          Copy invoice number
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(invoice)}>
          <Eye className="mr-2 h-4 w-4" />
          View invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(invoice)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendEmail(invoice)}>
          <Mail className="mr-2 h-4 w-4" />
          Send email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownloadPDF(invoice)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createInvoiceColumns = (
  onView: (invoice: Invoice) => void,
  onEdit: (invoice: Invoice) => void,
  onSendEmail: (invoice: Invoice) => void,
  onDownloadPDF: (invoice: Invoice) => void
): ColumnDef<Invoice>[] => [
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
    cell: ({ row }) => {
      const invoiceNumber = row.getValue("invoice_number") as string
      return <div className="font-medium">{invoiceNumber}</div>
    },
  },
  {
    accessorKey: "dispatch_id",
    header: "Dispatch",
    cell: ({ row }) => {
      const dispatchId = row.getValue("dispatch_id") as number
      return <Badge variant="outline">#{dispatchId}</Badge>
    },
  },
  {
    accessorKey: "invoice_date",
    header: "Issue Date",
    cell: ({ row }) => {
      const date = row.getValue("invoice_date") as string
      return <div>{formatDate(date)}</div>
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string
      const dueDate = new Date(date)
      const isOverdue = dueDate < new Date() && row.original.status !== 'paid'
      return (
        <div className={isOverdue ? "text-red-600 font-medium" : ""}>
          {formatDate(date)}
        </div>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "carrier_amount",
    header: "Carrier Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("carrier_amount"))
      return <div className="text-amber-600">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "profit_amount",
    header: "Profit",
    cell: ({ row }) => {
      const profit = parseFloat(row.getValue("profit_amount"))
      return <div className="font-medium text-green-600">{formatCurrency(profit)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return getStatusBadge(status)
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <InvoiceActions
          invoice={invoice}
          onView={onView}
          onEdit={onEdit}
          onSendEmail={onSendEmail}
          onDownloadPDF={onDownloadPDF}
        />
      )
    },
  },
];
