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
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Eye,
  MoreHorizontal,
  Pencil,
  FileText,
  Truck,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dispatch } from "@/lib/dispatch-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<Dispatch>[] = [
  {
    accessorKey: "load_no",
    header: "Load No.",
    cell: ({ row }) => {
      const dispatch = row.original;
      return (
        <Link
          href={`/dispatch-management/${dispatch.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {dispatch.load_no}
        </Link>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Carrier
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
    accessorKey: "dispatcher",
    header: "Dispatcher",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("dispatcher")}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created On",
    cell: ({ row }) => {
      const createdDate = new Date(row.getValue("created_at") as string);
      return format(createdDate, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "booking_date",
    header: "Booking Date",
    cell: ({ row }) => {
      const bookingDate = new Date(row.getValue("booking_date") as string);
      return format(bookingDate, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "pickup_date",
    header: "Pickup Date",
    cell: ({ row }) => {
      const pickupDate = new Date(row.getValue("pickup_date") as string);
      return format(pickupDate, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "dropoff_date",
    header: "Dropoff Date",
    cell: ({ row }) => {
      const dropoffDate = new Date(row.getValue("dropoff_date") as string);
      return format(dropoffDate, "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "origin",
    header: "Origin",
  },
  {
    accessorKey: "destination",
    header: "Destination",
  },
  {
    accessorKey: "load_amount",
    header: "Load Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("load_amount") as string);
      // Format as currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return formatted;
    },
  },
  {
    accessorKey: "charge_percent",
    header: "Charge %",
    cell: ({ row }) => {
      const chargePercent = parseFloat(
        row.getValue("charge_percent") as string
      );
      const loadAmount = parseFloat(row.getValue("load_amount") as string);
      const commissionAmount = (loadAmount * chargePercent) / 100;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {chargePercent}%
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                Commission: ${commissionAmount.toFixed(2)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          variant="outline"
          className={
            status === "Delivered"
              ? "bg-green-100 text-green-800 border-green-200"
              : status === "In Transit"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : status === "Scheduled"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : status === "Cancelled"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-gray-100 text-gray-800 border-gray-200"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "invoice_status",
    header: "Invoice",
    cell: ({ row }) => {
      const invoiceStatus = row.getValue("invoice_status") as string;
      const status = row.getValue("status") as string;

      // Check if it's a confirmed sale/dispatch
      const isConfirmed =
        status === "Delivered" && invoiceStatus === "Invoice Cleared";

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={
              invoiceStatus === "Invoice Cleared"
                ? "bg-green-100 text-green-800 border-green-200"
                : invoiceStatus === "Invoice Pending"
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : invoiceStatus === "Invoice Sent"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }
          >
            {invoiceStatus}
          </Badge>

          {isConfirmed && (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-1.5 py-0"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = row.original;

      return (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/dispatch-management/${dispatch.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="View dispatch details"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View dispatch</span>
            </Button>
          </Link>
          <Link href={`/dispatch-management/${dispatch.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Edit dispatch"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit dispatch</span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Open menu"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(dispatch.id)}
              >
                Copy dispatch ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dispatch-management/${dispatch.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View dispatch details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dispatch-management/${dispatch.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit dispatch details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dispatch-management/${dispatch.id}/invoice`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/carrier-management/${dispatch.carrier}`}>
                  <Truck className="h-4 w-4 mr-2" />
                  View carrier profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
