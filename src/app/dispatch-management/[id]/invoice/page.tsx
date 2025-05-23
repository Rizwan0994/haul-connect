import React from "react";
import { notFound } from "next/navigation";
import { getDispatchById } from "@/lib/dispatch-data";
import { InvoiceView } from "@/components/invoice/invoice-view";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cookies } from "next/headers";
interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
   const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const dispatch = await getDispatchById(id, cookieHeader);

  if (!dispatch) {
    return notFound();
  }

  return (
    <div className="container py-6">
      <div className="print:hidden">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dispatch-management">
              Dispatch Management
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dispatch-management/${id}`}>
              Dispatch {dispatch.load_no}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Invoice</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Invoice for {dispatch.load_no}
          </h1>
          <p className="text-muted-foreground">
            {dispatch.origin} to {dispatch.destination} | {dispatch.carrier}
          </p>
        </div>
      </div>

      <InvoiceView dispatch={dispatch} />
    </div>
  );
}
