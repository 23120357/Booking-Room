import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

export type NotificationType =
  | 'SYSTEM'
  | 'DEPOSIT'
  | 'NEW_MESSAGE'
  | 'SUPPORT'
  | 'VIOLATION'
  | 'ROOM_APPROVAL'
  | 'REVIEW';

export type NotificationStatus = 'UNREAD' | 'READ';

export interface NotificationItem {
  notification_id: string;
  title: string;
  content: string;
  notification_type: NotificationType;
  status: NotificationStatus;
  created_at: string;
}

export interface NotificationList {
  items: NotificationItem[];
  total: number;
  page: number;
  limit: number;
}

export const notificationService = {
  list: (page = 1, limit = 50) =>
    apiClient.get<ApiResponse<NotificationList>>(`/notifications?page=${page}&limit=${limit}`),

  markRead: (notificationId: string) =>
    apiClient.patch<ApiResponse<NotificationItem>>(`/notifications/${notificationId}/read`),
};
