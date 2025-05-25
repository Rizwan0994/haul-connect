"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, Eye, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { format } from "date-fns";

// This type is used to define the shape of our invoice data.
export type Invoice = {
  id: string;
  invoice_number: string;
  carrier_name: string; // Or driver name, depending on your data structure
  invoice_date: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Draft";
  // Add other relevant invoice fields here
};

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice Number",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <Link
          href={`/dispatch-management/${invoice.id}/invoice`} // Assuming this is the view page
          className="font-medium text-blue-600 hover:underline"
        >
          {invoice.invoice_number}
        </Link>
      );
    },
  },
  {
    accessorKey: "carrier_name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Carrier/Driver
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-8 w-8 p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const invoiceDate = new Date(row.getValue("date") as string);
      if (isNaN(invoiceDate.getTime())) {
        return ""; // or a placeholder like "Invalid Date"
      }
 return format(invoiceDate, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // You can style the status badge based on the status value here
      return <div className="capitalize">{status}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
  const Cell = () => {
    const { toast } = useToast();
    return (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/dispatch-management/${row.original.id}/invoice`}>
 <Button variant="ghost" size="icon" className="h-8 w-8">
 <Eye className="h-4 w-4" />
 <span className="sr-only">View invoice</span>
 </Button>
 </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                console.log("Editing invoice:", row.original.id);
                // Navigate to edit page: router.push(`/dispatch-management/${invoice.id}/edit`);
              }}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit invoice</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                console.log("Deleting invoice:", row.original.id);
                // Implement delete logic (e.g., confirmation dialog, API call)
              }}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete invoice</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => {
                try {
                  // Define dummy invoice details for testing
                  const dummyInvoiceDetails = {
                    id: row.original.id,
                    invoice_number: row.original.invoice_number,
                    carrier_name: row.original.carrier_name,
                    invoice_date: row.original.invoice_date,
                    amount: row.original.amount,
                    status: row.original.status,
                    lineItems: [
                      { description: 'Transportation Service', quantity: 1, unitPrice: row.original.amount, lineTotal: row.original.amount },
                      { description: 'Fuel Surcharge', quantity: 1, unitPrice: 50, lineTotal: 50 },
                    ],
                    // Add other dummy fields as needed (e.g., carrier email, company info)
                  };

                  const response = await fetch(`/api/invoices/${row.original.id}/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dummyInvoiceDetails),
                  });

                  const responseData = await response.json();

                  if (responseData.status === 'success') {
                    toast({ title: 'Success', description: responseData.message, variant: 'success' });
                  } else if (responseData.status === 'error') {
                    toast({ title: 'Error', description: responseData.message, variant: 'destructive' });
                  } else {
                    // Handle unexpected response structure
                    toast({ title: 'Error', description: 'An unexpected response was received.', variant: 'destructive' });
                  }
                } catch (error) {
                  console.error('Error sending email:', error);
                }
              }}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send invoice</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                Copy Invoice ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
 <Link href={`/dispatch-management/${row.original.id}/invoice`}>View Invoice</Link>
 </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log("Editing invoice:", row.original.id);
                // Navigate to edit page: router.push(`/dispatch-management/${invoice.id}/edit`);
              }}>Edit Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log("Deleting invoice:", row.original.id);
                // Implement delete logic (e.g., confirmation dialog, API call)
              }}>Delete Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  // Define dummy invoice details for testing
                  const dummyInvoiceDetails = {
                    id: row.original.id,
                    invoice_number: row.original.invoice_number,
                    carrier_name: row.original.carrier_name,
                    invoice_date: row.original.invoice_date,
                    amount: row.original.amount,
                    status: row.original.status,
                    lineItems: [
                      { description: 'Transportation Service', quantity: 1, unitPrice: row.original.amount, lineTotal: row.original.amount },
                      { description: 'Fuel Surcharge', quantity: 1, unitPrice: 50, lineTotal: 50 },
                    ],
                    // Add other dummy fields as needed (e.g., carrier email, company info)
                  };

                  const response = await fetch(`/api/invoices/${row.original.id}/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dummyInvoiceDetails),
                  });

                  const responseData = await response.json();

                  if (responseData.status === 'success') {
                    toast({ title: 'Success', description: responseData.message, variant: 'success' });
                  } else if (responseData.status === 'error') {
                    toast({ title: 'Error', description: responseData.message, variant: 'destructive' });
                  } else {
                    // Handle unexpected response structure
                    toast({ title: 'Error', description: 'An unexpected response was received.', variant: 'destructive' });
                  }
                } catch (error) {
                  console.error('Error sending email:', error);
                }
              }}>Send Invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    );
  };
        return <Cell />;
    },
  },
];