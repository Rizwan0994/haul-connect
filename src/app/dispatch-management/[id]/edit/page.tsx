import React from "react";
import { notFound } from "next/navigation";
import { getDispatchById } from "@/lib/dispatch-data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DispatchEditForm } from "@/components/dispatch-management/dispatch-edit-form";

interface EditDispatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDispatchPage({
  params,
}: EditDispatchPageProps) {
  // In a real application, this would be an API call
  // TODO: Replace with actual API call
  const { id } = await params;
  const dispatch = getDispatchById(id);

  if (!dispatch) {
    return notFound();
  }

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
          <BreadcrumbLink href={`/dispatch-management/${id}`}>
            Dispatch Details
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Edit Dispatch</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Dispatch: {dispatch.load_no}
        </h1>
        <p className="text-muted-foreground">
          Update the details of the dispatch
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <DispatchEditForm dispatch={dispatch} id={id} />
      </div>
    </div>
  );
}
