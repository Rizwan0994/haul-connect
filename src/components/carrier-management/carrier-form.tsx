import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Carrier } from "@/lib/carriers-data";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-context";

// Define form schema with Zod
const carrierFormSchema = z.object({
  company_name: z.string().min(2, "Company name is required").max(100, "Company name is too long"),
  mc_number: z.string().min(2, "MC number is required")
    .regex(/^[0-9]+$/, "MC number should contain only numbers"),
  us_dot_number: z.string().optional()
    .refine(val => !val || /^[0-9]+$/.test(val), "DOT number should contain only numbers"),
  owner_name: z.string().min(2, "Owner name is required").max(100, "Owner name is too long"),
  phone_number: z.string()
    .regex(/^[0-9()-.\s]+$/, "Phone number format is invalid")
    .min(10, "Valid phone number is required"),
  email_address: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required").max(200, "Address is too long"),
  truck_type: z.string().min(1, "Truck type is required"),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  
  // Driver information
  driver_name: z.string().optional()
    .refine(val => !val || val.length >= 2, "Driver name must be at least 2 characters")
    .refine(val => !val || val.length <= 100, "Driver name is too long"),
  driver_phone: z.string().optional()
    .refine(val => !val || /^[0-9()-.\s]+$/.test(val), "Phone number format is invalid")
    .refine(val => !val || val.length >= 10, "Valid phone number is required"),
  driver_email: z.string().email("Valid driver email is required").optional().or(z.literal("")),
  driver_license_number: z.string().optional()
    .refine(val => !val || val.length >= 5, "License number is too short"),
  driver_license_state: z.string().optional()
    .refine(val => !val || val.length <= 2, "Use state abbreviation (e.g., CA)"),
  driver_license_expiration: z.string().optional()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Use format YYYY-MM-DD"),
  
  // Additional fields
  dimensions: z.string().optional(),
  doors_type: z.string().optional(),
  door_clearance: z.string().optional(),
  max_weight: z.string().optional(),
  dock_height: z.string().optional(),
  accessories: z.string().optional(),
  temp_control_range: z.string().optional(),
  agreed_percentage: z.string().optional(),
  
  // Insurance info
  insurance_company_name: z.string().optional(),
  insurance_company_address: z.string().optional(),
  insurance_agent_name: z.string().optional(),
  insurance_agent_number: z.string().optional(),
  insurance_agent_email: z.string().email("Valid email is required").optional().or(z.literal("")),
  
  // Factoring info
  factoring_company_name: z.string().optional(),
  factoring_company_address: z.string().optional(),
  factoring_agent_name: z.string().optional(),
  factoring_agent_number: z.string().optional(),
  factoring_agent_email: z.string().email("Valid email is required").optional().or(z.literal("")),
  
  // Notes
  notes_home_town: z.string().optional(),
  notes_days_working: z.string().optional(),
  notes_preferred_lanes: z.string().optional(),
  notes_average_gross: z.string().optional(),
  notes_parking_space: z.string().optional(),
  notes_additional_preferences: z.string().optional(),
    // Office use
  office_use_carrier_no: z.string().optional(),
  office_use_team_assigned: z.string().optional(),
  office_use_special_notes: z.string().optional(),
  
  // Admin only fields
  dat_username: z.string().optional(),
  dat_password: z.string().optional(),
  truckstop_username: z.string().optional(),
  truckstop_password: z.string().optional(),
  truckstop_carrier_id: z.string().optional(),
  truckstop_carrier_zip: z.string().optional(),
  eld_provider: z.string().optional(),
  eld_site: z.string().optional(),
  eld_username: z.string().optional(),
  eld_password: z.string().optional(),
  mycarrierpackets_username: z.string().optional(),
  mycarrierpackets_password: z.string().optional(),
});

export type CarrierFormValues = z.infer<typeof carrierFormSchema>;

interface CarrierFormProps {
  initialData?: Partial<Carrier>;
  onSubmit: (values: CarrierFormValues) => void;
  isLoading?: boolean;
}

