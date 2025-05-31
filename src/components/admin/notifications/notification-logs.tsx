import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, Download, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { notificationService, Notification } from '@/lib/notification-service';
import { toast } from 'sonner';

// Use the Notification interface from service, but extend it for logs-specific fields
interface NotificationLog extends Notification {
  title?: string;
  is_custom?: boolean;
  sender?: {
    id: number;
    username: string;
    full_name: string;
  };
  recipient?: {
    id: number;
    username: string;
    full_name: string;
  };
  is_read?: boolean;
  read_at?: string;
  created_at: string;
  link?: string;
}

interface Filters {
  search: string;
  type: string;
  is_custom: string;
  sender_id: string;
  date_from?: Date;
  date_to?: Date;
  is_read: string;
}

export function NotificationLogs() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
    const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    is_custom: 'all',
    sender_id: 'all',
    is_read: 'all'
  });

  const [admins, setAdmins] = useState<Array<{ id: number; username: string; full_name: string }>>([]);

  useEffect(() => {
    fetchNotifications();
    fetchAdmins();
  }, [pagination.page, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== undefined && value !== null && value !== 'all'
          )
        )
      });

      if (filters.date_from) {
        params.append('date_from', format(filters.date_from, 'yyyy-MM-dd'));
      }
      if (filters.date_to) {
        params.append('date_to', format(filters.date_to, 'yyyy-MM-dd'));
      }      const response = await notificationService.getAdminNotifications(params.toString());
      setNotifications(response.notifications as NotificationLog[]);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.pages
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notification logs');
      toast.error('Failed to load notification logs');
    } finally {
      setLoading(false);
    }
  };
  const fetchAdmins = async () => {
    try {
      const response = await notificationService.getAdminUsers();
      setAdmins(response || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | Date | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const handleExportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== undefined && value !== null
          )
        ),
        export: 'true'
      });

      if (filters.date_from) {
        params.append('date_from', format(filters.date_from, 'yyyy-MM-dd'));
      }
      if (filters.date_to) {
        params.append('date_to', format(filters.date_to, 'yyyy-MM-dd'));
      }

      const response = await fetch(`/api/notifications/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notification-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Logs exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
      toast.error('Failed to export logs');
    }
  };
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      is_custom: 'all',
      sender_id: 'all',
      is_read: 'all'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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
            <Button onClick={fetchNotifications} className="ml-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Notification Logs</CardTitle>
          <Button onClick={handleExportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <Select value={filters.is_custom} onValueChange={(value) => handleFilterChange('is_custom', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="true">Custom</SelectItem>
                <SelectItem value="false">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.is_read} onValueChange={(value) => handleFilterChange('is_read', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Read</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sender</label>
            <Select value={filters.sender_id} onValueChange={(value) => handleFilterChange('sender_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All senders" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All senders</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id.toString()}>
                    {admin.full_name || admin.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date_from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_from ? format(filters.date_from, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date_from}
                  onSelect={(date) => handleFilterChange('date_from', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date_to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_to ? format(filters.date_to, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date_to}
                  onSelect={(date) => handleFilterChange('date_to', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="text-center py-8">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications found matching your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "border rounded-lg p-4 transition-colors hover:bg-gray-50",
                  !notification.is_read && "border-blue-200 bg-blue-50"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant={notification.is_custom ? "default" : "secondary"}>
                        {notification.is_custom ? "Custom" : "System"}
                      </Badge>
                      {!notification.is_read && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Unread
                        </Badge>
                      )}
                    </div>
                    
                    {notification.title && (
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                    )}
                    
                    <p className="text-gray-700 mb-2">
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">                      {notification.recipient && (
                        <span>
                          <strong>To:</strong> {notification.recipient.full_name || notification.recipient.username}
                        </span>
                      )}
                      {notification.sender && (
                        <span>
                          <strong>From:</strong> {notification.sender.full_name || notification.sender.username}
                        </span>
                      )}
                      <span>
                        <strong>Sent:</strong> {format(new Date(notification.created_at), 'PPp')}
                      </span>
                      {notification.read_at && (
                        <span>
                          <strong>Read:</strong> {format(new Date(notification.read_at), 'PPp')}
                        </span>
                      )}
                    </div>

                    {notification.link && (
                      <div className="mt-2">
                        <a 
                          href={notification.link}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Link →
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/notifications/${notification.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} notifications
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
