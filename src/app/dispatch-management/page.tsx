import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import {
  Plus,
  FileText,
  TrendingUp,
  Truck,
  DollarSign,
  Users,
  ChevronRight,
} from "lucide-react";
import { getAllDispatches, type Dispatch } from "@/lib/dispatch-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getData() {
  const cookieStore = await cookies(); // Await this
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const allDispatches = await getAllDispatches(cookieHeader); // Also await this if it's a Promise
  return allDispatches;
}

export default async function DispatchManagementPage() {
  const data = await getData();

  // Calculate some stats for the overview cards
  const scheduledCount = data.filter((d: Dispatch) => d.status === "Scheduled").length;
  const inTransitCount = data.filter((d: Dispatch) => d.status === "In Transit").length;
  const deliveredCount = data.filter((d: Dispatch) => d.status === "Delivered").length;
  const confirmedSalesCount = deliveredCount; // For now, assuming all delivered are confirmed sales
  const confirmedDispatchCount = deliveredCount; // Same for dispatches

  // Calculate financial metrics
  const totalLoadAmount = data
    .filter((d) => d.status === "Delivered")
    .reduce((total, d) => total + d.load_amount, 0);

  const totalCommission = data
    .filter((d) => d.status === "Delivered")
    .reduce((total, d) => total + d.load_amount * (d.charge_percent / 100), 0);

  // For demonstration purposes - in a real app these would come from user records
  const topDispatchers = [
    { name: "Jane Wilson", count: 28, amount: 3750 },
    { name: "Alex Rodriguez", count: 22, amount: 2880 },
    { name: "David Miller", count: 19, amount: 2100 },
  ];

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Dispatch Management
        </h1>
        <p className="text-muted-foreground">
          Manage dispatches, track confirmed sales and commissions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{scheduledCount}</div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <FileText className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming loads ready for dispatch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inTransitCount}</div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Truck className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Loads currently being transported
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Sales & Dispatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{confirmedSalesCount}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 justify-center"
              >
                {confirmedSalesCount} Sales
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 justify-center"
              >
                {confirmedDispatchCount} Dispatch
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${totalCommission.toFixed(2)}
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-700" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From ${totalLoadAmount.toFixed(2)} in delivered loads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commission Distribution</CardTitle>
            <CardDescription>
              Breakdown of commissions between sales and dispatch departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      Sales
                    </Badge>
                    <span className="text-sm">
                      Commission on first bookings
                    </span>
                  </div>
                  <span className="font-medium">
                    ${(totalCommission * 0.4).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: "40%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Dispatch
                    </Badge>
                    <span className="text-sm">Commission on all loads</span>
                  </div>
                  <span className="font-medium">
                    ${(totalCommission * 0.6).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex justify-between items-center w-full text-sm">
              <span className="text-muted-foreground">Total Commission:</span>
              <span className="font-bold">${totalCommission.toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Dispatchers</CardTitle>
            <CardDescription>
              Best performing dispatchers by load count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDispatchers.map((dispatcher, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-full ${
                        index === 0
                          ? "bg-yellow-100"
                          : index === 1
                            ? "bg-gray-100"
                            : "bg-amber-50"
                      }`}
                    >
                      <Users
                        className={`h-4 w-4 ${
                          index === 0
                            ? "text-yellow-700"
                            : index === 1
                              ? "text-gray-600"
                              : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{dispatcher.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dispatcher.count} loads · ${dispatcher.amount}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-end mb-6 gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link href="/dispatch-management/new">
            <Button aria-label="Create new dispatch">
              <Plus className="h-4 w-4 mr-2" />
              Create Dispatch
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Dispatches</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed Sales</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data}
            filterableColumns={[
              "carrier",
              "load_no",
              "status",
              "invoice_status",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.filter((d) => d.status === "Scheduled")}
            filterableColumns={[
              "carrier",
              "load_no",
              "invoice_status",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>

        <TabsContent value="in-transit" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.filter((d) => d.status === "In Transit")}
            filterableColumns={[
              "carrier",
              "load_no",
              "invoice_status",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>

        <TabsContent value="delivered" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.filter((d) => d.status === "Delivered")}
            filterableColumns={[
              "carrier",
              "load_no",
              "invoice_status",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.filter(
              (d) =>
                d.status === "Delivered" &&
                d.invoice_status === "Invoice Cleared",
            )}
            filterableColumns={[
              "carrier",
              "load_no",
              "dispatcher",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.filter((d) => d.status === "Cancelled")}
            filterableColumns={[
              "carrier",
              "load_no",
              "invoice_status",
              "origin",
              "destination",
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
