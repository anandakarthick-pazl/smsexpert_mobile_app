/**
 * Notification Context
 * Manages notification state across the app
 */

import React, {createContext, useContext, useState, useCallback, useEffect, useRef} from 'react';
import * as notificationApiService from '../services/notificationApiService';
import {Notification, UnreadCountResponse, getNotificationById} from '../services/notificationApiService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  adminUnread: number;
  pushUnread: number;
  acknowledgementRequired: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  acknowledgeNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  getNotification: (notificationId: string) => Promise<Notification | null>;
  findNotificationById: (notificationId: string) => Notification | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({children}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnread, setAdminUnread] = useState(0);
  const [pushUnread, setPushUnread] = useState(0);
  const [acknowledgementRequired, setAcknowledgementRequired] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  
  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await notificationApiService.getNotifications(page, 20, false);
      
      if (result.success && result.data) {
        const newNotifications = result.data.items;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setCurrentPage(result.data.pagination.current_page);
        setHasMore(result.data.pagination.has_more);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationApiService.getUnreadCount();
      
      if (result.success && result.data) {
        setUnreadCount(result.data.unread_count);
        setAdminUnread(result.data.admin_unread);
        setPushUnread(result.data.push_unread);
        setAcknowledgementRequired(result.data.acknowledgement_required);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  /**
   * Refresh all notifications (reset to page 1)
   */
  const refreshNotifications = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchNotifications(1, false);
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  /**
   * Load more notifications (pagination)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    await fetchNotifications(nextPage, true);
  }, [hasMore, isLoading, currentPage, fetchNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationApiService.markAsRead(notificationId);
      
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? {...n, is_read: true, read_at: new Date().toISOString()} 
              : n
          )
        );
        
        // Decrease unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Refresh count to get accurate numbers
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchUnreadCount]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationApiService.markAllAsRead();
      
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({...n, is_read: true, read_at: new Date().toISOString()}))
        );
        
        // Reset unread count
        setUnreadCount(0);
        setAdminUnread(0);
        setPushUnread(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  /**
   * Acknowledge notification
   */
  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationApiService.acknowledgeNotification(notificationId);
      
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? {...n, is_acknowledged: true, acknowledged_at: new Date().toISOString()} 
              : n
          )
        );
        
        // Decrease acknowledgement required count
        setAcknowledgementRequired(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationApiService.deleteNotification(notificationId);
      
      if (result.success) {
        // Remove from local state
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Update unread count if notification was unread
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  /**
   * Refresh unread count only
   */
  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  /**
   * Get a specific notification by ID from API
   */
  const getNotification = useCallback(async (notificationId: string): Promise<Notification | null> => {
    try {
      // First check if notification is already in local state
      const localNotification = notifications.find(
        n => n.id === notificationId || n.notification_id?.toString() === notificationId
      );
      
      if (localNotification) {
        return localNotification;
      }

      // Fetch from API
      const result = await getNotificationById(notificationId);
      
      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting notification:', error);
      return null;
    }
  }, [notifications]);

  /**
   * Find a notification in local state by ID
   */
  const findNotificationById = useCallback((notificationId: string): Notification | undefined => {
    return notifications.find(
      n => n.id === notificationId || n.notification_id?.toString() === notificationId
    );
  }, [notifications]);

  // Start polling for unread count when provider mounts
  useEffect(() => {
    // Initial fetch
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUnreadCount();
    }

    // Poll every 60 seconds for new notifications
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    adminUnread,
    pushUnread,
    acknowledgementRequired,
    isLoading,
    hasMore,
    currentPage,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    acknowledgeNotification,
    deleteNotification,
    refreshUnreadCount,
    getNotification,
    findNotificationById,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
