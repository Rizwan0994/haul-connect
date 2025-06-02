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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dispatch } from "@/lib/dispatch-api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<Dispatch>[] = [
  // Hidden column specifically for searching carrier company names
  {
    id: "carrier_company_name",
    accessorFn: (row) => row.carrier?.company_name || "",
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableHiding: true,
    meta: {
      isHidden: true,
    },
  },
  {
    accessorKey: "load_no",
    header: "Load No.",
    cell: ({ row }) => {
      const dispatch = row.original;
      return (
        <Link
          to={`/dispatch-management/${dispatch.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {dispatch.load_no}
        </Link>
      );
    },
  },{
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
    cell: ({ row }) => {
      const dispatch = row.original;
      const carrier = dispatch.carrier;
      
      if (!carrier) {
        return <div className="text-muted-foreground">No carrier assigned</div>;
      }
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px] truncate font-medium">
                {carrier.company_name}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <p className="font-medium">{carrier.company_name}</p>
                <p className="text-sm text-muted-foreground">MC: {carrier.mc_number}</p>
                <p className="text-sm text-muted-foreground">Owner: {carrier.owner_name}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const carrierA = rowA.original.carrier?.company_name || "";
      const carrierB = rowB.original.carrier?.company_name || "";
      return carrierA.localeCompare(carrierB);
    },
    filterFn: (row, columnId, value) => {
      const carrier = row.original.carrier;
      if (!carrier || !value) return true;
      
      const searchValue = value.toLowerCase();
      const companyName = carrier.company_name?.toLowerCase() || "";
      const mcNumber = carrier.mc_number?.toLowerCase() || "";
      const ownerName = carrier.owner_name?.toLowerCase() || "";
      
      return companyName.includes(searchValue) || 
             mcNumber.includes(searchValue) || 
             ownerName.includes(searchValue);
    },
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
    accessorKey: "origin",
    header: "Origin",
    cell: ({ row }) => {
      const origin = row.getValue("origin") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px] truncate">{origin}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{origin}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "destination",
    header: "Destination",
    cell: ({ row }) => {
      const destination = row.getValue("destination") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px] truncate">{destination}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{destination}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "pickup_date",
    header: "Pickup Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("pickup_date");
      if (!dateValue) return "-";

      try {
        const pickupDate = new Date(dateValue as string);
        if (isNaN(pickupDate.getTime())) return "-";
        return format(pickupDate, "MMM dd, yyyy");
      } catch (_error) {
        return "-";
      }
    },
  },
  {
    accessorKey: "dropoff_date",
    header: "Delivery Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("dropoff_date");
      if (!dateValue) return "-";

      try {
        const deliveryDate = new Date(dateValue as string);
        if (isNaN(deliveryDate.getTime())) return "-";
        return format(deliveryDate, "MMM dd, yyyy");
      } catch (_error) {
        return "-";
      }
    },
  },
  {
    accessorKey: "load_amount",
    header: "Load Amount",
    cell: ({ row }) => {
      const amount = row.getValue("load_amount") as number;
      return amount ? `$${amount.toLocaleString()}` : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case "delivered":
            return "bg-green-100 text-green-800 border-green-200";
          case "in_transit":
          case "in transit":
            return "bg-blue-100 text-blue-800 border-blue-200";
          case "scheduled":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          case "cancelled":
            return "bg-red-100 text-red-800 border-red-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <Badge variant="outline" className={getStatusColor(status)}>
          {status?.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "invoice_status",
    header: "Invoice Status",
    cell: ({ row }) => {
      const invoiceStatus = row.getValue("invoice_status") as string;

      const getInvoiceStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case "paid":
            return "bg-green-100 text-green-800 border-green-200";
          case "sent":
            return "bg-blue-100 text-blue-800 border-blue-200";
          case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          case "draft":
            return "bg-gray-100 text-gray-800 border-gray-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <Badge variant="outline" className={getInvoiceStatusColor(invoiceStatus)}>
          {invoiceStatus}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispatch = row.original;

      return (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/dispatch-management/${dispatch.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View dispatch</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/dispatch-management/${dispatch.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit dispatch</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Dispatch</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/dispatch-management/${dispatch.id}/invoice`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">View invoice</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Invoice</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(dispatch.id.toString())}
              >
                Copy dispatch ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/dispatch-management/${dispatch.id}`}>
                  View dispatch details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dispatch-management/${dispatch.id}/edit`}>
                  Edit dispatch
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dispatch-management/${dispatch.id}/invoice`}>
                  View invoice
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
