import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, Users, Bell, Eye, RefreshCw } from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { notificationService, type NotificationStats } from '@/lib/notification-service';
import { toast } from 'sonner';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export function NotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();

  useEffect(() => {
    fetchStats();
  }, [dateRange, customDateFrom, customDateTo]);

  const getDateRangeParams = () => {
    const now = new Date();
    let from: Date;
    let to: Date = endOfDay(now);

    switch (dateRange) {
      case '7d':
        from = startOfDay(subDays(now, 7));
        break;
      case '30d':
        from = startOfDay(subDays(now, 30));
        break;
      case '90d':
        from = startOfDay(subDays(now, 90));
        break;
      case 'custom':
        if (!customDateFrom || !customDateTo) return null;
        from = startOfDay(customDateFrom);
        to = endOfDay(customDateTo);
        break;
      default:
        from = startOfDay(subDays(now, 30));
    }

    return {
      date_from: format(from, 'yyyy-MM-dd'),
      date_to: format(to, 'yyyy-MM-dd')
    };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dateParams = getDateRangeParams();
      
      if (!dateParams) {
        setError('Please select valid date range');
        setLoading(false);
        return;
      }      const response = await notificationService.getNotificationStats(dateRange);
      setStats(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
      setError('Failed to load notification statistics');
      toast.error('Failed to load notification statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {error}
            <Button onClick={fetchStats} className="ml-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notification Statistics</CardTitle>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-40 justify-start text-left font-normal",
                        !customDateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateFrom ? format(customDateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDateFrom}
                      onSelect={setCustomDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-40 justify-start text-left font-normal",
                        !customDateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateTo ? format(customDateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDateTo}
                      onSelect={setCustomDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading statistics...</div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSent || 0}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">                  <div>
                    <p className="text-sm font-medium text-gray-600">Read Rate</p>
                    <p className="text-2xl font-bold text-green-600">{(stats.readRate || 0).toFixed(1)}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Read</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalRead || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.totalUnread || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Custom</Badge>
                      <span className="text-sm text-gray-600">Admin Created</span>
                    </div>
                    <span className="font-semibold">{stats.bySource?.custom || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">System</Badge>
                      <span className="text-sm text-gray-600">Auto Generated</span>
                    </div>
                    <span className="font-semibold">{stats.bySource?.system || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">                  {Object.entries(stats.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(type as 'info' | 'warning' | 'error' | 'success')}>
                          {type}
                        </Badge>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Senders */}
          {(stats.topSenders || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Notification Senders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats.topSenders || []).map((sender, index) => (                    <div key={sender.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium">{sender.name}</span>
                      </div>
                      <Badge variant="outline">{sender.count} notifications</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">                {(stats.dailyActivity || []).length > 0 ? (
                  <div className="space-y-3">
                    {(stats.dailyActivity || []).slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm font-medium w-24">
                          {format(new Date(day.date), 'MMM dd')}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">                              <div
                                className="bg-blue-600 h-2 rounded-full"                                style={{
                                  width: `${Math.max(((day.count || 0) / Math.max(...(stats.dailyActivity || []).map(d => d.count || 0), 1)) * 100, 5)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">                          <span className="text-blue-600">
                            <strong>{day.count || 0}</strong> notifications
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No activity data available for the selected date range.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No statistics available.
        </div>
      )}
    </div>
  );
}
