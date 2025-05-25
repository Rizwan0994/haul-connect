"use client";

import React, { useState, useRef } from "react";
import { Dispatch } from "@/lib/dispatch-data";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Printer,
  Loader2,
  Truck,
  MapPin,
  Clipboard,
  Calendar,
  CreditCard,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface InvoiceViewProps {
  dispatch: Dispatch;
}

export function InvoiceView({ dispatch }: InvoiceViewProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPdf(true);

    try {
      // Notify user that generation has started
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your invoice...",
      });

      // Get the invoice element
      const element = invoiceRef.current;

      // Store original styles to restore later
      const originalStyles = {
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        position: element.style.position,
        background: element.style.background,
      };

      // Optimize element for capture
      element.style.width = "1200px";
      element.style.height = "auto";
      element.style.overflow = "visible";
      element.style.position = "relative";
      element.style.background = "white";

      // Create canvas with improved settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          // Add print styles to ensure all elements render correctly
          const styles = clonedDoc.createElement("style");
          styles.innerHTML = `
            * { 
              print-color-adjust: exact !important; 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-primary, .bg-blue-600, .bg-slate-800 { 
              display: block !important; 
              visibility: visible !important;
            }
            table { 
              border-collapse: collapse !important; 
              width: 100% !important;
            }
            td, th { 
              padding: 12px !important;
            }
          `;
          clonedDoc.head.appendChild(styles);
        },
      });

      // Restore original styles
      Object.assign(element.style, originalStyles);

      // Get high-quality image data
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Set up PDF document (A4)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // A4 dimensions
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      // Calculate height maintaining aspect ratio
      const aspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * aspectRatio;

      // Handle multi-page if needed
      if (contentHeight > pageHeight - margin * 2) {
        // If content is too tall, we'll scale it to fit
        const scaleFactor = (pageHeight - margin * 2) / contentHeight;
        const scaledWidth = contentWidth * scaleFactor;
        const scaledHeight = contentHeight * scaleFactor;

        // Center on page
        const xOffset = margin + (contentWidth - scaledWidth) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          xOffset,
          margin,
          scaledWidth,
          scaledHeight
        );
      } else {
        // Center content vertically if there's room
        const yOffset = margin + (pageHeight - margin * 2 - contentHeight) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          yOffset,
          contentWidth,
          contentHeight
        );
      }

      // Generate a meaningful filename
      const today = new Date();
      const formattedDate = format(today, "yyyyMMdd");
      const fileName = `Invoice-${dispatch.load_no}-${formattedDate}.pdf`;

      // Save PDF
      pdf.save(fileName);

      // Success notification
      toast({
        title: "PDF Downloaded Successfully",
        description: `Invoice for ${dispatch.carrier} (${dispatch.load_no}) has been saved.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Detailed error notification
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Calculate the total
  const subtotal = dispatch.load_amount;
  const rate = dispatch.charge_percent || 7; // Default to 7% if not specified
  const rateAmount = (subtotal * rate) / 100;
  const _total = subtotal + rateAmount;

  // Generate a professional invoice number based on load number and date
  const invoiceNumber = `INV-${dispatch.load_no}-${format(
    new Date(),
    "yyyyMMdd"
  )}`;

  // Format dates for the invoice
  const invoiceDate = format(new Date(), "MMM dd, yyyy");
  const dueDate = format(
    new Date(new Date().setDate(new Date().getDate() + 30)),
    "MMM dd, yyyy"
  );

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="hover:bg-slate-100 transition-colors"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="bg-primary hover:bg-primary/90 transition-colors"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Invoice Document */}
      <Card className="max-w-4xl mx-auto bg-white print:shadow-none print:border-none overflow-hidden">
        <div className="invoice-container" ref={invoiceRef}>
          {/* Header */}
          <div className="bg-primary/5 border-b">
            <div className="px-8 py-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="bg-primary p-3 rounded-xl">
                    <div className="text-white font-bold text-xl">HC</div>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    HAUL CONNECT
                  </div>
                  <div className="text-sm text-gray-500">LOGISTICS LLC</div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">INVOICE</div>
                <div className="text-primary font-medium">{invoiceNumber}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Status and Dates */}
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium text-gray-500">
                    ISSUE DATE
                  </span>
                </div>
                <div className="text-lg font-medium">{invoiceDate}</div>
              </div>
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium text-gray-500">
                    DUE DATE
                  </span>
                </div>
                <div className="text-lg font-medium">{dueDate}</div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Clipboard className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium text-gray-500">
                    STATUS
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-200"
                >
                  {dispatch.invoice_status}
                </Badge>
              </div>
            </div>

            {/* Client and Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Client Info */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="text-sm font-medium uppercase text-primary mb-4">
                  Carrier Information
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Truck className="h-4 w-4 mt-1 mr-2 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800">
                        {/* {dispatch.carrier} */}
                        {dispatch.carrier?.owner_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        MC#: {dispatch.load_no.slice(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mt-1 mr-2 text-slate-400" />
                    <div className="text-sm text-slate-600">
                      {dispatch.origin}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 flex justify-center">📞</div>
                    <div className="text-sm text-slate-600">
                      {dispatch.agent_ph}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <div className="text-sm font-medium uppercase text-primary mb-4">
                  Customer Information
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-bold text-slate-800">
                      {dispatch.brokerage_company || "TERRY FISHER GROUP"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {dispatch.brokerage_agent ||
                        "T TRANS TRANSPORTATION LLC DBA RIVERSIDE RD"}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 flex justify-center">📞</div>
                    <div className="text-sm text-slate-600">
                      {dispatch.agent_ph}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Details */}
            <div className="mb-8 bg-slate-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <div className="text-xs text-slate-500 uppercase font-medium">
                    Origin
                  </div>
                  <div className="font-medium">{dispatch.origin}</div>
                </div>
              </div>

              <div className="flex-1 mx-4 flex justify-center">
                <div className="w-full max-w-[100px] h-0.5 bg-primary relative">
                  <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-primary"></div>
                  <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 text-right">
                  <div className="text-xs text-slate-500 uppercase font-medium">
                    Destination
                  </div>
                  <div className="font-medium">{dispatch.destination}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-8">
              <div className="text-lg font-semibold text-slate-800 mb-4">
                Service Details
              </div>
              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Pickup Date
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Drop Date
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Type
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Description
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium">
                            {formatDate(dispatch.pickup_date)}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium">
                            {formatDate(dispatch.dropoff_date)}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <Badge variant="secondary" className="font-normal">
                            {dispatch.department || "JLT"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div>
                            {`Hauling a Full loaded OTR HAUL freight from/to ${dispatch.origin} / ${dispatch.destination}`}
                          </div>
                          <div className="text-sm font-medium text-primary mt-1">
                            Load #: {dispatch.load_no} Refrigerated
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top text-right">
                          <div className="font-medium">
                            {/* ${subtotal?.toFixed(2)||20} */} $20
                          </div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={3} className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-500">
                          Subtotal
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {/* ${subtotal.toFixed(2)} */} $20
                        </td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={3} className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-500">
                          Service Charge ({rate}%)
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ${rateAmount.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={3} className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-base font-bold text-slate-800">
                          Total
                        </td>
                        <td className="py-3 px-4 text-right text-base font-bold text-primary">
                          {/* ${total.toFixed(2)} */} $20
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  <div className="text-base font-semibold text-slate-800">
                    Payment Method
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-24 text-sm font-medium text-slate-500">
                      Zelle:
                    </div>
                    <div className="text-sm">info@haulconnectlogistics.com</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-sm font-medium text-slate-500">
                      Email:
                    </div>
                    <div className="text-sm">haulconnect@gmail.com</div>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-xs text-slate-500">
                    Please include invoice number {invoiceNumber} as reference
                    when making payment
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="text-base font-semibold text-slate-800 mb-4">
                  Thank You for Your Business
                </div>
                <div className="text-sm text-slate-600">
                  <p className="mb-2">
                    We appreciate your prompt payment within 30 days of receipt.
                  </p>
                  <p>
                    If you have any questions concerning this invoice, please
                    contact our billing department at haulconnect@gmail.com.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center">
              <div className="text-xs text-slate-500">
                HAUL CONNECT LOGISTICS LLC | www.haulconnectlogistics.com
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}