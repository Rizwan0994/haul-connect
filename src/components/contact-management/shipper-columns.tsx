"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowDownUp, Eye, MoreHorizontal, Pencil, Trash2, Download, FileText } from "lucide-react"
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
import { Shipper, shipperApi } from "@/services/shipperApi"
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
import { useToast } from '@/components/ui/use-toast'
import { PermissionGate } from "@/components/auth/permission-gate"

interface ShipperColumnsProps {
  onDelete: (id: number) => void
}

export const shipperColumns = ({ onDelete }: ShipperColumnsProps): ColumnDef<Shipper>[] => {
  const { toast } = useToast()
  const handleDownloadAttachment = async (shipper: Shipper) => {
    if (!shipper.attachment_filename || !shipper.id) return
    
    try {
      const filename = shipper.attachment_filename
      const blob = await shipperApi.downloadAttachment(shipper.id, filename)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Attachment downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading attachment:', error)
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      })
    }
  }

  return [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Shipper ID
            <ArrowDownUp className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div className="font-mono text-sm">
            {shipper.id}
          </div>
        )
      },
    },    {
      accessorKey: "shipper_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Shipper Name
            <ArrowDownUp className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div className="font-medium">
            {shipper.shipper_name}
          </div>
        )
      },
    },
    {
      accessorKey: "contact",
      header: "Contact Person",      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div>
            {shipper.contact || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div className="text-muted-foreground">
            {shipper.email}
          </div>
        )
      },
    },    {
      accessorKey: "telephone",
      header: "Phone",
      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div className="text-muted-foreground">
            {shipper.telephone || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const shipper = row.original
        return (
          <div className="text-muted-foreground">
            {shipper.address || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "attachment_url",
      header: "Attachment",
      cell: ({ row }) => {
        const shipper = row.original
        return shipper.attachment_filename ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadAttachment(shipper)}
          >
            <FileText className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">No file</span>
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
        const shipper = row.original
        return shipper.created_at ? format(new Date(shipper.created_at), "MMM dd, yyyy") : "N/A"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const shipper = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <PermissionGate requiredPermission="shippers.view">
                <DropdownMenuItem asChild>
                  <Link to={`/contact-management/shippers/${shipper.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </PermissionGate>
              <PermissionGate requiredPermission="shippers.edit">
                <DropdownMenuItem asChild>
                  <Link to={`/contact-management/shippers/${shipper.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              </PermissionGate>
              {shipper.attachment_filename && (
                <PermissionGate requiredPermission="shippers.view">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDownloadAttachment(shipper)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Attachment
                  </DropdownMenuItem>
                </PermissionGate>
              )}
              <PermissionGate requiredPermission="shippers.delete">
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
                        This action cannot be undone. This will permanently delete the shipper
                        "{shipper.shipper_name}" and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => shipper.id && onDelete(shipper.id)}
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
}
