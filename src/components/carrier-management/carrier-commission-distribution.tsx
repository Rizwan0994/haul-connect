import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Carrier } from './columns';

interface CarrierCommissionDistributionProps {
  carriers: Carrier[];
  loading?: boolean;
}

export function CarrierCommissionDistribution({ carriers, loading }: CarrierCommissionDistributionProps) {
  const calculateCommissionBreakdown = () => {
    let paidCommission = 0;
    let pendingCommission = 0;
    let confirmedSaleCommission = 0;

    carriers.forEach(carrier => {
      const commissionAmount = carrier.commission_amount || 0;
      
      if (carrier.commission_status === 'paid') {
        paidCommission += commissionAmount;
      } else if (carrier.commission_status === 'pending') {
        pendingCommission += commissionAmount;
      } else if (carrier.commission_status === 'confirmed_sale') {
        confirmedSaleCommission += commissionAmount;
      }
    });

    const totalCommission = paidCommission + pendingCommission + confirmedSaleCommission;
    const paidPercentage = totalCommission > 0 ? (paidCommission / totalCommission) * 100 : 0;
    const pendingPercentage = totalCommission > 0 ? (pendingCommission / totalCommission) * 100 : 0;
    const confirmedPercentage = totalCommission > 0 ? (confirmedSaleCommission / totalCommission) * 100 : 0;

    return {
      paidCommission,
      pendingCommission,
      confirmedSaleCommission,
      totalCommission,
      paidPercentage,
      pendingPercentage,
      confirmedPercentage
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Commission Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {commission.totalCommission === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No commission data available</p>
          </div>
        ) : (
          <>
            {/* Paid Commission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Paid Commission</span>
                <span className="text-sm text-gray-500">
                  {commission.paidPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={commission.paidPercentage} 
                className="h-2"
                style={{
                  '--progress-background': 'rgb(34 197 94)' // green-500
                } as React.CSSProperties}
              />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(commission.paidCommission)}
                </span>
              </div>
            </div>

            {/* Confirmed Sale Commission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Confirmed Sale</span>
                <span className="text-sm text-gray-500">
                  {commission.confirmedPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={commission.confirmedPercentage} 
                className="h-2"
                style={{
                  '--progress-background': 'rgb(59 130 246)' // blue-500
                } as React.CSSProperties}
              />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(commission.confirmedSaleCommission)}
                </span>
              </div>
            </div>

            {/* Pending Commission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-700">Pending Commission</span>
                <span className="text-sm text-gray-500">
                  {commission.pendingPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={commission.pendingPercentage} 
                className="h-2"
                style={{
                  '--progress-background': 'rgb(249 115 22)' // orange-500
                } as React.CSSProperties}
              />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(commission.pendingCommission)}
                </span>
              </div>
            </div>

            {/* Total Summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Commission</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(commission.totalCommission)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
