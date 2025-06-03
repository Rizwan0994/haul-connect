import React, { useEffect, useState } from 'react';
import { BellIcon, CheckIcon } from '@/components/notifications/icons';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Notification } from '@/lib/notification-service';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    unreadCount,
    allNotifications,
    unreadNotifications,
    isLoading,
    isConnected,
    handleNotificationClick,
    handleMarkAllAsRead,
    loadNotificationsForDropdown,
  } = useNotifications();

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotificationsForDropdown();
    }
  }, [isOpen, loadNotificationsForDropdown]);

  // Handle notification click with navigation
  const onNotificationClick = async (notification: Notification) => {
    await handleNotificationClick(notification);
    
    // Navigate to link if provided
    if (notification.link) {
      setIsOpen(false); // Close popover
      navigate(notification.link);
    }
  };

  // Mark all as read
  const onMarkAllAsRead = async () => {
    await handleMarkAllAsRead();
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
          {/* Connection status indicator (optional) */}
          {!isConnected && (
            <span className="absolute bottom-0 left-0 flex h-2 w-2 rounded-full bg-amber-500" title="Using offline mode" />
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
                    <div key={notification.id} className="group">                      <button
                        className="flex w-full cursor-pointer items-start space-x-3 p-4 hover:bg-muted/50"
                        onClick={() => onNotificationClick(notification)}
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
                </ScrollArea>                <div className="border-t p-2">
                  <Button variant="ghost" size="sm" className="w-full" onClick={onMarkAllAsRead}>
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
                    <button                      className={cn(
                        "flex w-full cursor-pointer items-start space-x-3 p-4 hover:bg-muted/50",
                        !notification.read && "bg-muted/30"
                      )}
                      onClick={() => onNotificationClick(notification)}
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
