import React from "react";
import { DispatchCreateForm } from "@/components/dispatch-management/dispatch-create-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

export default function CreateDispatchPage() {
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
          <BreadcrumbLink>Create Dispatch</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Dispatch
        </h1>
        <p className="text-muted-foreground mb-2">
          Create a new dispatch record to track and manage carrier loads,
          payments, and commissions
        </p>

        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-4">
            <CardDescription className="text-blue-800 font-medium">
              <span className="block mb-2">Sales and Dispatch Workflow</span>
              <ol className="list-decimal ml-5 text-sm space-y-1">
                <li>
                  Sales person contacts carrier/driver and agrees on commission
                  percentage
                </li>
                <li>Carrier profile is created and assigned to a dispatcher</li>
                <li>Support books loads for the carrier</li>
                <li>Carrier delivers loads and pays agreed invoice amount</li>
                <li>
                  Sales gets commission on first load; dispatch on all loads
                </li>
              </ol>
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <DispatchCreateForm />
      </div>
    </div>
  );
}
