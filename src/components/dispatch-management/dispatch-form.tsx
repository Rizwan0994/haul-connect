"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Info, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dispatch } from "@/lib/dispatch-api";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllCarriers } from "@/lib/carriers-data";
import { carrierApiService } from "@/services/carrierApi";
import { useAuth } from "@/components/auth/auth-context";
import { BrokerMultiSelect } from "./broker-multi-select";
import { ShipperMultiSelect } from "./shipper-multi-select";
import { ConsigneeMultiSelect } from "./consignee-multi-select";
import { Broker } from "@/services/brokerApi";
import { Shipper } from "@/services/shipperApi";
import { Consignee } from "@/services/consigneeApi";

// Define the form schema with validation
const formSchema = z.object({
  user: z.string().min(2, "User name is required"),
  department: z.string().min(1, "Department is required"),
  booking_date: z.date({
    required_error: "Booking date is required",
  }),
  load_no: z.string().min(1, "Load number is required"),
  pickup_date: z.date({
    required_error: "Pickup date is required",
  }),
  dropoff_date: z.date({
    required_error: "Dropoff date is required",
  }),
  carrier: z.string().min(1, "Carrier is required"),  
  shippers: z.array(z.object({
  id: z.number(),
    shipper_name: z.string(),
    // contact: z.string().optional(),
    // telephone: z.string().optional(),
    // address: z.string().optional(),
    // ext: z.string().optional(),
    // email: z.string().optional(),
    // notes: z.string().optional(),
    // attachment: z.any().optional(),
    // attachment_path: z.string().optional(),
    // attachment_filename: z.string().optional(),
    // created_by: z.number().optional(),
    // updated_by: z.number().optional(),
    // created_at: z.string().optional(),
    // updated_at: z.string().optional(),
    // createdBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
    // updatedBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
  })).min(1, "At least one shipper is required"),
  consignees: z.array(z.object({
     id: z.number(),
    consignee_name: z.string(),
    // contact: z.string().optional(),
    // telephone: z.string().optional(),
    // address: z.string().optional(),
    // ext: z.string().optional(),
    // email: z.string().optional(),
    // notes: z.string().optional(),
    // attachment: z.any().optional(),
    // attachment_path: z.string().optional(),
    // attachment_filename: z.string().optional(),
    // created_by: z.number().optional(),
    // updated_by: z.number().optional(),
    // created_at: z.string().optional(),
    // updated_at: z.string().optional(),
    // createdBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
    // updatedBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
  })).min(1, "At least one consignee is required"),  
  brokers: z.array(z.object({
    id: z.number(),
    brokerage_company: z.string(),
    // agent_name: z.string(),
    // agent_phone: z.string().optional(),
    // agent_email: z.string().optional(),
    // created_by: z.number().optional(),
    // updated_by: z.number().optional(),
    // created_at: z.string(),
    // updated_at: z.string(),
    // createdBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
    // updatedBy: z.object({
    //   id: z.number(),
    //   username: z.string(),
    //   email: z.string(),
    // }).optional(),
  })).min(1, "At least one broker is required"),
  load_amount: z.coerce.number().min(0, "Amount must be positive"),
  charge_percent: z.coerce
    .number()
    .min(0, "Percentage must be positive")
    .max(100, "Percentage cannot exceed 100"),
  status: z.enum(["Scheduled", "In Transit", "Delivered", "Cancelled"]),
  payment: z.string().optional(),
  dispatcher: z.string().min(1, "Dispatcher is required"),
  invoice_status: z.enum([
    "Not Sent",
    "Invoice Sent",
    "Invoice Pending",
    "Invoice Cleared",
  ]),
  payment_method: z.enum(["ACH", "ZELLE", "OTHER"]),
});

export type DispatchFormValues = z.infer<typeof formSchema>;

interface DispatchFormProps {
  initialData?: Partial<Dispatch> & {
    carrier_id?: number;
    carrier?: string | { id: number; company_name: string; mc_number: string; owner_name: string; phone_number: string; email_address: string; truck_type: string; status: "active" | "inactive" | "pending" | "suspended"; };
    user?: string | { first_name: string; last_name: string; id: number; email: string; };
    brokers?: Broker[];
    shippers?: Shipper[];
    consignees?: Consignee[];
  };
  onSubmit: (data: DispatchFormValues) => void;
  isSubmitting?: boolean;
}