export function CarrierForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CarrierFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { hasPermission } = useAuth();
    // Check if user is admin
  const isAdmin = hasPermission(['admin', 'super admin']);
  
  // Reset tab to basic if trying to access admin tab without permissions
  React.useEffect(() => {
    if (activeTab === "admin" && !isAdmin) {
      setActiveTab("basic");
    }
  }, [activeTab, isAdmin]);
  
  // Initialize the form with default values
  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      company_name: initialData?.company_name || "",
      mc_number: initialData?.mc_number || "",
      us_dot_number: initialData?.us_dot_number || "",
      owner_name: initialData?.owner_name || "",
      phone_number: initialData?.phone_number || "",
      email_address: initialData?.email_address || "",
      address: initialData?.address || "",
      truck_type: initialData?.truck_type || "",
      status: (initialData?.status as any) || "active",
      
      // Driver information
      driver_name: initialData?.driver_name || "",
      driver_phone: initialData?.driver_phone || "",
      driver_email: initialData?.driver_email || "",
      driver_license_number: initialData?.driver_license_number || "",
      driver_license_state: initialData?.driver_license_state || "",
      driver_license_expiration: initialData?.driver_license_expiration || "",
      
      // Additional fields
      dimensions: initialData?.dimensions || "",
      doors_type: initialData?.doors_type || "",
      door_clearance: initialData?.door_clearance || "",
      max_weight: initialData?.max_weight || "",
      dock_height: initialData?.dock_height || "",
      accessories: initialData?.accessories || "",
      temp_control_range: initialData?.temp_control_range || "",
      agreed_percentage: initialData?.agreed_percentage || "",
      
      // Insurance info
      insurance_company_name: initialData?.insurance_company_name || "",
      insurance_company_address: initialData?.insurance_company_address || "",
      insurance_agent_name: initialData?.insurance_agent_name || "",
      insurance_agent_number: initialData?.insurance_agent_number || "",
      insurance_agent_email: initialData?.insurance_agent_email || "",
      
      // Factoring info
      factoring_company_name: initialData?.factoring_company_name || "",
      factoring_company_address: initialData?.factoring_company_address || "",
      factoring_agent_name: initialData?.factoring_agent_name || "",
      factoring_agent_number: initialData?.factoring_agent_number || "",
      factoring_agent_email: initialData?.factoring_agent_email || "",
      
      // Notes
      notes_home_town: initialData?.notes_home_town || "",
      notes_days_working: initialData?.notes_days_working || "",
      notes_preferred_lanes: initialData?.notes_preferred_lanes || "",
      notes_average_gross: initialData?.notes_average_gross || "",
      notes_parking_space: initialData?.notes_parking_space || "",
      notes_additional_preferences: initialData?.notes_additional_preferences || "",
        // Office use
      office_use_carrier_no: initialData?.office_use_carrier_no || "",
      office_use_team_assigned: initialData?.office_use_team_assigned || "",
      office_use_special_notes: initialData?.office_use_special_notes || "",
      
      // Admin only fields
      dat_username: initialData?.dat_username || "",
      dat_password: initialData?.dat_password || "",
      truckstop_username: initialData?.truckstop_username || "",
      truckstop_password: initialData?.truckstop_password || "",
      truckstop_carrier_id: initialData?.truckstop_carrier_id || "",
      truckstop_carrier_zip: initialData?.truckstop_carrier_zip || "",
      eld_provider: initialData?.eld_provider || "",
      eld_site: initialData?.eld_site || "",
      eld_username: initialData?.eld_username || "",
      eld_password: initialData?.eld_password || "",
      mycarrierpackets_username: initialData?.mycarrierpackets_username || "",
      mycarrierpackets_password: initialData?.mycarrierpackets_password || "",
    },
  });

  // Handle form submission
  const handleSubmit = (values: CarrierFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">          <TabsList className={`grid ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'} mb-8`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="driver">Driver Details</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="factoring">Factoring</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin Only</TabsTrigger>}
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mc_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MC Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MC-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="us_dot_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOT Number</FormLabel>
                    <FormControl>
                      <Input placeholder="DOT number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Business address" {...field} />
                    </FormControl>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Driver Details Tab */}
          <TabsContent value="driver" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="driver_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Driver name" {...field} />
                        </FormControl>
                        <FormDescription>
                          If different from owner
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Driver phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Driver email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="License number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_license_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_license_expiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiration</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Details Tab */}
          <TabsContent value="vehicle" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="truck_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Truck Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select truck type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Box Truck">Box Truck</SelectItem>
                        <SelectItem value="Dry Van">Dry Van</SelectItem>
                        <SelectItem value="Flatbed">Flatbed</SelectItem>
                        <SelectItem value="Reefer">Reefer</SelectItem>
                        <SelectItem value="Hotshot">Hotshot</SelectItem>
                        <SelectItem value="Step Deck">Step Deck</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="L x W x H" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doors_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Door Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select door type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Roll Up">Roll Up</SelectItem>
                        <SelectItem value="Swing">Swing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dock_height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dock Height</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input placeholder="Maximum weight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessories</FormLabel>
                    <FormControl>
                      <Input placeholder="Lift gate, pallet jack, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temp_control_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature Control Range</FormLabel>
                    <FormControl>
                      <Input placeholder="Temperature range" {...field} />
                    </FormControl>
                    <FormDescription>For refrigerated vehicles</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agreed_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Percentage</FormLabel>
                    <FormControl>
                      <Input placeholder="Commission %" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance_company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance_company_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Company Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance_agent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Agent</FormLabel>
                    <FormControl>
                      <Input placeholder="Agent name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance_agent_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance_agent_email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Agent Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Factoring Tab */}
          <TabsContent value="factoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="factoring_company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factoring Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoring_company_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factoring Company Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoring_agent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factoring Agent</FormLabel>
                    <FormControl>
                      <Input placeholder="Agent name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoring_agent_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoring_agent_email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Agent Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notes_home_town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Town</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes_days_working"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Working</FormLabel>
                    <FormControl>
                      <Input placeholder="Mon-Fri, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes_preferred_lanes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Preferred Lanes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe preferred routes/lanes"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes_average_gross"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Gross</FormLabel>
                    <FormControl>
                      <Input placeholder="Average weekly/monthly earnings" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes_parking_space"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Space</FormLabel>
                    <FormControl>
                      <Input placeholder="Parking details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes_additional_preferences"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Additional Preferences</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any other preferences or notes"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="col-span-2 my-4" />
              
              <FormField
                control={form.control}
                name="office_use_carrier_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier No. (Office Use)</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal carrier number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="office_use_team_assigned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Assigned (Office Use)</FormLabel>
                    <FormControl>
                      <Input placeholder="Team assigned" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="office_use_special_notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Special Notes (Office Use)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special notes for office use"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}              />
            </div>
          </TabsContent>          {/* Admin Only Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-amber-600 mt-0.5">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800">Restricted Access</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          This information is restricted to administrators only. Please do not share these credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                <div className="space-y-6">
                  {/* DAT Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">DAT Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dat_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DAT Username / Email</FormLabel>
                            <FormControl>
                              <Input placeholder="DAT username or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dat_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DAT Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="DAT password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Truckstop Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Truckstop Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="truckstop_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Truckstop User / Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Truckstop username or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="truckstop_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Truckstop Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Truckstop password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="truckstop_carrier_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Truckstop / RMIS Carrier ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Carrier ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="truckstop_carrier_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Truckstop / RMIS Carrier Zip</FormLabel>
                            <FormControl>
                              <Input placeholder="Carrier ZIP code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* ELD Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">ELD Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eld_provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ELD Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Name of ELD provider" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eld_site"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ELD Site</FormLabel>
                            <FormControl>
                              <Input placeholder="ELD website URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eld_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ELD Username / Email</FormLabel>
                            <FormControl>
                              <Input placeholder="ELD username or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eld_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ELD Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="ELD password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* MyCarrierPackets Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">My Carrier Packets Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mycarrierpackets_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MyCarrierPackets Username / Email</FormLabel>
                            <FormControl>
                              <Input placeholder="MyCarrierPackets username or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mycarrierpackets_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MyCarrierPackets Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="MyCarrierPackets password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData?.id ? "Update Carrier" : "Create Carrier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
