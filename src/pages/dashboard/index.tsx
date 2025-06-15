import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, BarChart3, Users, Truck, Package, CalendarDays, TrendingUp, DollarSign } from 'lucide-react';
import { dispatchAPI, Dispatch } from '@/lib/dispatch-api';
import { carrierApiService } from '@/services/carrierApi';
import { commissionApi, CommissionSummary } from '@/lib/commission-api';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

interface DashboardData {
  dispatches: Dispatch[];
  carriers: any[];
  commissionSummary: CommissionSummary | null;
  monthlyStats: {
    month: string;
    carriers: number;
    drivers: number;
    loads: number;
    revenue: number;
    commissions: number;
  }[];
}

const chartConfig = {
  carriers: {
    label: "Carriers",
    color: "#3b82f6"
  },
  drivers: {
    label: "Drivers",
    color: "#10b981"
  },
  loads: {
    label: "Total Loads",
    color: "#f59e0b"
  },
  revenue: {
    label: "Revenue",
    color: "#ef4444"
  },
  commissions: {
    label: "Commissions",
    color: "#8b5cf6"
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const { toast } = useToast();

  // Helper function to safely parse load amount
  const parseLoadAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/[^0-9.-]/g, '')); // Remove non-numeric characters except . and -
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  useEffect(() => {
    console.log('Dashboard: useEffect triggered - fetching data...');
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Dashboard: Starting API calls...');
        // Fetch dispatches and carriers
        const [dispatches, carriers] = await Promise.all([
          dispatchAPI.getAllDispatches(),
          carrierApiService.getAllCarriers()
        ]);        console.log('Dashboard: API calls completed', { dispatches: dispatches.length, carriers: carriers.length });
        
        // Debug: Check load_amount values
        console.log('Sample dispatch load_amounts:', dispatches.slice(0, 3).map(d => ({ 
          id: d.id, 
          load_amount: d.load_amount, 
          type: typeof d.load_amount 
        })));

        // Generate monthly statistics for the last 12 months
        const currentDate = new Date();
        const startDate = startOfMonth(subMonths(currentDate, 11));
        const endDate = endOfMonth(currentDate);
        
        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        const monthlyStats = months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          
          // Filter dispatches for this month
          const monthDispatches = dispatches.filter(dispatch => {
            const dispatchDate = new Date(dispatch.created_at);
            return dispatchDate >= monthStart && dispatchDate <= monthEnd;
          });          // Filter carriers for this month (assuming they have a created_at field)
          const monthCarriers = carriers.filter(carrier => {
            const carrierDate = new Date(carrier.created_at || month);
            return carrierDate >= monthStart && carrierDate <= monthEnd;
          });

          // Calculate revenue from dispatches
          const revenue = monthDispatches.reduce((sum, dispatch) => {
            return sum + parseLoadAmount(dispatch.load_amount);
          }, 0);

          // Calculate commission amounts for this month
          const commissions = monthCarriers.reduce((sum, carrier) => {
            return sum + (parseFloat(String(carrier.commission_amount || 0)) || 0);
          }, 0);

          return {
            month: format(month, 'MMM yyyy'),
            carriers: monthCarriers.length,
            drivers: monthCarriers.length, // Assuming 1 driver per carrier for now
            loads: monthDispatches.length,
            revenue: revenue,
            commissions: commissions
          };
        });

        // Fetch commission summary
        const commissionSummary = await commissionApi.getCommissionSummary().catch(() => null);

        setData({
          dispatches,
          carriers,
          commissionSummary,
          monthlyStats
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }    };

    fetchDashboardData();
  }, []); // Empty dependency array - only run on mount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  // Generate dispatch sheet chart data
  const getDispatchSheetData = () => {
    if (!data) return [];
    
    const statusCounts = data.dispatches.reduce((acc, dispatch) => {
      const status = dispatch.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count], index) => ({
      status,
      count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  // Generate sales/commission analysis data
  const getSalesAnalysisData = () => {
    if (!data || !data.commissionSummary) return [];
    
    const summary = data.commissionSummary;
    return [
      {
        status: 'Not Eligible',
        count: summary.not_eligible.count,
        amount: summary.not_eligible.amount,
        fill: '#94a3b8' // gray-400
      },
      {
        status: 'Pending',
        count: summary.pending.count,
        amount: summary.pending.amount,
        fill: '#f59e0b' // amber-500
      },
      {
        status: 'Confirmed Sale',
        count: summary.confirmed_sale.count,
        amount: summary.confirmed_sale.amount,
        fill: '#3b82f6' // blue-500
      },
      {
        status: 'Paid',
        count: summary.paid.count,
        amount: summary.paid.amount,
        fill: '#10b981' // emerald-500
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dispatchSheetData = getDispatchSheetData();
  const salesAnalysisData = getSalesAnalysisData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business metrics and performance
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carriers/Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.carriers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active carrier profiles
            </p>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.commissionSummary ? formatCurrency(
                (data.commissionSummary.paid.amount || 0) + 
                (data.commissionSummary.pending.amount || 0) + 
                (data.commissionSummary.confirmed_sale.amount || 0)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.commissionSummary ? 
                `${data.commissionSummary.paid.count} paid, ${data.commissionSummary.pending.count} pending` : 
                'Commission tracking'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dispatches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dispatches.length}</div>
            <p className="text-xs text-muted-foreground">
              All time dispatches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Carriers/Drivers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>            <div className="text-2xl font-bold">
              {formatCurrency(data.dispatches.reduce((sum, d) => sum + parseLoadAmount(d.load_amount), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              From all dispatches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly" className="space-y-4">        <TabsList>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch Analysis</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carriers by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Carriers by Month</CardTitle>
                <CardDescription>New carriers added each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="carriers" fill={chartConfig.carriers.color} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Drivers by Month */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Drivers by Month</CardTitle>
                <CardDescription>Driver availability trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="drivers" 
                      stroke={chartConfig.drivers.color}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card> */}

            {/* Total Loads by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Total Loads by Month</CardTitle>
                <CardDescription>Monthly dispatch volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="loads" 
                      stroke={chartConfig.loads.color}
                      fill={chartConfig.loads.color}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} 
                      />} 
                    />
                    <Bar dataKey="revenue" fill={chartConfig.revenue.color} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dispatch" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispatch Sheet Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Status Distribution</CardTitle>
                <CardDescription>Current status of all dispatches</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      dataKey="count"
                      data={dispatchSheetData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {dispatchSheetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Combined Monthly Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Combined metrics by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="carriers" fill={chartConfig.carriers.color} />
                    <Bar dataKey="loads" fill={chartConfig.loads.color} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Status Distribution</CardTitle>
                <CardDescription>Current commission status across all carriers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      dataKey="count"
                      data={salesAnalysisData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {salesAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          name === 'count' ? value : formatCurrency(Number(value)), 
                          name === 'count' ? 'Count' : 'Amount'
                        ]} 
                      />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Commission Amount Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Amount Distribution</CardTitle>
                <CardDescription>Total commission amounts by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={salesAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [formatCurrency(Number(value)), "Amount"]} 
                      />} 
                    />
                    <Bar dataKey="amount" fill={chartConfig.commissions.color} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Monthly Commission Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Commission Trends</CardTitle>
                <CardDescription>Commission amounts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [formatCurrency(Number(value)), "Commissions"]} 
                      />} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="commissions" 
                      stroke={chartConfig.commissions.color}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Commission Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Commission</CardTitle>
                <CardDescription>Monthly comparison of revenue and commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          formatCurrency(Number(value)), 
                          name === 'revenue' ? 'Revenue' : 'Commissions'
                        ]} 
                      />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill={chartConfig.revenue.color} />
                    <Bar dataKey="commissions" fill={chartConfig.commissions.color} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