export function DispatchForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: DispatchFormProps) {
  const { currentUser } = useAuth();

  // Type guard for user object
  const isUserObject = (user: any): user is { first_name: string; last_name: string; } => {
    return user && typeof user === 'object' && 'first_name' in user && 'last_name' in user;
  };

  // State to store carriers data
  const [carriers, setCarriers] = useState<
    {
      value: string;
      label: string;
      percentage: string;
    }[]
  >([]);
  const [isLoadingCarriers, setIsLoadingCarriers] = useState(false);
  // Selected carrier data
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);

  // Fetch carriers on component mount
  useEffect(() => {
    const fetchCarriers = async () => {
      setIsLoadingCarriers(true);
      try {
        // Use the real carrier API service instead of mock data
        const allCarriers = await carrierApiService.getAllCarriers();
        const formattedCarriers = allCarriers.map((carrier) => ({
          value: carrier.id?.toString() || "",
          label: `${carrier.company_name} (${carrier.mc_number})`,
          percentage: carrier.agreed_percentage?.toString() || "0",
        }));
        setCarriers(formattedCarriers);
      } catch (error) {
        console.error('Error fetching carriers:', error);
      } finally {
        setIsLoadingCarriers(false);
      }
    };

    fetchCarriers();
  }, []);
 console.log('Fetched carriers:', carriers);  // Set up form with default values and current user defaults
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set the user to the current logged-in user (cannot be changed except by admin)
      user: isUserObject(initialData?.user) 
        ? `${initialData.user.first_name} ${initialData.user.last_name}`
        : (typeof initialData?.user === 'string' ? initialData.user : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Unknown User")),
      // Default department should always be "Dispatch" per client requirements
      department: initialData?.department || "Dispatch",
      booking_date: initialData?.booking_date
        ? new Date(initialData.booking_date)
        : new Date(),
      load_no: initialData?.load_no || "",
      pickup_date: initialData?.pickup_date
        ? new Date(initialData.pickup_date)
        : new Date(),
      dropoff_date: initialData?.dropoff_date
        ? new Date(initialData.dropoff_date)
        : new Date(),
      carrier: initialData?.carrier_id ? initialData.carrier_id.toString() : "",
      shippers: initialData?.shippers || [],
      consignees: initialData?.consignees || [],
      brokers: initialData?.brokers || [],
      load_amount: initialData?.load_amount || 0,
      // Charge percentage should be taken from carrier profile but can be modified by admin
      charge_percent: initialData?.charge_percent || 0,
      status: initialData?.status || "Scheduled",
      payment: initialData?.payment || "",
      // Dispatcher name should be auto-populated with current user if their role is dispatcher
      dispatcher: initialData?.dispatcher || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Unknown Dispatcher"),
      invoice_status: initialData?.invoice_status || "Not Sent",
      payment_method: initialData?.payment_method || "ACH",
    },
  });
  // Watch the carrier field to update charge_percent
  const watchedCarrier = form.watch("carrier");
  // Update charge percentage when carrier changes
  useEffect(() => {
    if (watchedCarrier && carriers.length > 0) {
      // Find the selected carrier and get its percentage
      const carrier = carriers.find((c) => c.value === watchedCarrier);
      if (carrier) {
        setSelectedCarrier(carrier);
        // Update charge percentage field with the carrier's agreed percentage
        form.setValue("charge_percent", parseFloat(carrier.percentage) || 0);
      }
    }
  }, [watchedCarrier, carriers, form]);

  // Handle form submission with data transformation
  const handleSubmit = (values: DispatchFormValues) => {
    // Transform the data to match backend expectations
    const transformedData = {
      ...values,
      // For backward compatibility, extract primary broker info if needed
      brokerage_company: values.brokers[0]?.brokerage_company || "",
      brokerage_agent: values.brokers[0]?.agent_name || "",
      agent_ph: values.brokers[0]?.agent_phone || "",
      agent_email: values.brokers[0]?.agent_email || "",
      // For backward compatibility, extract primary shipper/consignee if needed
      origin: values.shippers[0]?.shipper_name || "",
      destination: values.consignees[0]?.consignee_name || "",
    };
    
    onSubmit(transformedData);
  };
  // Determine if user is admin
  // TODO: Replace with actual role checking
  const isAdmin = currentUser?.category === "admin_manager" || currentUser?.category === "admin_user" || currentUser?.category === "super_admin";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Commission Information</CardTitle>
            <CardDescription>
              Track commission details for sales and dispatch
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Username
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Auto-populated with logged-in user. Only admin can
                          change.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      {...field}
                      disabled={!isAdmin}
                      className={!isAdmin ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Department
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Defaults to Dispatch as per requirements
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isAdmin}
                  >
                    <FormControl>
                      <SelectTrigger className={!isAdmin ? "bg-muted" : ""}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Dispatch">Dispatch</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispatcher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Dispatcher
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Auto-populated with current dispatcher
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dispatcher name"
                      {...field}
                      disabled={!isAdmin}
                      className={!isAdmin ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="booking_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Booking Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            field.onChange(new Date(dateValue));
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="load_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter load number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />                <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const carrier = carriers.find(c => c.value === value);
                        setSelectedCarrier(carrier || null);
                      }} 
                      defaultValue={field.value}
                      disabled={isLoadingCarriers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a carrier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.value} value={carrier.value}>
                            <div className="flex flex-col">
                              <span>{carrier.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Display selected carrier information */}
                    {selectedCarrier && (
                      <div className="mt-2 p-3 border rounded-lg bg-gray-800">
                        <h4 className="font-medium text-sm mb-2">Selected Carrier:</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Company:</strong> {selectedCarrier.label}</div>
                          <div><strong>Agreed Percentage:</strong> {selectedCarrier.percentage}%</div>
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>          {/* Pickup & Delivery */}          <Card>
            <CardHeader>
              <CardTitle>Pickup & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pickup_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pickup Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              field.onChange(new Date(dateValue));
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoff_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Dropoff Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              field.onChange(new Date(dateValue));
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shipper and Consignee Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="shippers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shippers</FormLabel>
                      <FormControl>
                        <ShipperMultiSelect
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consignees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consignees</FormLabel>
                      <FormControl>
                        <ConsigneeMultiSelect
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{/* Broker Information */}
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="brokers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brokers</FormLabel>
                    <FormControl>
                      <BrokerMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment & Commission */}
          <Card>
            <CardHeader>
              <CardTitle>Payment & Commission</CardTitle>
              <CardDescription>
                Track financial information and commission details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="load_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter load amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="charge_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Charge Percentage (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Auto-populated from carrier profile. Admin can
                            modify.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter charge percentage"
                        {...field}
                        disabled={!isAdmin}
                        className={!isAdmin ? "bg-muted" : ""}
                      />
                    </FormControl>
                    {field.value > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Commission amount: $
                        {(
                          form.watch("load_amount") *
                          (field.value / 100)
                        ).toFixed(2)}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not Sent">Not Sent</SelectItem>
                        <SelectItem value="Invoice Sent">
                          Invoice Sent
                        </SelectItem>
                        <SelectItem value="Invoice Pending">
                          Invoice Pending
                        </SelectItem>
                        <SelectItem value="Invoice Cleared">
                          Invoice Cleared
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACH">ACH</SelectItem>
                        <SelectItem value="ZELLE">ZELLE</SelectItem>
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter payment notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Commission Flow Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Flow Summary</CardTitle>
            <CardDescription>
              Understanding how commissions are calculated and distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-gray-600">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      Sales
                    </Badge>
                    Commission Flow
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Sales person contacts carrier/driver</li>
                    <li>Negotiates and closes on a percentage (e.g., 8%)</li>
                    <li>Carrier sends required documents</li>
                    <li>Sales creates carrier profile</li>
                    <li>Manager assigns carrier to a dispatcher</li>
                    <li>Commission earned on first booked load only</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4 bg-gray-600">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Dispatch
                    </Badge>
                    Commission Flow
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Support books load (e.g., $1000)</li>
                    <li>Carrier delivers load successfully</li>
                    <li>Carrier pays agreed invoice (e.g., $80)</li>
                    <li>Dispatch person gets commission on each load</li>
                    <li>Basic salary applies if target amount is achieved</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingCarriers}>
            {initialData ? "Update Dispatch" : "Create Dispatch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}