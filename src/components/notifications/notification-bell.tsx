import React, { useEffect, useState, useRef } from 'react';
import { BellIcon, CheckIcon } from '@/components/notifications/icons';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { notificationService, Notification } from '@/lib/notification-service';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Function to fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch unread count
      const countResponse = await notificationService.getUnreadCount();
      setUnreadCount(countResponse.count);
      
      if (isOpen) {
        // Fetch all notifications when dropdown is open
        const unreadResponse = await notificationService.getUserNotifications(1, 10, false);
        setUnreadNotifications(unreadResponse.notifications);
        
        const allResponse = await notificationService.getUserNotifications(1, 10);
        setAllNotifications(allResponse.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling for notifications
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();
    
    // Set up polling interval (every 30 seconds)
    intervalRef.current = window.setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read if it's not already
    if (!notification.read) {
      await notificationService.markAsRead([notification.id]);
      fetchNotifications(); // Refresh data
    }
    
    // Navigate to link if provided
    if (notification.link) {
      setIsOpen(false); // Close popover
      navigate(notification.link);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(); // Refresh data
    } catch (error) {
      console.error('Error marking all as read:', error);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Tabs defaultValue="unread" className="w-full">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            <TabsList className="grid w-40 grid-cols-2">
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="unread" className="p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-sm text-muted-foreground">No unread notifications</p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[calc(100vh-15rem)] max-h-[400px]">
                  {unreadNotifications.map((notification) => (
                    <div key={notification.id} className="group">
                      <button
                        className="flex w-full cursor-pointer items-start space-x-3 p-4 hover:bg-muted/50"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", getNotificationTypeColor(notification.type))} />
                        <div className="flex-1 space-y-1 text-left">
                          <p className="text-sm font-medium leading-none">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                      <Separator />
                    </div>
                  ))}
                </ScrollArea>
                <div className="border-t p-2">
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleMarkAllAsRead}>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-15rem)] max-h-[400px]">
                {allNotifications.map((notification) => (
                  <div key={notification.id} className="group">
                    <button
                      className={cn(
                        "flex w-full cursor-pointer items-start space-x-3 p-4 hover:bg-muted/50",
                        !notification.read && "bg-muted/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", getNotificationTypeColor(notification.type))} />
                      <div className="flex-1 space-y-1 text-left">
                        <p className={cn("text-sm leading-none", !notification.read && "font-medium")}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                    <Separator />
                  </div>
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t p-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/notifications')}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
