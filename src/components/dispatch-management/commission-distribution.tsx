import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dispatch } from '@/lib/dispatch-api';

interface CommissionDistributionProps {
  dispatches: Dispatch[];
  loading?: boolean;
}

export function CommissionDistribution({ dispatches, loading }: CommissionDistributionProps) {
  const calculateCommissionBreakdown = () => {
    let salesCommission = 0;
    let dispatchCommission = 0;

    dispatches.forEach(dispatch => {
      // Service charge (8% of load amount)
      const serviceCharge = (dispatch.load_amount * 8) / 100;
      
      // Determine if this is sales or dispatch based on department
      if (dispatch.department?.toLowerCase().includes('sales')) {
        salesCommission += serviceCharge;
      } else {
        dispatchCommission += serviceCharge;
      }
    });

    const totalCommission = salesCommission + dispatchCommission;
    const salesPercentage = totalCommission > 0 ? (salesCommission / totalCommission) * 100 : 0;
    const dispatchPercentage = totalCommission > 0 ? (dispatchCommission / totalCommission) * 100 : 0;

    return {
      salesCommission,
      dispatchCommission,
      totalCommission,
      salesPercentage,
      dispatchPercentage
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const commission = calculateCommissionBreakdown();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Commission Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sales Commission */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white-700">Sales Commission</span>
            <span className="text-sm font-semibold text-white-900">
              {formatCurrency(commission.salesCommission)}
            </span>
          </div>
          <Progress 
            value={commission.salesPercentage} 
            className="h-2" 
            style={{
              background: '#e5e7eb'
            }}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{commission.salesPercentage.toFixed(1)}% of total</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Sales Dept
            </span>
          </div>
        </div>

        {/* Dispatch Commission */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white-700">Dispatch Commission</span>
            <span className="text-sm font-semibold text-white-900">
              {formatCurrency(commission.dispatchCommission)}
            </span>
          </div>
          <Progress 
            value={commission.dispatchPercentage} 
            className="h-2"
            style={{
              background: '#e5e7eb'
            }}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{commission.dispatchPercentage.toFixed(1)}% of total</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Dispatch Dept
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white-700">Total Commission</span>
            <span className="text-lg font-bold text-white-900">
              {formatCurrency(commission.totalCommission)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
