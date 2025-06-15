import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle, DollarSign } from 'lucide-react';
import { Carrier } from './columns';

interface CarrierStatsProps {
  carriers: Carrier[];
  loading?: boolean;
}

export function CarrierStats({ carriers, loading }: CarrierStatsProps) {  const calculateStats = () => {
    const totalCarriers = carriers.length;
    const activeCarriers = carriers.filter(c => c.status === 'active').length;
    const approvedCarriers = carriers.filter(c => c.approval_status === 'accounts_approved').length;
    
    // Calculate total commission paid
    const totalCommissionPaid = carriers.reduce((sum, carrier) => {
      return sum + (carrier.commission_amount || 0);
    }, 0);

    // Calculate eligible carriers (carriers who have completed at least one load)
    const eligibleCarriers = carriers.filter(c => c.commission_status === 'confirmed_sale' || c.commission_status === 'paid').length;

    return {
      totalCarriers,
      activeCarriers,
      approvedCarriers,
      totalCommissionPaid,
      eligibleCarriers
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsData = [
    {
      title: 'Total Carriers',
      value: stats.totalCarriers,
      icon: Users,
      description: 'All registered carriers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Carriers',
      value: stats.activeCarriers,
      icon: TrendingUp,
      description: 'Currently active carriers',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Approved Carriers',
      value: stats.approvedCarriers,
      icon: CheckCircle,
      description: 'Fully approved carriers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Commission Paid',
      value: formatCurrency(stats.totalCommissionPaid),
      icon: DollarSign,
      description: 'Total commission paid',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
