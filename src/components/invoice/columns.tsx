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
import { ArrowDownUp, Eye, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
          to={`/dispatch-management/${invoice.id}/invoice`} // Assuming this is the view page
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
    accessorKey: "invoice_date",
    header: "Invoice Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("invoice_date");
      if (!dateValue) return "-";

      try {
        const invoiceDate = new Date(dateValue as string);
        if (isNaN(invoiceDate.getTime())) return "-";
        return format(invoiceDate, "MMM dd, yyyy");
      } catch (_error) {
        return "-";
      }
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Amount
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
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return amount ? `$${amount.toLocaleString()}` : "-";
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case "paid":
            return "bg-green-100 text-green-800 border-green-200";
          case "unpaid":
            return "bg-red-100 text-red-800 border-red-200";
          case "draft":
            return "bg-gray-100 text-gray-800 border-gray-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <Badge variant="outline" className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const { toast } = useToast();

      const handleSendInvoice = () => {
        toast({
          title: "Invoice Sent",
          description: `Invoice ${invoice.invoice_number} has been sent to the carrier.`,
        });
      };

      const handleDeleteInvoice = () => {
        toast({
          title: "Invoice Deleted",
          description: `Invoice ${invoice.invoice_number} has been deleted.`,
          variant: "destructive",
        });
      };

      return (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/dispatch-management/${invoice.id}/invoice`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View invoice</span>
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleSendInvoice}
          >
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(invoice.invoice_number)}
              >
                Copy invoice number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/dispatch-management/${invoice.id}/invoice`}>
                  View invoice details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendInvoice}>
                Send invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteInvoice}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
