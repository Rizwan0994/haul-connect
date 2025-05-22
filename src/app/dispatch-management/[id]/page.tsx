import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pencil,
  ArrowLeft,
  Clock,
  Truck,
  MapPin,
  DollarSign,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDispatchById } from "@/lib/dispatch-data";
import { format } from "date-fns";

interface DispatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function DispatchPage({ params }: DispatchPageProps) {
  // In a real application, this would be an API call
  // TODO: Replace with actual API call
  const { id } = await params;
  const dispatch = getDispatchById(id);

  if (!dispatch) {
    return notFound();
  }

  const statusColor = {
    Delivered: "bg-green-100 text-green-800 border-green-200",
    "In Transit": "bg-blue-100 text-blue-800 border-blue-200",
    Scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const invoiceStatusColor = {
    "Invoice Cleared": "bg-green-100 text-green-800 border-green-200",
    "Invoice Pending": "bg-purple-100 text-purple-800 border-purple-200",
    "Invoice Sent": "bg-blue-100 text-blue-800 border-blue-200",
    "Not Sent": "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="container py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dispatch-management">
            Dispatch Management
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Dispatch Details</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dispatch: {dispatch.load_no}
          </h1>
          <p className="text-muted-foreground">
            Created on {format(new Date(dispatch.created_at), "MMM dd, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dispatch-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
          <Link href={`/dispatch-management/${id}/invoice`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
          </Link>
          <Link href={`/dispatch-management/${id}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Dispatch
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={
                  statusColor[dispatch.status as keyof typeof statusColor]
                }
              >
                {dispatch.status}
              </Badge>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Load Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                ${dispatch.load_amount.toLocaleString()}
              </p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Invoice Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={
                  invoiceStatusColor[
                    dispatch.invoice_status as keyof typeof invoiceStatusColor
                  ]
                }
              >
                {dispatch.invoice_status}
              </Badge>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Dispatch Details</TabsTrigger>
          <TabsTrigger value="carrier">Carrier Information</TabsTrigger>
          <TabsTrigger value="broker">Broker Information</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Load Number
                  </p>
                  <p>{dispatch.load_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Booking Date
                  </p>
                  <p>
                    {format(new Date(dispatch.booking_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p>{dispatch.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    User
                  </p>
                  <p>{dispatch.user}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dispatcher
                  </p>
                  <p>{dispatch.dispatcher}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </p>
                  <p>{dispatch.payment_method}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Origin
                  </p>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{dispatch.origin}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Destination
                  </p>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{dispatch.destination}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pickup Date
                  </p>
                  <p>
                    {format(new Date(dispatch.pickup_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dropoff Date
                  </p>
                  <p>
                    {format(new Date(dispatch.dropoff_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Load Amount
                  </p>
                  <p>${dispatch.load_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Charge Percentage
                  </p>
                  <p>{dispatch.charge_percent}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </p>
                  <p>{dispatch.payment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Invoice Status
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      invoiceStatusColor[
                        dispatch.invoice_status as keyof typeof invoiceStatusColor
                      ]
                    }
                  >
                    {dispatch.invoice_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carrier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Carrier Name
                  </p>
                  <div className="flex items-center mt-1">
                    <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{dispatch.carrier}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contract Status
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    Active
                  </Badge>
                </div>
              </div>

              {/* Additional carrier information would be displayed here */}
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Note: Additional carrier details would be shown here, linked
                  from the Carrier Management module.
                </p>
              </div>

              <Button asChild className="mt-4" variant="outline">
                <Link href={`/carrier-management/${dispatch.carrier}`}>
                  View Full Carrier Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Brokerage Company
                  </p>
                  <p>{dispatch.brokerage_company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Brokerage Agent
                  </p>
                  <p>{dispatch.brokerage_agent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Agent Phone
                  </p>
                  <p>{dispatch.agent_ph}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Agent Email
                  </p>
                  <a
                    href={`mailto:${dispatch.agent_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {dispatch.agent_email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
