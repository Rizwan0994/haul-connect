
"use client";

import { Metadata } from "next";
import { use } from "react";
import CarrierProfileForm from "@/components/carrier-management/carrier-profile-form";

export default function EditCarrierPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Carrier Profile</h1>
        <p className="text-muted-foreground">Update carrier information and preferences</p>
      </div>
      <CarrierProfileForm isNew={false} id={resolvedParams.id} />
    </div>
  );
}
