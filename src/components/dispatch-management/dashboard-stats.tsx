import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { Dispatch } from '@/lib/dispatch-api';

interface DashboardStatsProps {
  dispatches: Dispatch[];
  loading?: boolean;
}

export function DashboardStats({ dispatches, loading }: DashboardStatsProps) {
  const calculateStats = () => {
    const scheduled = dispatches.filter(d => d.status === 'Scheduled').length;
    const inTransit = dispatches.filter(d => d.status === 'In Transit').length;
    const confirmed = dispatches.filter(d => d.status === 'Delivered').length;
    
    // Calculate total commission generated (8% service charge)
    const totalCommission = dispatches.reduce((sum, dispatch) => {
      return sum + (dispatch.load_amount * 8) / 100;
    }, 0);

    return {
      scheduled,
      inTransit,
      confirmed,
      totalCommission
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
      title: 'Scheduled',
      value: stats.scheduled,
      icon: TrendingUp,
      description: 'Loads scheduled',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Transit',
      value: stats.inTransit,
      icon: Truck,
      description: 'Loads in transit',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Confirmed Sales & Dispatch',
      value: stats.confirmed,
      icon: CheckCircle,
      description: 'Delivered loads',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Commission Generated',
      value: formatCurrency(stats.totalCommission),
      icon: DollarSign,
      description: 'Total commission earned',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
