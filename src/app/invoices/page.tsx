"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/dashboard-layout"; // Import DashboardLayout
import { getAllInvoices, Invoice } from "@/lib/invoices-data"; // Import getAllInvoices and Invoice type

const InvoicesPage = () => {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [_loading, setLoading] = useState(false);

  // Placeholder function to fetch invoice data
  const fetchInvoices = async () => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      const allInvoices = getAllInvoices();
      setInvoices(allInvoices);
      setLoading(false);
    }, 1000); // Simulate network delay
  };

  // Placeholder action handlers
  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/dispatch-management/${invoiceId}/invoice`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/dispatch-management/${invoiceId}/edit`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    console.log(`Delete invoice with ID: ${invoiceId}`);
    const confirmed = confirm(`Are you sure you want to delete invoice ${invoiceId}?`);

    if (confirmed) {
      // Placeholder for API call to delete the invoice
      console.log(`Deleting invoice with ID: ${invoiceId}`);
      // In a real application, you would make an API call here
      // e.g., axios.delete(`/api/invoices/${invoiceId}`)
      // After successful deletion, you would typically refetch the invoice list
      // or remove the deleted invoice from the state
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSendInvoice = (invoiceId: string) => {
    console.log(`Send invoice with ID: ${invoiceId}`);
  };

  return (
    <DashboardLayout> {/* Wrap with DashboardLayout */}
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Invoices</h1>

        <DataTable columns={columns} data={invoices} />

      </div>
    </DashboardLayout>
  );
};

export default InvoicesPage;