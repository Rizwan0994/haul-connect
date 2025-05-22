"use client";

import React, { useEffect, useState } from "react";
import { columns, Carrier } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAllCarriers } from "@/lib/carriers-data";
import UserAssignmentProvider from "@/components/carrier-management/user-assignment-provider";

export default function CarrierManagementPage() {
  const [data, setData] = useState<Carrier[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carriers = await getAllCarriers();
        setData(carriers || []);
      } catch (error) {
        console.error('Error fetching carriers:', error);
        setData([]);
      }
    };

    fetchData();
  }, []);

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