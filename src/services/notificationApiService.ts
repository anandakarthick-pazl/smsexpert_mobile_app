/**
 * Notification API Service
 * Handle notification API calls and FCM token management
 */

import {get, post, del} from './apiService';

export interface Notification {
  id: string;
  notification_id: number;
  source: 'admin' | 'push';
  title: string;
  message: string;
  message_preview: string;
  type: string;
  icon: string;
  priority: string;
  requires_acknowledgement: boolean;
  is_read: boolean;
  is_acknowledged: boolean;
  read_at: string | null;
  acknowledged_at: string | null;
  created_at: string;
  time_ago: string;
  data: any;
}

export interface NotificationListResponse {
  items: Notification[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
  admin_unread: number;
  push_unread: number;
  acknowledgement_required: number;
}

export interface MaintenanceStatus {
  is_maintenance: boolean;
  message: string;
  end_time: string | null;
}

/**
 * Get all notifications
 */
export const getNotifications = async (
  page: number = 1,
  perPage: number = 20,
  unreadOnly: boolean = false,
  source?: 'admin' | 'push'
): Promise<{success: boolean; data?: NotificationListResponse; message?: string}> => {
  try {
    let endpoint = `notifications?page=${page}&per_page=${perPage}`;
    
    if (unreadOnly) {
      endpoint += '&unread_only=true';
    }
    
    if (source) {
      endpoint += `&source=${source}`;
    }

    const response = await get<NotificationListResponse>(endpoint, true, false);

    if (response.status && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to fetch notifications',
    };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch notifications',
    };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<{success: boolean; data?: UnreadCountResponse; message?: string}> => {
  try {
    const response = await get<UnreadCountResponse>('notifications/unread-count', true, false);

    if (response.status && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to get unread count',
    };
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return {
      success: false,
      message: error.message || 'Failed to get unread count',
    };
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  notificationId: string
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await post(`notifications/${notificationId}/read`, {}, true, false);

    if (response.status) {
      return {success: true};
    }

    return {
      success: false,
      message: response.message || 'Failed to mark as read',
    };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.message || 'Failed to mark as read',
    };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{success: boolean; data?: {marked_count: number}; message?: string}> => {
  try {
    const response = await post<{marked_count: number}>('notifications/mark-all-read', {}, true, false);

    if (response.status) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to mark all as read',
    };
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return {
      success: false,
      message: error.message || 'Failed to mark all as read',
    };
  }
};

/**
 * Acknowledge notification
 */
export const acknowledgeNotification = async (
  notificationId: string
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await post(`notifications/${notificationId}/acknowledge`, {}, true, false);

    if (response.status) {
      return {success: true};
    }

    return {
      success: false,
      message: response.message || 'Failed to acknowledge',
    };
  } catch (error: any) {
    console.error('Error acknowledging notification:', error);
    return {
      success: false,
      message: error.message || 'Failed to acknowledge',
    };
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await del(`notifications/${notificationId}`, true, false);

    if (response.status) {
      return {success: true};
    }

    return {
      success: false,
      message: response.message || 'Failed to delete notification',
    };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete notification',
    };
  }
};

/**
 * Register FCM token
 */
export const registerFcmToken = async (
  fcmToken: string,
  deviceId?: string,
  deviceName?: string,
  deviceType?: 'ios' | 'android'
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await post('notifications/fcm-token', {
      fcm_token: fcmToken,
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType,
    }, true, false);

    if (response.status) {
      return {success: true};
    }

    return {
      success: false,
      message: response.message || 'Failed to register FCM token',
    };
  } catch (error: any) {
    console.error('Error registering FCM token:', error);
    return {
      success: false,
      message: error.message || 'Failed to register FCM token',
    };
  }
};

/**
 * Unregister FCM token
 */
export const unregisterFcmToken = async (
  deviceId?: string
): Promise<{success: boolean; message?: string}> => {
  try {
    const response = await del(`notifications/fcm-token${deviceId ? `?device_id=${deviceId}` : ''}`, true, false);

    if (response.status) {
      return {success: true};
    }

    return {
      success: false,
      message: response.message || 'Failed to unregister FCM token',
    };
  } catch (error: any) {
    console.error('Error unregistering FCM token:', error);
    return {
      success: false,
      message: error.message || 'Failed to unregister FCM token',
    };
  }
};

/**
 * Check maintenance mode status
 */
export const checkMaintenanceMode = async (): Promise<{success: boolean; data?: MaintenanceStatus; message?: string}> => {
  try {
    const response = await get<MaintenanceStatus>('maintenance-status', true, false);

    if (response.status && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    // If endpoint doesn't exist or returns error, assume not in maintenance
    return {
      success: true,
      data: {
        is_maintenance: false,
        message: '',
        end_time: null,
      },
    };
  } catch (error: any) {
    console.error('Error checking maintenance mode:', error);
    // If error, assume not in maintenance
    return {
      success: true,
      data: {
        is_maintenance: false,
        message: '',
        end_time: null,
      },
    };
  }
};

/**
 * Get single notification by ID
 */
export const getNotificationById = async (
  notificationId: string
): Promise<{success: boolean; data?: Notification; message?: string}> => {
  try {
    const response = await get<Notification>(`notifications/${notificationId}`, true, false);

    if (response.status && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to fetch notification',
    };
  } catch (error: any) {
    console.error('Error fetching notification:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch notification',
    };
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  acknowledgeNotification,
  deleteNotification,
  registerFcmToken,
  unregisterFcmToken,
  checkMaintenanceMode,
  getNotificationById,
};
