import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { invoiceAPI, CreateInvoiceRequest } from '@/lib/invoice-api';
import { dispatchAPI, Dispatch } from '@/lib/dispatch-api';
import { format, addDays } from 'date-fns';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    dispatch_id: 0,
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    status: 'draft',
    notes: '',
  });

  // Fetch available dispatches that don't have invoices yet
  useEffect(() => {
    const fetchDispatches = async () => {      try {
        const dispatches = await dispatchAPI.getAllDispatches();
        setDispatches(dispatches || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dispatches',
          variant: 'destructive',
        });
      }
    };

    fetchDispatches();
  }, []);

  // Update calculated fields when dispatch is selected
  useEffect(() => {
    if (selectedDispatch) {
      const totalAmount = selectedDispatch.load_amount || 0;
      const carrierPercentage = selectedDispatch.charge_percent || 0;
      const carrierAmount = (totalAmount * carrierPercentage) / 100;
      const profitAmount = totalAmount - carrierAmount;

      setFormData(prev => ({
        ...prev,
        dispatch_id: selectedDispatch.id,
        total_amount: totalAmount,
        carrier_amount: carrierAmount,
        profit_amount: profitAmount,
        carrier_percentage: carrierPercentage,
        carrierInfo: {
          name: selectedDispatch.carrier?.company_name || '',
          email: selectedDispatch.carrier?.email_address || '',
          phone: selectedDispatch.carrier?.phone_number || '',
          mcNumber: selectedDispatch.carrier?.mc_number || '',
        },        serviceDetails: {
          pickupDate: typeof selectedDispatch.pickup_date === 'string' 
            ? selectedDispatch.pickup_date 
            : format(selectedDispatch.pickup_date, 'yyyy-MM-dd'),
          deliveryDate: typeof selectedDispatch.dropoff_date === 'string' 
            ? selectedDispatch.dropoff_date 
            : format(selectedDispatch.dropoff_date, 'yyyy-MM-dd'),
          pickupLocation: selectedDispatch.origin || '',
          deliveryLocation: selectedDispatch.destination || '',
          loadNumber: selectedDispatch.load_no || '',
          bolNumber: '', // This might need to be added to dispatch model
        },
      }));
    }
  }, [selectedDispatch]);

  const handleDispatchSelect = (dispatchId: string) => {
    const dispatch = dispatches.find(d => d.id.toString() === dispatchId);
    setSelectedDispatch(dispatch || null);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (status: 'draft' | 'sent') => {
    if (!formData.dispatch_id) {
      toast({
        title: 'Error',
        description: 'Please select a dispatch to create invoice for',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        ...formData,
        status,
      };

      const newInvoice = await invoiceAPI.createInvoice(invoiceData);
      
      toast({
        title: 'Success',
        description: `Invoice ${status === 'draft' ? 'saved as draft' : 'created and sent'} successfully`,
      });

      navigate('/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">
              Generate a new invoice from a dispatch record
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('sent')}
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-2" />
            Create & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dispatch">Select Dispatch</Label>
              <Select value={formData.dispatch_id.toString()} onValueChange={handleDispatchSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dispatch to invoice" />
                </SelectTrigger>
                <SelectContent>
                  {dispatches.map((dispatch) => (
                    <SelectItem key={dispatch.id} value={dispatch.id.toString()}>
                      {dispatch.load_no} - {dispatch.origin} to {dispatch.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes for this invoice..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDispatch ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Load Amount</Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(formData.total_amount || 0)}
                    </div>
                  </div>
                  <div>
                    <Label>Carrier Percentage</Label>
                    <div className="text-2xl font-bold">
                      {formData.carrier_percentage}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Carrier Amount</Label>
                    <div className="text-lg font-semibold text-red-600">
                      -{formatCurrency(formData.carrier_amount || 0)}
                    </div>
                  </div>
                  <div>
                    <Label>Profit Amount</Label>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(formData.profit_amount || 0)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="bg-gray-600 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Invoice Total:</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(formData.total_amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a dispatch to see financial details
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Details */}
        {selectedDispatch && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dispatch Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Service Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Load #:</strong> {selectedDispatch.load_no}</div>
                    <div><strong>Pickup:</strong> {selectedDispatch.origin}</div>
                    <div><strong>Delivery:</strong> {selectedDispatch.destination}</div>
                    <div><strong>Pickup Date:</strong> {format(new Date(selectedDispatch.pickup_date), 'MM/dd/yyyy')}</div>
                    <div><strong>Delivery Date:</strong> {format(new Date(selectedDispatch.dropoff_date), 'MM/dd/yyyy')}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Carrier Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Company:</strong> {selectedDispatch.carrier?.company_name}</div>
                    <div><strong>MC #:</strong> {selectedDispatch.carrier?.mc_number}</div>
                    <div><strong>Phone:</strong> {selectedDispatch.carrier?.phone_number}</div>
                    <div><strong>Email:</strong> {selectedDispatch.carrier?.email_address}</div>
                  </div>
                </div>                <div>
                  <h4 className="font-medium mb-2">User Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Dispatcher:</strong> {
                      typeof selectedDispatch.user === 'string' 
                        ? selectedDispatch.user 
                        : selectedDispatch.user_details 
                          ? `${selectedDispatch.user_details.first_name} ${selectedDispatch.user_details.last_name}`
                          : 'N/A'
                    }</div>
                    <div><strong>Email:</strong> {
                      typeof selectedDispatch.user === 'string' 
                        ? 'N/A'
                        : selectedDispatch.user_details?.email || 'N/A'
                    }</div>
                    <div><strong>Status:</strong> {selectedDispatch.status}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
