import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, Notification } from '@/lib/notification-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckIcon, TrashIcon, BellIcon } from '@/components/notifications/icons';
import { NotificationPagination } from '@/components/ui/notification-pagination';
import { useToast } from '@/components/ui/use-toast';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<NotificationPagination>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to fetch notifications
  const fetchNotifications = async (page = 1, readFilter?: boolean) => {
    setIsLoading(true);
    try {
      const response = await notificationService.getUserNotifications(
        page, 
        PAGE_SIZE, 
        readFilter
      );
      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load notifications',
        description: 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const readFilter = currentTab === 'unread' ? false : undefined;
    fetchNotifications(1, readFilter);
  }, [currentTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value as 'all' | 'unread');
    setSelectedNotifications([]);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const readFilter = currentTab === 'unread' ? false : undefined;
    fetchNotifications(page, readFilter);
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await notificationService.markAsRead([notification.id]);
        
        // Update the notification in the current list
        setNotifications(current => 
          current.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }
      
      // Navigate if link exists
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to process notification',
        description: 'Please try again later.'
      });
    }
  };

  // Handle select notification
  const handleSelectNotification = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedNotifications(current => {
      if (current.includes(notificationId)) {
        return current.filter(id => id !== notificationId);
      } else {
        return [...current, notificationId];
      }
    });
  };

  // Handle select all notifications
  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  // Mark selected as read
  const markSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await notificationService.markAsRead(selectedNotifications);
      
      // Update the notifications in the current list
      setNotifications(current => 
        current.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        )
      );
      
      // Clear selection
      setSelectedNotifications([]);
      
      toast({
        title: 'Notifications marked as read',
        description: `${selectedNotifications.length} notification(s) marked as read.`
      });
      
      // Refresh if in unread tab
      if (currentTab === 'unread') {
        fetchNotifications(1, false);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to mark notifications as read',
        description: 'Please try again later.'
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      toast({
        title: 'All notifications marked as read',
        description: 'All your notifications have been marked as read.'
      });
      
      // Refresh notifications
      if (currentTab === 'unread') {
        fetchNotifications(1, false);
      } else {
        setNotifications(current => 
          current.map(n => ({ ...n, read: true }))
        );
      }
      
      // Clear selection
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to mark all notifications as read',
        description: 'Please try again later.'
      });
    }
  };

  // Delete selected notifications
  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      // Delete each selected notification one by one
      for (const id of selectedNotifications) {
        await notificationService.deleteNotification(id);
      }
      
      toast({
        title: 'Notifications deleted',
        description: `${selectedNotifications.length} notification(s) deleted.`
      });
      
      // Refresh current page
      const readFilter = currentTab === 'unread' ? false : undefined;
      fetchNotifications(pagination.page, readFilter);
      
      // Clear selection
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete notifications',
        description: 'Please try again later.'
      });
    }
  };

  // Function to get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          {selectedNotifications.length > 0 && (
            <>
              <Button variant="outline" onClick={markSelectedAsRead}>
                <CheckIcon className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
              <Button variant="outline" onClick={deleteSelectedNotifications}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckIcon className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Your Notifications</CardTitle>
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            {isLoading 
              ? 'Loading your notifications...' 
              : `${pagination.total} notification${pagination.total !== 1 ? 's' : ''} total`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTab === 'unread' 
                  ? 'You have no unread notifications.' 
                  : 'You have no notifications yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center">
                <label className="flex items-center text-sm">
                  <input 
                    type="checkbox" 
                    checked={selectedNotifications.length === notifications.length} 
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 mr-2 h-4 w-4"
                  />
                  Select All
                </label>
              </div>
              
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div key={notification.id} className="group">
                    <div 
                      className={cn(
                        "flex w-full cursor-pointer items-start p-3 hover:bg-muted/50 rounded-md",
                        !notification.read && "bg-muted/30",
                        selectedNotifications.includes(notification.id) && "bg-muted"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mr-3 flex items-center">
                        <input 
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => e.stopPropagation()}
                          onClick={(e) => handleSelectNotification(notification.id, e)}
                          className="rounded border-gray-300 h-4 w-4"
                        />
                      </div>
                      <div className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", getNotificationTypeColor(notification.type))} />
                      <div className="ml-3 flex-1 space-y-1 text-left">
                        <p className={cn("text-sm", !notification.read && "font-medium")}>
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notification.created_at), 'PPp')}
                          </span>
                          <span className="mx-1">•</span>
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.link && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="text-primary">Has link</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
                {pagination.pages > 1 && (
                <NotificationPagination
                  className="mt-6"
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
