"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dispatch } from "@/lib/dispatch-data";
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
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  brokerage_company: z.string().min(1, "Brokerage company is required"),
  brokerage_agent: z.string().min(1, "Brokerage agent is required"),
  agent_ph: z.string().min(1, "Agent phone is required"),
  agent_email: z.string().email("Invalid email format"),
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
  initialData?: Partial<Dispatch>;
  onSubmit: (data: DispatchFormValues) => void;
  isSubmitting?: boolean;
}

// Mock data for the current user session
// TODO: Replace with actual auth management system
const mockCurrentUser = {
  id: "user1",
  name: "John Doe",
  role: "dispatcher", // or "admin", "sales", etc.
  department: "Dispatch",
};

export function DispatchForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: DispatchFormProps) {
  // State to store carriers data
  const [carriers, setCarriers] = useState<
    {
      value: string;
      label: string;
      percentage: string;
    }[]
  >([]);

  // Selected carrier data
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);

  // Fetch carriers on component mount
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchCarriers = () => {
      try {
        // Get carriers from the mock data
        const allCarriers = getAllCarriers();

        // Format carriers for the dropdown
        const formattedCarriers = allCarriers.map((carrier) => ({
          value: carrier.id,
          label: carrier.company_name,
          percentage: carrier.agreed_percentage,
        }));

        setCarriers(formattedCarriers);
      } catch (error) {
        console.error("Error fetching carriers:", error);
      }
    };

    fetchCarriers();
  }, []);

  // Set up form with default values and current user defaults
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set the user to the current logged-in user (cannot be changed except by admin)
      user: initialData?.user || mockCurrentUser.name,
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
      carrier: initialData?.carrier || "",
      origin: initialData?.origin || "",
      destination: initialData?.destination || "",
      brokerage_company: initialData?.brokerage_company || "",
      brokerage_agent: initialData?.brokerage_agent || "",
      agent_ph: initialData?.agent_ph || "",
      agent_email: initialData?.agent_email || "",
      load_amount: initialData?.load_amount || 0,
      // Charge percentage should be taken from carrier profile but can be modified by admin
      charge_percent: initialData?.charge_percent || 0,
      status: initialData?.status || "Scheduled",
      payment: initialData?.payment || "",
      // Dispatcher name should be auto-populated with current user if their role is dispatcher
      dispatcher: initialData?.dispatcher || mockCurrentUser.name,
      invoice_status: initialData?.invoice_status || "Not Sent",
      payment_method: initialData?.payment_method || "ACH",
    },
  });

  // Watch the carrier field to update charge_percent
  const watchedCarrier = form.watch("carrier");

  // Update charge percentage when carrier changes
  useEffect(() => {
    if (watchedCarrier && watchedCarrier !== selectedCarrier) {
      setSelectedCarrier(watchedCarrier);

      // Find the selected carrier and get its percentage
      const carrier = carriers.find((c) => c.value === watchedCarrier);
      if (carrier) {
        // Update charge percentage field with the carrier's agreed percentage
        form.setValue("charge_percent", parseFloat(carrier.percentage));
      }
    }
  }, [watchedCarrier, carriers, form, selectedCarrier]);

  // Determine if user is admin
  // TODO: Replace with actual role checking
  const isAdmin = mockCurrentUser.role === "admin";

  // Form submission handler
  const handleSubmit = (values: DispatchFormValues) => {
    onSubmit(values);
  };

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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
              />

              <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a carrier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.value} value={carrier.value}>
                            {carrier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </Card>

          {/* Pickup & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="pickup_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pickup Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter origin location" {...field} />
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter destination location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Broker Information */}
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="brokerage_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brokerage Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brokerage company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brokerage_agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brokerage Agent</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter brokerage agent name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agent_ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter agent phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agent_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter agent email"
                        {...field}
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
                <div className="border rounded-lg p-4 bg-slate-50">
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

                <div className="border rounded-lg p-4 bg-slate-50">
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
          <Button type="submit" disabled={isSubmitting}>
            {initialData ? "Update Dispatch" : "Create Dispatch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
