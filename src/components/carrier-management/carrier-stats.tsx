import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle, DollarSign, UserCheck, Activity } from 'lucide-react';
import { Carrier } from './columns';
import { useAuth } from '@/components/auth/auth-context';

interface CarrierStatsProps {
  carriers: Carrier[];
  loading?: boolean;
}

export function CarrierStats({ carriers, loading }: CarrierStatsProps) {
  const { currentUser } = useAuth();  const calculateStats = () => {
    // Filter carriers by current user for sales agents
    // Admins and managers see all carriers
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Manager';
    
    // For now, show all carriers since existing carriers might not have sales_agent_id set
    // TODO: Once all carriers have sales_agent_id populated, enable strict filtering for sales users
    const userCarriers = carriers; // Temporarily show all carriers until sales_agent_id is populated
    
    console.log('Current user:', currentUser);
    console.log('User carriers:', userCarriers);
    console.log('All carriers:', carriers);
    
    // 1. Total Carriers: Number of carriers a sales user has saved
    const totalCarriers = userCarriers.length;
    
    // 2. Approved Carriers: Carriers that have been approved by manager/admin
    const approvedCarriers = userCarriers.filter(c => {
      const isApproved = c.approval_status === 'accounts_approved' || c.approval_status === 'manager_approved';
      console.log(`Carrier ${c.company_name}: approval_status = ${c.approval_status}, isApproved = ${isApproved}`);
      return isApproved;
    }).length;
      // 3. Active Carriers: Carriers with completed dispatches and paid invoices
    // A carrier is active when they have completed at least one load AND commission is confirmed/paid
    const activeCarriers = userCarriers.filter(c => {
      const hasCompletedLoads = c.loads_completed && c.loads_completed > 0;
      const hasConfirmedCommission = c.commission_status === 'confirmed_sale' || c.commission_status === 'paid';
      const isActive = hasCompletedLoads && hasConfirmedCommission;
      console.log(`Carrier ${c.company_name}: loads_completed = ${c.loads_completed}, commission_status = ${c.commission_status}, isActive = ${isActive}`);
      return isActive;
    }).length;
    
    // 4. Commission Paid: Total amount of commissions paid to the sales agent
    const totalCommissionPaid = userCarriers
      .filter(c => {
        const isPaid = c.commission_status === 'paid' || c.commission_paid === true;
        console.log(`Carrier ${c.company_name}: commission_status = ${c.commission_status}, commission_paid = ${c.commission_paid}, isPaid = ${isPaid}`);
        return isPaid;
      })
      .reduce((sum, carrier) => sum + (carrier.commission_amount || 0), 0);

    return {
      totalCarriers,
      approvedCarriers,
      activeCarriers,
      totalCommissionPaid
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
      description: 'Number of carriers you have saved',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Approved Carriers',
      value: stats.approvedCarriers,
      icon: CheckCircle,
      description: 'Carriers approved by manager/admin',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },    {
      title: 'Active Carriers',
      value: stats.activeCarriers,
      icon: Activity,
      description: 'Carriers with completed & paid dispatches',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Commission Paid',
      value: formatCurrency(parseFloat(String(stats.totalCommissionPaid)) || 0),
      icon: DollarSign,
      description: 'Total commission paid to you',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
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
