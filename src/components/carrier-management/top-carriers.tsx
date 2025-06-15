import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, DollarSign, Truck } from 'lucide-react';
import { Carrier } from './columns';

interface TopCarriersProps {
  carriers: Carrier[];
  loading?: boolean;
}

interface CarrierStats {
  id: string;
  name: string;
  companyName: string;
  commission: number;
  loadsCompleted: number;
  status: string;
  initials: string;
}

export function TopCarriers({ carriers, loading }: TopCarriersProps) {
  const calculateCarrierStats = (): CarrierStats[] => {
    const activeCarriers = carriers.filter(carrier => 
      carrier.status === 'active' && 
      (carrier.commission_amount || 0) > 0
    );

    const carrierStats = activeCarriers.map(carrier => {
      const nameParts = (carrier.owner_name || carrier.company_name).split(' ');
      const initials = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : (carrier.owner_name || carrier.company_name).substring(0, 2).toUpperCase();

      return {
        id: carrier.id,
        name: carrier.owner_name || carrier.company_name,
        companyName: carrier.company_name,
        commission: carrier.commission_amount || 0,
        loadsCompleted: carrier.loads_completed || 0,
        status: carrier.commission_status || 'not_eligible',
        initials
      };
    });

    // Sort by commission amount (primary) and loads completed (secondary)
    return carrierStats
      .sort((a, b) => {
        if (b.commission !== a.commission) {
          return b.commission - a.commission;
        }
        return b.loadsCompleted - a.loadsCompleted;
      })
      .slice(0, 5); // Top 5 carriers
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'confirmed_sale':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Pending</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Eligible</Badge>;
    }
  };

  const topCarriers = calculateCarrierStats();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Top Carriers by Commission
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCarriers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No commission data available</p>
            <p className="text-sm">Carriers will appear here once they complete loads</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCarriers.map((carrier, index) => (
              <div 
                key={carrier.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={carrier.name} />
                      <AvatarFallback className="text-sm font-medium">
                        {carrier.initials}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white-900 truncate">
                      {carrier.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {carrier.companyName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-xs text-white-500">
                        <Truck className="h-3 w-3 mr-1" />
                        {carrier.loadsCompleted} loads
                      </div>
                      {getStatusBadge(carrier.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-lg font-bold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(carrier.commission).replace('$', '')}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
