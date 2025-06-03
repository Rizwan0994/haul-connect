import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { notificationService, Notification } from '@/lib/notification-service';

interface NotificationData {
  id: number;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { socket, isConnected } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch notifications from API (fallback)
  const fetchNotifications = useCallback(async (forceAll = false) => {
    setIsLoading(true);
    try {
      // Always fetch unread count
      const countResponse = await notificationService.getUnreadCount();
      setUnreadCount(countResponse.count);
      
      if (forceAll) {
        // Fetch both unread and all notifications
        const [unreadResponse, allResponse] = await Promise.all([
          notificationService.getUserNotifications(1, 10, false),
          notificationService.getUserNotifications(1, 10)
        ]);
        
        setUnreadNotifications(unreadResponse.notifications);
        setAllNotifications(allResponse.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);  // Function to add new notification to state
  const addNotification = useCallback((notificationData: NotificationData) => {
    const newNotification: Notification = {
      id: notificationData.id,
      message: notificationData.message,
      type: notificationData.type as 'success' | 'error' | 'warning' | 'info',
      link: notificationData.link,
      read: notificationData.read,
      created_at: notificationData.created_at,
      updated_at: notificationData.created_at,
      user_id: 0, // Will be set by backend
      email: null
    };

    // Update unread count
    if (!notificationData.read) {
      setUnreadCount(prev => prev + 1);
      
      // Add to unread notifications
      setUnreadNotifications(prev => [newNotification, ...prev]);
    }
    
    // Add to all notifications
    setAllNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Set up Socket.IO listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleNewNotification = (data: NotificationData) => {
      console.log('Received new notification:', data);
      addNotification(data);
    };

    const handleNotificationUpdate = (data: { notificationId: number; read: boolean }) => {
      console.log('Notification updated:', data);
      
      // Update local state
      if (data.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Remove from unread notifications
        setUnreadNotifications(prev => 
          prev.filter(notification => notification.id !== data.notificationId)
        );
        
        // Update in all notifications
        setAllNotifications(prev => 
          prev.map(notification => 
            notification.id === data.notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    };

    // Listen for Socket.IO events
    socket.on('notification', handleNewNotification);
    socket.on('notification:update', handleNotificationUpdate);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('notification:update', handleNotificationUpdate);
    };
  }, [socket, isConnected, addNotification]);

  // Initial fetch and fallback polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();
    
    // Set up fallback polling if Socket.IO is not connected
    let intervalId: number | null = null;
    
    if (!isConnected) {
      console.log('Socket.IO not connected, using polling fallback');
      intervalId = window.setInterval(() => {
        fetchNotifications();
      }, 30000); // Poll every 30 seconds as fallback
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification: Notification) => {
    // Mark notification as read if it's not already
    if (!notification.read) {
      try {
        await notificationService.markAsRead([notification.id]);
        
        // Update local state immediately
        setUnreadCount(prev => Math.max(0, prev - 1));
        setUnreadNotifications(prev => 
          prev.filter(n => n.id !== notification.id)
        );
        setAllNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Refresh on error
        fetchNotifications();
      }
    }
  }, [fetchNotifications]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state immediately
      setUnreadCount(0);
      setUnreadNotifications([]);
      setAllNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Refresh on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Function to load notifications when dropdown opens
  const loadNotificationsForDropdown = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    unreadCount,
    allNotifications,
    unreadNotifications,
    isLoading,
    isConnected,
    handleNotificationClick,
    handleMarkAllAsRead,
    loadNotificationsForDropdown,
    refreshNotifications: fetchNotifications,
  };
}
