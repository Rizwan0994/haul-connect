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
import UserAssignmentButton from "./user-assignment-button";
import CommissionStatusManager from "./commission-status-manager";

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
  status: "active" | "inactive" | "pending" | "suspended";
  created_at: string;
  approval_status?: "pending" | "manager_approved" | "accounts_approved" | "rejected" | "disabled";
  approved_by_manager?: string;
  approved_by_accounts?: string;
  manager_approved_at?: string;
  accounts_approved_at?: string;
  commission_status?: "not_eligible" | "pending" | "paid" | "confirmed_sale";
  commission_paid_at?: string;
  commission_amount?: number;
  loads_completed?: number;
  first_load_completed_at?: string;
};

export const createColumns = (onRefresh?: () => void): ColumnDef<Carrier>[] => [
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
            status === "active"
              ? "bg-green-100 text-green-800 border-green-200"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : status === "suspended"
              ? "bg-red-100 text-red-800 border-red-200"
              : status === "inactive"
              ? "bg-gray-100 text-gray-800 border-gray-200"
              : "bg-blue-100 text-blue-800 border-blue-200"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "approval_status",
    header: "Approval Status",
    cell: ({ row }) => {
      const approvalStatus = row.getValue("approval_status") as string;
      if (!approvalStatus) return <Badge variant="outline">N/A</Badge>;

      return (
        <Badge
          variant="outline"
          className={
            approvalStatus === "accounts_approved"
              ? "bg-green-100 text-green-800 border-green-200"
              : approvalStatus === "manager_approved"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : approvalStatus === "pending"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : approvalStatus === "rejected"
              ? "bg-red-100 text-red-800 border-red-200"
              : approvalStatus === "disabled"
              ? "bg-gray-100 text-gray-800 border-gray-200"
              : "bg-blue-100 text-blue-800 border-blue-200"
          }
        >
          {approvalStatus === "accounts_approved" ? "Approved" : 
           approvalStatus === "manager_approved" ? "Manager Approved" :
           approvalStatus === "pending" ? "Pending" :
           approvalStatus === "rejected" ? "Rejected" :
           approvalStatus === "disabled" ? "Disabled" : approvalStatus}        </Badge>
      );
    },
  },
  {
    accessorKey: "commission_status",
    header: "Commission Status",    cell: ({ row }) => {
      const commissionStatus = row.getValue("commission_status") as string;
      console.log("Commission status for carrier:", row.original.company_name, "->", commissionStatus);
      const loadsCompleted = row.original.loads_completed || 0;
      const firstLoadDate = row.original.first_load_completed_at;
      
      // Default to "not_eligible" if no status is provided
      const status = commissionStatus || "not_eligible";

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={
              status === "paid"
                ? "bg-green-100 text-green-800 border-green-200"
                : status === "confirmed_sale"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }
          >
            {status === "paid" ? "Commission Paid" : 
             status === "confirmed_sale" ? "Confirmed Sale" :
             status === "pending" ? "Pending Payment" :
             "Not Eligible"}
          </Badge>
          {loadsCompleted > 0 && (
            <span className="text-xs text-muted-foreground">
              {loadsCompleted} load{loadsCompleted > 1 ? 's' : ''} completed
            </span>
          )}
          {firstLoadDate && (
            <span className="text-xs text-muted-foreground">
              First load: {format(new Date(firstLoadDate), "MMM dd, yyyy")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "assign_users",
    header: "Assign",
    cell: ({ row }) => {
      const carrier = row.original;
      return (
        <UserAssignmentButton
          carrierId={carrier.id}
          carrierName={`${carrier.company_name} (${carrier.mc_number})`}
          status={carrier.status}
        />
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

      return (        <div className="flex items-center justify-end gap-1">
          <CommissionStatusManager 
            carrier={carrier}
            onUpdate={(carrierId, newStatus) => {
              console.log(`Commission status updated for carrier ${carrierId}: ${newStatus}`);
              // Call the refresh function if provided
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
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
          </DropdownMenu>        </div>
      );
    },
  },
];

// Default columns export for backward compatibility
export const columns = createColumns();