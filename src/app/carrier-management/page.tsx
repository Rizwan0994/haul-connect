
"use client";

import React from "react";
import { columns, Carrier } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAllCarriers } from "@/lib/carriers-data";
import UserAssignmentProvider from "@/components/carrier-management/user-assignment-provider";

async function getData(): Promise<Carrier[]> {
  try {
    const allCarriers = await getAllCarriers();
    if (!allCarriers) return [];

    return allCarriers.map((carrier) => ({
      id: carrier.id,
      mc_number: carrier.mc_number,
      company_name: carrier.company_name,
      owner_name: carrier.owner_name,
      phone_number: carrier.phone_number,
      email_address: carrier.email_address,
      truck_type: carrier.truck_type,
      status:
        carrier.status === "active"
          ? "Active"
          : carrier.status === "pending"
          ? "Temporary"
          : carrier.status === "suspended"
          ? "Blacklist"
          : "Active",
      created_at: carrier.created_at,
    }));
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return [];
  }
}

export default async function CarrierManagementPage() {
  const data = await getData();

  return (
    <UserAssignmentProvider>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Carrier Management
          </h1>
          <p className="text-muted-foreground">
            Manage your carrier profiles and information
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-end mb-6 gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/carrier-management/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Carrier
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-md border">
          <DataTable
            columns={columns}
            data={data}
            filterableColumns={[
              "company_name",
              "mc_number",
              "status",
              "truck_type",
            ]}
          />
        </div>
      </div>
    </UserAssignmentProvider>
  );
}
