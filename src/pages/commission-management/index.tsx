import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { carrierApiService } from '@/services/carrierApi';
import { commissionApi } from '@/lib/commission-api';
import { DollarSign, Edit, Eye, TrendingUp, Users, Calculator, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createCommissionColumns, CommissionData as CommissionDataType } from './commission-columns';

type CommissionData = CommissionDataType;

export default function CommissionManagement() {
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<CommissionData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    commissionStatus: '',
    commissionAmount: '',
    agreedPercentage: '',
  });

  // Fetch commission data
  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all carriers with commission data
      const carriers = await carrierApiService.getAllCarriers();
      
      const formattedCommissions: CommissionData[] = carriers.map(carrier => ({
        id: carrier.id?.toString() || '',
        carrierId: carrier.id?.toString() || '',
        companyName: carrier.company_name || '',
        mcNumber: carrier.mc_number || '',
        driverName: carrier.driver_name,
        driverPhone: carrier.driver_phone,
        commissionStatus: carrier.commission_status || 'not_eligible',
        commissionAmount: carrier.commission_amount,
        agreedPercentage: carrier.agreed_percentage,
        loadsCompleted: carrier.loads_completed,
        firstLoadCompletedAt: carrier.first_load_completed_at,
        commissionPaidAt: carrier.commission_paid_at,
        lastUpdated: carrier.updated_at,
      }));

      setCommissions(formattedCommissions);
    } catch (err: any) {
      console.error('Error fetching commissions:', err);
      setError('Failed to load commission data. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load commission data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCarriers = commissions.length;
    const paidCommissions = commissions.filter(c => c.commissionStatus === 'paid');
    const pendingCommissions = commissions.filter(c => c.commissionStatus === 'pending');
    const confirmedSales = commissions.filter(c => c.commissionStatus === 'confirmed_sale');
    
    const totalPaidAmount = paidCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    const totalLoads = commissions.reduce((sum, c) => sum + (c.loadsCompleted || 0), 0);

    return {
      totalCarriers,
      paidCount: paidCommissions.length,
      pendingCount: pendingCommissions.length,
      confirmedCount: confirmedSales.length,
      totalPaidAmount,
      totalPendingAmount,
      totalLoads,
    };
  }, [commissions]);

  // Handle edit commission
  const handleEditCommission = (commission: CommissionData) => {
    setSelectedCommission(commission);
    setEditForm({
      commissionStatus: commission.commissionStatus,
      commissionAmount: commission.commissionAmount?.toString() || '',
      agreedPercentage: commission.agreedPercentage || '',
    });
    setIsEditDialogOpen(true);
  };

  // Submit commission update
  const handleSubmitEdit = async () => {
    if (!selectedCommission) return;

    try {
      await commissionApi.updateCommissionStatus(selectedCommission.carrierId, {
        commission_status: editForm.commissionStatus as any,
        commission_amount: parseFloat(editForm.commissionAmount) || undefined,
      });

      toast({
        title: 'Success',
        description: 'Commission updated successfully',
      });

      setIsEditDialogOpen(false);
      fetchCommissions(); // Refresh data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update commission',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Create columns with refresh function
  const columns = useMemo(() => createCommissionColumns(fetchCommissions, handleEditCommission), []);

  useEffect(() => {
    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading commission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-none space-y-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commission Management</h1>
            <p className="text-muted-foreground">
              Track and manage driver commissions and payments
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalCarriers}</div>
              <p className="text-xs text-muted-foreground">
                Active carrier profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Commissions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalPaidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.paidCount} carriers paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(summaryStats.totalPendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.pendingCount} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loads</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalLoads}</div>
              <p className="text-xs text-muted-foreground">
                Completed loads across all carriers
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Table */}
      <div className="flex-1 px-6 pb-6">
        <Card className="h-full">
          <CardContent className="p-6 h-full">            <DataTable
              columns={columns}
              data={commissions}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Commission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Commission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.commissionStatus}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, commissionStatus: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_eligible">Not Eligible</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed_sale">Confirmed Sale</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editForm.commissionAmount}
                onChange={(e) => setEditForm(prev => ({ ...prev, commissionAmount: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="percentage" className="text-right">
                Percentage
              </Label>
              <Input
                id="percentage"
                placeholder="e.g., 10%"
                value={editForm.agreedPercentage}
                onChange={(e) => setEditForm(prev => ({ ...prev, agreedPercentage: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
