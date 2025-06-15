"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Eye,
  MoreHorizontal,
  Pencil,
  ExternalLink,
  Copy,
  CalendarCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCarrierModal } from "@/hooks/use-carrier-modal";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export type Carrier = {
  id: string;
  mc_number: string;
  company_name: string;
  owner_name: string;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  phone_number: string;
  email_address: string;
  truck_type: string;
  status: "Active" | "Temporary" | "Blacklist";
  created_at: string;
};

export const columns: ColumnDef<Carrier>[] = [
  {
    accessorKey: "mc_number",
    header: "MC Number",
    cell: ({ row }) => {
      const carrier = row.original;
      return (
        <div className="font-medium text-blue-600">
          {carrier.mc_number}
        </div>
      );
    },
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Company Name
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
    accessorKey: "owner_name",
    header: "Owner",
  },
  {
    accessorKey: "driver_name",
    header: "Driver",
    cell: ({ row }) => {
      const driver = row.getValue("driver_name") as string;
      return driver || "N/A";
    },
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "email_address",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email_address") as string;
      return (
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
          {email}
        </a>
      );
    },
  },
  {
    accessorKey: "truck_type",
    header: "Truck Type",
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
            status === "Active"
              ? "bg-green-100 text-green-800 border-green-200"
              : status === "Temporary"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : status === "Blacklist"
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
    accessorKey: "created_at",
    header: "Created On",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at");
      if (!dateValue) return "-";

      try {
        const createdDate = new Date(dateValue as string);
        if (isNaN(createdDate.getTime())) return "-";
        return format(createdDate, "MMM dd, yyyy");
      } catch (_error) {
        return "-";
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const carrier = row.original;
      const { openCarrierModal } = useCarrierModal();
      const { toast } = useToast();

      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              openCarrierModal(
                carrier.id,
                `${carrier.company_name} (${carrier.mc_number})`
              )
            }
            aria-label="Open in popup"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Link to={`/carrier-management/${carrier.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View carrier</span>
            </Button>
          </Link>
          <Link to={`/carrier-management/${carrier.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Edit carrier"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit carrier</span>
            </Button>
          </Link>
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
                onClick={() => {
                  navigator.clipboard.writeText(carrier.mc_number);
                  toast({
                    title: "MC Number Copied",
                    description: `MC #${carrier.mc_number} copied to clipboard`,
                    // duration: 2000,
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy MC Number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  openCarrierModal(
                    carrier.id,
                    `${carrier.company_name} (${carrier.mc_number})`
                  )
                }
              >
                View carrier profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/carrier-management/${carrier.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit carrier details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openCarrierModal(
                    carrier.id,
                    `${carrier.company_name} (${carrier.mc_number})`
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in popup window
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem asChild>
                <Link to={`/carrier-management/assignments/${carrier.id}`}>
                  <CalendarCheck2 className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Link>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

