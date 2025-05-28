"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dispatch } from "@/lib/dispatch-api";
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
  Mail,
  Save,
  Check,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { invoiceAPI, Invoice } from "@/lib/invoice-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DispatchInvoiceViewProps {
  dispatch: Dispatch;
}

export function DispatchInvoiceView({ dispatch }: DispatchInvoiceViewProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: dispatch.carrier?.email_address || '',
    subject: '',
    message: ''
  });
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calculate amounts
  const totalAmount = dispatch.load_amount;
  const carrierPercentage = dispatch.charge_percent;
  const carrierAmount = (totalAmount * carrierPercentage) / 100;
  const profit = totalAmount - carrierAmount;

  // Generate invoice details
  const invoiceNumber = `INV-${dispatch.load_no}-${format(new Date(), "yyyyMMdd")}`;
  const invoiceDate = format(new Date(), "MMM dd, yyyy");
  const dueDate = format(
    new Date(new Date().setDate(new Date().getDate() + 30)),
    "MMM dd, yyyy"
  );

  // Load existing invoice for this dispatch
  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const existingInvoice = await invoiceAPI.getInvoiceByDispatchId(dispatch.id);
        setInvoice(existingInvoice);
        setEmailData(prev => ({
          ...prev,
          subject: `Invoice ${existingInvoice.invoice_number} - ${dispatch.carrier?.company_name}`,
          message: `Dear ${dispatch.carrier?.company_name},\n\nPlease find attached your invoice for load ${dispatch.load_no}.\n\nInvoice Details:\n- Invoice Number: ${existingInvoice.invoice_number}\n- Amount: $${existingInvoice.total_amount}\n- Due Date: ${format(new Date(existingInvoice.due_date), "MMM dd, yyyy")}\n\nThank you for your business.\n\nBest regards,\nHaul Connect Logistics`
        }));
      } catch (error) {
        // Invoice doesn't exist yet, which is fine
        setEmailData(prev => ({
          ...prev,
          subject: `Invoice ${invoiceNumber} - ${dispatch.carrier?.company_name}`,
          message: `Dear ${dispatch.carrier?.company_name},\n\nPlease find attached your invoice for load ${dispatch.load_no}.\n\nInvoice Details:\n- Invoice Number: ${invoiceNumber}\n- Amount: $${totalAmount}\n- Due Date: ${dueDate}\n\nThank you for your business.\n\nBest regards,\nHaul Connect Logistics`
        }));
      }
    };

    loadInvoice();
  }, [dispatch.id, invoiceNumber, totalAmount, dueDate, dispatch.carrier?.company_name, dispatch.load_no]);
  const formatDate = (dateValue: string | Date) => {
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, "MMM dd, yyyy");
    } catch {
      return typeof dateValue === 'string' ? dateValue : dateValue.toString();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoice = async () => {
    setIsSavingInvoice(true);
    try {
      if (invoice) {
        // Update existing invoice
        await invoiceAPI.updateInvoice(invoice.id, {
          total_amount: totalAmount,
          carrier_amount: carrierAmount,
          profit_amount: profit,
          status: 'draft'
        });
        toast({
          title: "Invoice Updated",
          description: "Invoice has been updated successfully.",
        });
      } else {
        // Create new invoice
        const newInvoice = await invoiceAPI.createInvoice({
          dispatch_id: dispatch.id,
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          carrier_amount: carrierAmount,
          profit_amount: profit,
          carrier_percentage: carrierPercentage,
          invoice_date: new Date().toISOString(),
          due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
          status: 'draft',
          carrierInfo: {
            name: dispatch.carrier?.company_name || '',
            email: dispatch.carrier?.email_address || '',
            phone: dispatch.carrier?.phone_number || '',
            mcNumber: dispatch.carrier?.mc_number || ''
          },          serviceDetails: {
            pickupDate: typeof dispatch.pickup_date === 'string' ? dispatch.pickup_date : dispatch.pickup_date.toISOString(),
            deliveryDate: typeof dispatch.dropoff_date === 'string' ? dispatch.dropoff_date : dispatch.dropoff_date.toISOString(),
            pickupLocation: dispatch.origin,
            deliveryLocation: dispatch.destination,
            loadNumber: dispatch.load_no,
            bolNumber: dispatch.load_no // Using load_no as BOL if BOL doesn't exist
          }
        });
        setInvoice(newInvoice);
        toast({
          title: "Invoice Created",
          description: "Invoice has been created and saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Save invoice first if it doesn't exist
      if (!invoice) {
        await handleSaveInvoice();
      }

      await invoiceAPI.sendInvoiceEmail({
        invoiceId: invoice?.id || 0,
        recipientEmail: emailData.recipientEmail,
        subject: emailData.subject,
        message: emailData.message
      });

      // Update invoice status to sent
      if (invoice) {
        await invoiceAPI.updateInvoice(invoice.id, { status: 'sent' });
        setInvoice(prev => prev ? { ...prev, status: 'sent' } : null);
      }

      toast({
        title: "Email Sent Successfully",
        description: `Invoice has been sent to ${emailData.recipientEmail}`,
      });
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPdf(true);

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your invoice...",
      });

      // Save invoice first if it doesn't exist
      if (!invoice) {
        await handleSaveInvoice();
      }

      // Try to use backend PDF generation first
      if (invoice?.id) {
        try {
          const pdfBlob = await invoiceAPI.downloadInvoicePDF(invoice.id);
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Invoice-${dispatch.load_no}-${format(new Date(), "yyyyMMdd")}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast({
            title: "PDF Downloaded Successfully",
            description: `Invoice for ${dispatch.carrier?.company_name || 'Carrier'} (${dispatch.load_no}) has been saved.`,
          });
          return;
        } catch (backendError) {
          console.warn("Backend PDF generation failed, falling back to frontend generation:", backendError);
        }
      }

      // Fallback to frontend PDF generation
      const element = invoiceRef.current;
      const originalStyles = {
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        position: element.style.position,
        background: element.style.background,
      };

      element.style.width = "1200px";
      element.style.height = "auto";
      element.style.overflow = "visible";
      element.style.position = "relative";
      element.style.background = "white";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      Object.assign(element.style, originalStyles);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const aspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * aspectRatio;

      if (contentHeight > pageHeight - margin * 2) {
        const scaleFactor = (pageHeight - margin * 2) / contentHeight;
        const scaledWidth = contentWidth * scaleFactor;
        const scaledHeight = contentHeight * scaleFactor;
        const xOffset = margin + (contentWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "PNG", xOffset, margin, scaledWidth, scaledHeight);
      } else {
        const yOffset = margin + (pageHeight - margin * 2 - contentHeight) / 2;
        pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, contentHeight);
      }

      const today = new Date();
      const formattedDate = format(today, "yyyyMMdd");
      const fileName = `Invoice-${dispatch.load_no}-${formattedDate}.pdf`;

      pdf.save(fileName);

      toast({
        title: "PDF Downloaded Successfully",
        description: `Invoice for ${dispatch.carrier?.company_name || 'Carrier'} (${dispatch.load_no}) has been saved.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveInvoice}
            disabled={isSavingInvoice}
            variant="outline"
            className="hover:bg-slate-100 transition-colors"
          >
            {isSavingInvoice ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {invoice ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {invoice ? 'Update Invoice' : 'Save Invoice'}
              </>
            )}
          </Button>
          
          {invoice && (
            <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
              {invoice.status.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-slate-100 transition-colors"
                disabled={!dispatch.carrier?.email_address && !emailData.recipientEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send Invoice via Email</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailData.recipientEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="Enter recipient email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={emailData.message}
                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={isSendingEmail}>
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
      </div>

      {/* Invoice Document */}
      <Card className="max-w-4xl mx-auto bg-white print:shadow-none print:border-none overflow-hidden">
        <div className="invoice-container" style={{
      color: "#0f172a", // Explicit dark color for all text
      backgroundColor: "white"
    }}  ref={invoiceRef}>
          {/* Header */}
          <div className="bg-primary/5 border-b">
            <div className="px-8 py-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="bg-[antiquewhite] p-3 rounded-xl">
                    <div className="text-slate-900 font-bold text-xl">HC</div>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">HAUL CONNECT</div>
                  <div className="text-sm text-gray-500">LOGISTICS LLC</div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">INVOICE</div>
                <div className="text-slate-800 font-medium">{invoiceNumber}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Status and Dates */}
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-slate-800" />
                  <span className="text-sm font-medium text-gray-500">ISSUE DATE</span>
                </div>
                <div className="text-lg font-medium">{invoiceDate}</div>
              </div>
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-slate-800" />
                  <span className="text-sm font-medium text-gray-500">DUE DATE</span>
                </div>
                <div className="text-lg font-medium">{dueDate}</div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Clipboard className="h-4 w-4 mr-2 text-slate-800" />
                  <span className="text-sm font-medium text-gray-500">STATUS</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    invoice?.status === 'sent' 
                      ? "bg-green-50 text-green-600 hover:bg-green-50 border-green-200"
                      : invoice?.status === 'paid'
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-200"
                  }
                >
                  {invoice?.status ? invoice.status.toUpperCase() : dispatch.status}
                </Badge>
              </div>
            </div>

            {/* Client and Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Carrier Info */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="text-sm font-medium uppercase text-slate-800 mb-4">
                  Carrier Information
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Truck className="h-4 w-4 mt-1 mr-2 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800">
                        {dispatch.carrier?.company_name || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-500">
                        MC#: {dispatch.carrier?.mc_number || 'N/A'}
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
                      {dispatch.carrier?.phone_number || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <div className="text-sm font-medium uppercase text-slate-800 mb-4">
                  Customer Information
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-bold text-slate-800">
                      HAUL CONNECT CUSTOMER
                    </div>
                    <div className="text-sm text-slate-600">
                      Customer Address Line
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 flex justify-center">📞</div>
                    <div className="text-sm text-slate-600">Customer Phone</div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 flex justify-center">✉️</div>
                    <div className="text-sm text-slate-600">customer@email.com</div>
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
                  <div className="text-xs text-slate-500 uppercase font-medium">Origin</div>
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
                  <div className="text-xs text-slate-500 uppercase font-medium">Destination</div>
                  <div className="font-medium">{dispatch.destination}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Service Details Table */}
            <div className="mb-8">
              <div className="text-lg font-semibold text-slate-800 mb-4">Service Details</div>
              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Pickup Date</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Delivery Date</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Load Number</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium">{formatDate(dispatch.pickup_date)}</div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium">{formatDate(dispatch.dropoff_date)}</div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <Badge variant="secondary" className="font-normal">
                            {dispatch.load_no}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div>
                            Freight transportation services from {dispatch.origin} to {dispatch.destination}
                          </div>
                          <div className="text-sm font-medium text-slate-800 mt-1">
                            BOL #: {dispatch.load_no}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top text-right">
                          <div className="font-medium">{formatCurrency(totalAmount)}</div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={4} className="py-3 px-4 text-sm font-medium text-slate-500">
                          Subtotal
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={4} className="py-3 px-4 text-sm font-medium text-slate-500">
                          Carrier Payment ({carrierPercentage}%)
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          -{formatCurrency(carrierAmount)}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td colSpan={4} className="py-3 px-4 text-base font-bold text-slate-800">
                          Net Profit
                        </td>
                        <td className="py-3 px-4 text-right text-base font-bold text-slate-800">
                          {formatCurrency(profit)}
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
                  <CreditCard className="h-5 w-5 mr-2 text-slate-800" />
                  <div className="text-base font-semibold text-slate-800">Payment Method</div>
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-24 text-sm font-medium text-slate-500">Zelle:</div>
                    <div className="text-sm">info@haulconnectlogistics.com</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-sm font-medium text-slate-500">Email:</div>
                    <div className="text-sm">haulconnect@gmail.com</div>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-xs text-slate-500">
                    Please include invoice number {invoiceNumber} as reference when making payment
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
                    If you have any questions concerning this invoice, please contact our billing 
                    department at haulconnect@gmail.com.
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
