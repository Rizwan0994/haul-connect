// Notification API Service
import apiClient from "./api-client";

const API_URL = "/notifications";

export interface Notification {
  id: number;
  user_id: number | null;
  email: string | null;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  link?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface NotificationCountResponse {
  count: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  category: string | null;
  role: string | null;
  userRole?: {
    id: number;
    name: string;
    description?: string;
  } | null;
}

export interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  byType: {
    info: number;
    warning: number;
    error: number;
    success: number;
  };
  bySource: {
    custom: number;
    system: number;
  };
  topSenders: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminNotificationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  source?: string;
  sender_id?: number;
  status?: 'read' | 'unread';
  start_date?: string;
  end_date?: string;
}

const getUserNotifications = async (
  page = 1,
  limit = 20,
  readStatus?: boolean
): Promise<NotificationResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (readStatus !== undefined) {
    queryParams.append('read', readStatus.toString());  }
  
  const response = await apiClient.get(`${API_URL}?${queryParams.toString()}`);
  return response.data.data;
};

const getUnreadCount = async (): Promise<NotificationCountResponse> => {
  const response = await apiClient.get(`${API_URL}/unread-count`);
  return response.data.data;
};

const markAsRead = async (ids: number[]): Promise<void> => {
  await apiClient.put(`${API_URL}/mark-read`, { ids });
};

const markAllAsRead = async (): Promise<void> => {
  await apiClient.put(`${API_URL}/mark-all-read`);
};

const createNotification = async (notification: {
  user_id?: number;
  email?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  link?: string;
}): Promise<Notification> => {
  const response = await apiClient.post(API_URL, notification);
  return response.data.data;
};

const deleteNotification = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${id}`);
};

// Admin functions
const getAllNotifications = async (filters: AdminNotificationFilters = {}): Promise<NotificationResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`${API_URL}/admin/all?${queryParams.toString()}`);
  return response.data.data;
};

const getNotificationStats = async (dateRange = '30d'): Promise<NotificationStats> => {
  const response = await apiClient.get(`${API_URL}/admin/stats?dateRange=${dateRange}`);
  return response.data.data;
};

const getAllUsersForNotification = async (): Promise<User[]> => {
  const response = await apiClient.get(`${API_URL}/admin/users`);
  return response.data.data;
};

const sendCustomNotification = async (notification: {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  user_ids: number[];
  link?: string;
}): Promise<void> => {
  await apiClient.post(`${API_URL}/admin/send-custom`, notification);
};

const deleteMultipleNotifications = async (ids: number[]): Promise<void> => {
  await apiClient.delete(`${API_URL}/admin/bulk-delete`, { data: { ids } });
};

const getAdminNotifications = async (queryString: string): Promise<NotificationResponse> => {
  const response = await apiClient.get(`${API_URL}/admin/all?${queryString}`);
  return response.data.data;
};

const getAdminUsers = async (): Promise<any[]> => {
  const response = await apiClient.get(`${API_URL}/admin/users`);
  return response.data.data;
};

export const notificationService = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  // Admin functions
  getAllNotifications,
  getNotificationStats,
  getAllUsersForNotification,
  sendCustomNotification,
  deleteMultipleNotifications,
  getAdminNotifications,
  getAdminUsers
};
