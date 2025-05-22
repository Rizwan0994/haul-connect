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
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import useCarrierModal from "@/hooks/use-carrier-modal";
import UserAssignmentButton from "@/components/carrier-management/user-assignment-button";
import { format } from "date-fns";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Carrier = {
  id: string;
  mc_number: string;
  company_name: string;
  owner_name: string;
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
        <Link
          href={`/carrier-management/${carrier.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {carrier.mc_number}
        </Link>
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
      } catch (error) {
        return "-";
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const carrier = row.original;

      // Create a proper React component to use the hook
      const ActionsCell = () => {
        const { openCarrierModal } = useCarrierModal();

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
            <Link href={`/carrier-management/${carrier.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
                <span className="sr-only">View carrier</span>
              </Button>
            </Link>
            <UserAssignmentButton
              carrierId={carrier.id}
              carrierName={`${carrier.company_name} (${carrier.mc_number})`}
              status={carrier.status}
            />
            <Link href={`/carrier-management/${carrier.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  onClick={() => navigator.clipboard.writeText(carrier.id)}
                >
                  Copy carrier ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/carrier-management/${carrier.id}`}>
                    View carrier profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/carrier-management/${carrier.id}/edit`}>
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
                  Open in popup window
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      };

      // Return the component
      return <ActionsCell />;
    },
  },
];
