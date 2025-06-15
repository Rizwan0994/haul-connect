"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Clock } from "lucide-react";
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

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  employee: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export function createAttendanceColumns(
  onRefresh: () => void,
  onEdit: (record: AttendanceRecord) => void,
  onDelete: (record: AttendanceRecord) => void
): ColumnDef<AttendanceRecord>[] {
  
  return [
    {
      accessorKey: "id",
      header: "Sr No",
      cell: ({ row }) => {
        return <div className="font-medium">{row.index + 1}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "employee.username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const employee = row.original.employee;
        return (
          <div>
            <div className="font-medium">{employee.username}</div>
            <div className="text-sm text-muted-foreground">{employee.email}</div>
            <div className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {employee.role}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return (
          <div className="font-medium">
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        );
      },
    },
    {
      id: "times",
      header: "Time",
      cell: ({ row }) => {
        const checkIn = row.original.check_in_time;
        const checkOut = row.original.check_out_time;
        
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-green-600" />
              <span className="text-sm">
                In: {checkIn ? format(new Date(`2000-01-01T${checkIn}`), "hh:mm a") : "-"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-red-600" />
              <span className="text-sm">
                Out: {checkOut ? format(new Date(`2000-01-01T${checkOut}`), "hh:mm a") : "-"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        
        return (
          <Badge
            variant="outline"
            className={
              status === "present"
                ? "bg-green-100 text-green-800 border-green-200"
                : status === "late"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : status === "half_day"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-red-100 text-red-800 border-red-200"
            }
          >
            {status === "present" ? "Present" : 
             status === "late" ? "Late" :
             status === "half_day" ? "Half Day" :
             "Absent"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        return (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
            {notes || "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const record = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(record)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Record
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(record)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
