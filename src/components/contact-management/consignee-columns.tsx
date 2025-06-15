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
import { Consignee, consigneeApi } from "@/services/consigneeApi"
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

interface ConsigneeColumnsProps {
  onDelete: (id: number) => void
}

export const consigneeColumns = ({ onDelete }: ConsigneeColumnsProps): ColumnDef<Consignee>[] => {
  const { toast } = useToast()
  const handleDownloadAttachment = async (consignee: Consignee) => {
    if (!consignee.attachment_filename || !consignee.id) return
    
    try {
      const filename = consignee.attachment_filename
      const blob = await consigneeApi.downloadAttachment(consignee.id, filename)
      
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
            Consignee ID
            <ArrowDownUp className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div className="font-mono text-sm">
            {consignee.id}
          </div>
        )
      },
    },    {
      accessorKey: "consignee_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Consignee Name
            <ArrowDownUp className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div className="font-medium">
            {consignee.consignee_name}
          </div>
        )
      },
    },
    {
      accessorKey: "contact",
      header: "Contact Person",
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div>
            {consignee.contact || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div className="text-muted-foreground">
            {consignee.email}
          </div>
        )
      },
    },    {
      accessorKey: "telephone",
      header: "Phone",
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div className="text-muted-foreground">
            {consignee.telephone || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const consignee = row.original
        return (
          <div className="text-muted-foreground">
            {consignee.address || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "attachment_url",
      header: "Attachment",
      cell: ({ row }) => {
        const consignee = row.original
        return consignee.attachment_filename ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadAttachment(consignee)}
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
        const consignee = row.original
        return consignee.created_at ? format(new Date(consignee.created_at), "MMM dd, yyyy") : "N/A"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const consignee = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/contact-management/consignees/${consignee.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/contact-management/consignees/${consignee.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {consignee.attachment_filename && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDownloadAttachment(consignee)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Attachment
                  </DropdownMenuItem>
                </>
              )}
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
                      This action cannot be undone. This will permanently delete the consignee
                      "{consignee.consignee_name}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => consignee.id && onDelete(consignee.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
