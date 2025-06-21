"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { PermissionGate } from "@/components/auth/permission-gate";

export interface CommissionData {
  id: string;
  carrierId: string;
  companyName: string;
  mcNumber: string;
  driverName?: string;
  driverPhone?: string;
  commissionStatus: 'not_eligible' | 'pending' | 'confirmed_sale' | 'paid';
  commissionAmount?: number;
  agreedPercentage?: string;
  loadsCompleted?: number;
  firstLoadCompletedAt?: string;
  commissionPaidAt?: string;
  lastUpdated?: string;
}

export function createCommissionColumns(
  onRefresh: () => void,
  onEdit: (commission: CommissionData) => void
): ColumnDef<CommissionData>[] {
  
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return [
    {
      accessorKey: "mcNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            MC Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const mcNumber = row.getValue("mcNumber") as string;
        return <div className="font-medium text-blue-600">{mcNumber}</div>;
      },
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const companyName = row.getValue("companyName") as string;
        return <div className="font-medium">{companyName}</div>;
      },
    },
    {
      accessorKey: "driverName",
      header: "Driver Name",
      cell: ({ row }) => {
        const driverName = row.original.driverName;
        return (
          <div>
            <div className="font-medium">{driverName || "N/A"}</div>
            {row.original.driverPhone && (
              <div className="text-sm text-muted-foreground">
                {row.original.driverPhone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "agreedPercentage",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Commission %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const percentage = row.original.agreedPercentage;
        return (
          <div className="text-center font-medium">
            {percentage || "Not Set"}
          </div>
        );
      },
    },
    {
      accessorKey: "commissionAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Commission Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.commissionAmount;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "commissionStatus",
      header: "Commission Status",
      cell: ({ row }) => {
        const status = row.original.commissionStatus;
        const loadsCompleted = row.original.loadsCompleted || 0;
        
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
          </div>
        );
      },
    },
    {
      accessorKey: "commissionPaidAt",
      header: "Paid Date",
      cell: ({ row }) => {
        const paidAt = row.original.commissionPaidAt;
        if (!paidAt) return <div className="text-muted-foreground">-</div>;
        
        return (
          <div className="text-sm">
            {format(new Date(paidAt), "MMM dd, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "loadsCompleted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Loads Completed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const loads = row.original.loadsCompleted || 0;
        const firstLoadDate = row.original.firstLoadCompletedAt;
        
        return (
          <div className="text-center">
            <div className="font-medium">{loads}</div>
            {firstLoadDate && loads > 0 && (
              <div className="text-xs text-muted-foreground">
                First: {format(new Date(firstLoadDate), "MMM dd")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const commission = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <PermissionGate requiredPermission="commission.edit">
                <DropdownMenuItem onClick={() => onEdit(commission)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Commission
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </PermissionGate>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(commission.carrierId)}
              >
                Copy Carrier ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
