"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowDownUp, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { Broker } from "@/services/brokerApi"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PermissionGate } from "@/components/auth/permission-gate"

interface BrokerColumnsProps {
  onDelete: (id: number) => void
}

export const brokerColumns = ({ onDelete }: BrokerColumnsProps): ColumnDef<Broker>[] => [
  {
    accessorKey: "brokerage_company",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Brokerage Company
          <ArrowDownUp className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const broker = row.original
      return (
        <div className="font-medium">
          {broker.brokerage_company}
        </div>
      )
    },
  },
  {
    accessorKey: "agent_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agent Name
          <ArrowDownUp className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const broker = row.original
      return (
        <div>
          {broker.agent_name}
        </div>
      )
    },
  },
  {
    accessorKey: "agent_email",
    header: "Email",
    cell: ({ row }) => {
      const broker = row.original
      return (
        <div className="text-muted-foreground">
          {broker.agent_email || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "agent_phone",
    header: "Phone",
    cell: ({ row }) => {
      const broker = row.original
      return (
        <div className="text-muted-foreground">
          {broker.agent_phone || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date
          <ArrowDownUp className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const broker = row.original
      return format(new Date(broker.created_at), "MMM dd, yyyy")
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const broker = row.original
      return (        <div className="text-muted-foreground">
          {broker.createdBy ? `${broker.createdBy.first_name} ${broker.createdBy.last_name}` : "N/A"}
        </div>
      )
    },
  },  {
    id: "actions",
    cell: ({ row }) => {
      const broker = row.original

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
            <DropdownMenuSeparator />            <PermissionGate requiredPermission="brokers.view">
              <DropdownMenuItem asChild>
                <Link to={`/contact-management/brokers/${broker.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </PermissionGate>
            <PermissionGate requiredPermission="brokers.edit">
              <DropdownMenuItem asChild>
                <Link to={`/contact-management/brokers/${broker.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </PermissionGate>
            <PermissionGate requiredPermission="brokers.delete">
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the broker
                      "{broker.brokerage_company}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(broker.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
