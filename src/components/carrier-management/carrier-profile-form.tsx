"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Save, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createCarrier, updateCarrier } from "@/lib/carriers-data";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";

interface CarrierProfileFormProps {
  isNew: boolean;
  id: string;
}

const CarrierProfileForm = ({ isNew, id }: CarrierProfileFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace apostrophes in these dimensions with escaped versions
  const dimensions = "53&apos; x 8.5&apos; x 9&apos;";
  const doorClearance = "8.5&apos;";

  const mockCarrierData = isNew ? null : {
    id: "1",
    agent_name: "Jane Doe",
    mc_number: "MC-123456",
    us_dot_number: "USDOT-7890123",
    company_name: "Speedy Logistics Inc.",
    owner_name: "John Smith",
    phone_number: "(555) 123-4567",
    email_address: "contact@speedylogistics.com",
    address: "123 Freight Lane, Logisticsville, CA 90210",
    ein_number: "12-3456789",
    truck_type: "Dry Van",
    status: "active",
    dock_height: "Yes",
    dimensions: dimensions,
    doors_type: "Swing",
    door_clearance: doorClearance,
    accessories: "Liftgate, Pallet Jack",
    max_weight: "45000 lbs",
    temp_control_range: "N/A",
    agreed_percentage: "12",
    insurance_company_name: "Trucking Insurance Co.",
    insurance_company_address: "456 Coverage Blvd, Insuranceville, TX 75001",
    insurance_agent_name: "Mary Johnson",
    insurance_agent_number: "(555) 987-6543",
    insurance_agent_email: "mary@truckinsurance.com",
    factoring_company_name: "Fast Pay Factoring",
    factoring_company_address: "789 Money Lane, Finance City, NY 10001",
    factoring_agent_name: "Bob Williams",
    factoring_agent_number: "(555) 234-5678",
    factoring_agent_email: "bob@fastpayfactoring.com",
    notes_home_town: "Logisticsville, CA",
    notes_days_working: "Monday-Friday",
    notes_preferred_lanes: "East Coast, Midwest",
    notes_additional_preferences: "Prefers long hauls, no Canada routes",
    notes_parking_space: "Ample space for 53&apos; trailer",
    notes_average_gross: "$5,000/week",
    office_use_carrier_no: "C-12345",
    office_use_team_assigned: "Team Alpha",
    office_use_special_notes: "VIP carrier, priority dispatch",
    dat_username: "speedylogistics@dat.com",
    dat_password: "************",
    truckstop_username: "speedylogistics@truckstop.com",
    truckstop_password: "************",
    truckstop_carrier_id: "TS-987654",
    truckstop_carrier_zip: "90210",
    eld_provider: "FleetComplete",
    eld_site: "https://fleetcomplete.com/login",
    eld_username: "speedylogistics@eld.com",
    eld_password: "************",
    mycarrierpackets_username: "speedylogistics@mycarrierpackets.com",
    mycarrierpackets_password: "************",
    created_at: "2023-01-15"
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: mockCarrierData || {
      status: "active",
      mc_number: "",
      company_name: "",
      owner_name: "",
      phone_number: "",
      email_address: "",
      truck_type: "Dry Van",
    },
  });

  // Persist form data across tab changes
  const formData = watch();
  useEffect(() => {
    if (mockCarrierData && !isNew) {
      Object.entries(mockCarrierData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [mockCarrierData, setValue, isNew]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = [
      "mc_number",
      "company_name",
      "owner_name",
      "phone_number",
      "email_address",
      "truck_type",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isNew) {
        await createCarrier(data);
        toast({
          title: "Carrier created",
          description: "New carrier profile has been created successfully.",
        });
      } else {
        await updateCarrier(id, data);
        toast({
          title: "Carrier updated",
          description: "Carrier profile has been updated successfully.",
        });
      }
      router.push("/carrier-management");
    } catch (error) {
      console.error("Error saving carrier:", error);
      toast({
        title: "Error",
        description: "There was an error saving the carrier profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!isNew && mockCarrierData?.created_at && (
        <div className="text-sm text-muted-foreground text-right">
          Created on {new Date(mockCarrierData.created_at).toLocaleDateString()}
        </div>
      )}
      {/* Form Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Details</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="factoring">Factoring</TabsTrigger>
          <TabsTrigger value="notes">Notes & Office Use</TabsTrigger>
          <TabsTrigger value="admin">Admin Only</TabsTrigger>
        </TabsList>

        {/* Basic Information Section */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the carrier&apos;s basic identification and contact
                information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent_name">Agent Name</Label>
                  <Input
                    id="agent_name"
                    defaultValue={mockCarrierData?.agent_name}
                    placeholder="Agent responsible for this carrier"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mc_number">MC Number</Label>
                  <Input
                    id="mc_number"
                    {...register("mc_number", { required: true })}
                    placeholder="MC-XXXXXX"
                    className={errors.mc_number ? "border-red-500" : ""}
                  />
                  {errors.mc_number && (
                    <span className="text-sm text-red-500">
                      MC number is required
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="us_dot_number">US DOT Number</Label>
                  <Input
                    id="us_dot_number"
                    defaultValue={mockCarrierData?.us_dot_number}
                    placeholder="USDOT-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein_number">EIN Number</Label>
                  <Input
                    id="ein_number"
                    defaultValue={mockCarrierData?.ein_number}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    {...register("company_name", { required: true })}
                    placeholder="Carrier company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name</Label>
                  <Input
                    id="owner_name"
                    {...register("owner_name", { required: true })}
                    placeholder="Name of company owner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    {...register("phone_number", { required: true })}
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address</Label>
                  <Input
                    id="email_address"
                    type="email"
                    {...register("email_address", { required: true })}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Textarea
                  id="address"
                  defaultValue={mockCarrierData?.address}
                  placeholder="Full street address, city, state, zip"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreed_percentage">
                  Agreed Commission Percentage
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="agreed_percentage"
                    type="number"
                    defaultValue={mockCarrierData?.agreed_percentage}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="max-w-[100px]"
                  />
                  <span>%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Details Section */}
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
              <CardDescription>
                Specify the carrier&apos;s equipment specifications and
                capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="truck_type">Truck Type</Label>
                  <Select defaultValue={mockCarrierData?.truck_type}>
                    <SelectTrigger id="truck_type">
                      <SelectValue placeholder="Select truck type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Common Types</SelectLabel>
                        <SelectItem value="Dry Van">Dry Van</SelectItem>
                        <SelectItem value="Refrigerated">
                          Refrigerated
                        </SelectItem>
                        <SelectItem value="Flatbed">Flatbed</SelectItem>
                        <SelectItem value="Box Truck">Box Truck</SelectItem>
                        <SelectItem value="Hotshot">Hotshot</SelectItem>
                        <SelectItem value="Step Deck">Step Deck</SelectItem>
                        <SelectItem value="Conestoga">Conestoga</SelectItem>
                        <SelectItem value="Lowboy">Lowboy</SelectItem>
                        <SelectItem value="Power Only">Power Only</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dock_height">Dock Height</Label>
                  <RadioGroup
                    defaultValue={
                      mockCarrierData?.dock_height === "Yes" ? "yes" : "no"
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="dock_height_yes" />
                      <Label htmlFor="dock_height_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="dock_height_no" />
                      <Label htmlFor="dock_height_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    defaultValue={mockCarrierData?.dimensions}
                    placeholder="Length x Width x Height"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doors_type">Door Type</Label>
                  <Select defaultValue={mockCarrierData?.doors_type}>
                    <SelectTrigger id="doors_type">
                      <SelectValue placeholder="Select door type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Roll Up">Roll Up</SelectItem>
                      <SelectItem value="Swing">Swing</SelectItem>
                      <SelectItem value="Side">Side</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="door_clearance">Door Clearance</Label>
                  <Input
                    id="door_clearance"
                    defaultValue={mockCarrierData?.door_clearance}
                    placeholder="Door clearance measurements"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_weight">Maximum Weight Capacity</Label>
                  <Input
                    id="max_weight"
                    defaultValue={mockCarrierData?.max_weight}
                    placeholder="Maximum weight in lbs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temp_control_range">
                    Temperature Control Range
                  </Label>
                  <Input
                    id="temp_control_range"
                    defaultValue={mockCarrierData?.temp_control_range}
                    placeholder="For refrigerated trucks (e.g., -10°F to 60°F)"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accessories">Accessories</Label>
                  <Textarea
                    id="accessories"
                    defaultValue={mockCarrierData?.accessories}
                    placeholder="Liftgate, pallet jack, straps, etc."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Section */}
        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>
                Enter the carrier&apos;s insurance details and coverage
                information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Verify all insurance information is current and validated
                  before dispatch.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insurance_company_name">
                    Insurance Company
                  </Label>
                  <Input
                    id="insurance_company_name"
                    defaultValue={mockCarrierData?.insurance_company_name}
                    placeholder="Name of insurance company"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="insurance_company_address">
                    Insurance Company Address
                  </Label>
                  <Textarea
                    id="insurance_company_address"
                    defaultValue={mockCarrierData?.insurance_company_address}
                    placeholder="Full address of insurance company"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_agent_name">
                    Insurance Agent Name
                  </Label>
                  <Input
                    id="insurance_agent_name"
                    defaultValue={mockCarrierData?.insurance_agent_name}
                    placeholder="Name of insurance agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_agent_number">
                    Insurance Agent Phone
                  </Label>
                  <PhoneInput
                    id="insurance_agent_number"
                    defaultValue={mockCarrierData?.insurance_agent_number}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_agent_email">
                    Insurance Agent Email
                  </Label>
                  <Input
                    id="insurance_agent_email"
                    type="email"
                    defaultValue={mockCarrierData?.insurance_agent_email}
                    placeholder="agent@insurance.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Insurance Documents</Label>
                <div className="mt-2 space-y-4">
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold">
                        Upload carrier documents
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop files or click to browse
                      </p>
                      <Button size="sm" variant="outline">
                        Select Files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-medium">
                      Uploaded Documents
                    </div>

                    {/* Mock uploaded files - would be replaced with actual state */}
                    <div className="rounded-md border border-input bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-md border p-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">
                              Certificate_of_Insurance.pdf
                            </div>
                            <div className="text-sm text-muted-foreground">
                              PDF • 2.4 MB • Uploaded on 12 Apr 2023
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-input bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-md border p-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">W9_Form.pdf</div>
                            <div className="text-sm text-muted-foreground">
                              PDF • 1.1 MB • Uploaded on 12 Apr 2023
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factoring Section */}
        <TabsContent value="factoring">
          <Card>
            <CardHeader>
              <CardTitle>Factoring Information</CardTitle>
              <CardDescription>
                Enter the carrier&apos;s factoring company details if applicable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="uses_factoring"
                  defaultChecked={
                    !!mockCarrierData?.factoring_company_name &&
                    mockCarrierData.factoring_company_name.length > 0
                  }
                />
                <Label htmlFor="uses_factoring">Uses Factoring Company</Label>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="factoring_company_name">
                    Factoring Company
                  </Label>
                  <Input
                    id="factoring_company_name"
                    defaultValue={mockCarrierData?.factoring_company_name}
                    placeholder="Name of factoring company"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="factoring_company_address">
                    Factoring Company Address
                  </Label>
                  <Textarea
                    id="factoring_company_address"
                    defaultValue={mockCarrierData?.factoring_company_address}
                    placeholder="Full address of factoring company"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoring_agent_name">
                    Factoring Agent Name
                  </Label>
                  <Input
                    id="factoring_agent_name"
                    defaultValue={mockCarrierData?.factoring_agent_name}
                    placeholder="Name of factoring agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoring_agent_number">
                    Factoring Agent Phone
                  </Label>
                  <PhoneInput
                    id="factoring_agent_number"
                    defaultValue={mockCarrierData?.factoring_agent_number}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoring_agent_email">
                    Factoring Agent Email
                  </Label>
                  <Input
                    id="factoring_agent_email"
                    type="email"
                    defaultValue={mockCarrierData?.factoring_agent_email}
                    placeholder="agent@factoring.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes & Office Use Section */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Office Use</CardTitle>
              <CardDescription>
                Additional information and preferences for this carrier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="notes_home_town">Home Town</Label>
                  <Input
                    id="notes_home_town"
                    defaultValue={mockCarrierData?.notes_home_town}
                    placeholder="Carrier's home location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes_days_working">Working Days</Label>
                  <Input
                    id="notes_days_working"
                    defaultValue={mockCarrierData?.notes_days_working}
                    placeholder="e.g., Monday-Friday"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes_preferred_lanes">Preferred Lanes</Label>
                  <Input
                    id="notes_preferred_lanes"
                    defaultValue={mockCarrierData?.notes_preferred_lanes}
                    placeholder="Preferred routes or regions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes_average_gross">
                    Average Gross Earnings
                  </Label>
                  <Input
                    id="notes_average_gross"
                    defaultValue={mockCarrierData?.notes_average_gross}
                    placeholder="e.g., $5000/week"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes_additional_preferences">
                    Additional Preferences
                  </Label>
                  <Textarea
                    id="notes_additional_preferences"
                    defaultValue={mockCarrierData?.notes_additional_preferences}
                    placeholder="Special requirements or preferences"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes_parking_space">
                    Parking Information
                  </Label>
                  <Textarea
                    id="notes_parking_space"
                    defaultValue={mockCarrierData?.notes_parking_space}
                    placeholder="Details about parking availability"
                    rows={2}
                  />
                </div>

                <Separator className="md:col-span-2" />

                <div className="space-y-2">
                  <Label htmlFor="office_use_carrier_no">
                    Carrier Number (Office Use)                  </Label>
                  <Input
                    id="office_use_carrier_no"
                    defaultValue={mockCarrierData?.office_use_carrier_no}
                    placeholder="Internal carrier reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office_use_team_assigned">
                    Team Assigned (Office Use)
                  </Label>
                  <Input
                    id="office_use_team_assigned"
                    defaultValue={mockCarrierData?.office_use_team_assigned}
                    placeholder="Internal team assignment"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="office_use_special_notes">
                    Special Notes (Office Use)
                  </Label>
                  <Textarea
                    id="office_use_special_notes"
                    defaultValue={mockCarrierData?.office_use_special_notes}
                    placeholder="Internal notes and special instructions"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Only Section */}
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Only Information</CardTitle>
              <CardDescription>
                Sensitive carrier information accessible only to administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Restricted Access</AlertTitle>
                <AlertDescription>
                  This information is restricted to administrators only. Please
                  do not share these credentials.
                </AlertDescription>
              </Alert>

              {/* DAT Information */}
              <div>
                <h3 className="font-medium text-lg mb-4">DAT Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dat_username">DAT Username / Email</Label>
                    <Input
                      id="dat_username"
                      type="text"
                      defaultValue={mockCarrierData?.dat_username}
                      placeholder="DAT username or email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dat_password">DAT Password</Label>
                    <Input
                      id="dat_password"
                      type="password"
                      defaultValue={mockCarrierData?.dat_password}
                      placeholder="DAT password"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Truckstop Information */}
              <div>
                <h3 className="font-medium text-lg mb-4">
                  Truckstop Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="truckstop_username">
                      Truckstop User / Email
                    </Label>
                    <Input
                      id="truckstop_username"
                      type="text"
                      defaultValue={mockCarrierData?.truckstop_username}
                      placeholder="Truckstop username or email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="truckstop_password">
                      Truckstop Password
                    </Label>
                    <Input
                      id="truckstop_password"
                      type="password"
                      defaultValue={mockCarrierData?.truckstop_password}
                      placeholder="Truckstop password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="truckstop_carrier_id">
                      Truckstop / RMIS Carrier ID
                    </Label>
                    <Input
                      id="truckstop_carrier_id"
                      type="text"
                      defaultValue={mockCarrierData?.truckstop_carrier_id}
                      placeholder="Carrier ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="truckstop_carrier_zip">
                      Truckstop / RMIS Carrier Zip
                    </Label>
                    <Input
                      id="truckstop_carrier_zip"
                      type="text"
                      defaultValue={mockCarrierData?.truckstop_carrier_zip}
                      placeholder="Carrier ZIP code"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ELD Information */}
              <div>
                <h3 className="font-medium text-lg mb-4">ELD Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="eld_provider">ELD Provider</Label>
                    <Input
                      id="eld_provider"
                      type="text"
                      defaultValue={mockCarrierData?.eld_provider}
                      placeholder="Name of ELD provider"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eld_site">ELD Site</Label>
                    <Input
                      id="eld_site"
                      type="text"
                      defaultValue={mockCarrierData?.eld_site}
                      placeholder="ELD website URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eld_username">ELD Username / Email</Label>
                    <Input
                      id="eld_username"
                      type="text"
                      defaultValue={mockCarrierData?.eld_username}
                      placeholder="ELD username or email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eld_password">ELD Password</Label>
                    <Input
                      id="eld_password"
                      type="password"
                      defaultValue={mockCarrierData?.eld_password}
                      placeholder="ELD password"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* My Carrier Packets Information */}
              <div>
                <h3 className="font-medium text-lg mb-4">
                  My Carrier Packets Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mycarrierpackets_username">
                      MyCarrierPackets Username / Email
                    </Label>
                    <Input
                      id="mycarrierpackets_username"
                      type="text"
                      defaultValue={mockCarrierData?.mycarrierpackets_username}
                      placeholder="MyCarrierPackets username or email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mycarrierpackets_password">
                      MyCarrierPackets Password
                    </Label>
                    <Input
                      id="mycarrierpackets_password"
                      type="password"
                      defaultValue={mockCarrierData?.mycarrierpackets_password}
                      placeholder="MyCarrierPackets password"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/carrier-management")}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting
            ? "Saving..."
            : isNew
              ? "Create Carrier"
              : "Update Carrier"}
        </Button>
      </div>
    </form>
  );
};

export default CarrierProfileForm;