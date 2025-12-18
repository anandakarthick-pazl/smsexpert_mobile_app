/**
 * Notification Detail Screen
 * Display full notification details on a separate page
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {useNotifications} from '../context/NotificationContext';
import {Notification, getNotificationDetail} from '../services/notificationApiService';

interface NotificationDetailScreenProps {
  navigation: any;
  route?: {
    params?: {
      notification_id?: string;
      notification?: Notification;
      fromPush?: boolean;
    };
  };
}

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({navigation, route}) => {
  const {
    markAsRead,
    acknowledgeNotification,
    deleteNotification,
    refreshNotifications,
    refreshUnreadCount,
  } = useNotifications();

  const [notification, setNotification] = useState<Notification | null>(
    route?.params?.notification || null
  );
  const [isLoading, setIsLoading] = useState(!route?.params?.notification);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load notification if not passed via params
  useEffect(() => {
    const loadNotification = async () => {
      const notificationId = route?.params?.notification_id;
      
      if (!notification && notificationId) {
        setIsLoading(true);
        try {
          const result = await getNotificationDetail(notificationId);
          if (result.success && result.data) {
            setNotification(result.data);
            
            // Mark as read if not already
            if (!result.data.is_read) {
              await markAsRead(result.data.id);
            }
          } else {
            Alert.alert('Error', 'Notification not found');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error loading notification:', error);
          Alert.alert('Error', 'Failed to load notification');
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      } else if (notification && !notification.is_read) {
        // Mark as read if passed via params and not already read
        await markAsRead(notification.id);
        setNotification({...notification, is_read: true});
      }
    };

    loadNotification();
  }, [route?.params?.notification_id]);

  const getIconForType = (type: string): string => {
    const icons: Record<string, string> = {
      wallet_low: '💰',
      wallet_insufficient: '⚠️',
      throughput_limit: '🚫',
      system: 'ℹ️',
      info: 'ℹ️',
      warning: '⚠️',
      urgent: '🚨',
      promo: '🎁',
      general: '🔔',
      campaign: '📤',
      delivery: '✅',
      success: '✅',
      danger: '🔴',
      announcement: '📢',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      wallet_low: '#ffc107',
      wallet_insufficient: '#dc3545',
      throughput_limit: '#fd7e14',
      system: '#6c757d',
      info: '#0d6efd',
      warning: '#ffc107',
      urgent: '#dc3545',
      promo: '#6f42c1',
      general: '#293B50',
      campaign: '#20c997',
      delivery: '#198754',
      success: '#198754',
      danger: '#dc3545',
      announcement: '#0dcaf0',
    };
    return colors[type] || '#293B50';
  };

  const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
      wallet_low: 'Low Balance Alert',
      wallet_insufficient: 'Insufficient Funds',
      throughput_limit: 'Limit Reached',
      system: 'System',
      info: 'Information',
      warning: 'Warning',
      urgent: 'Urgent',
      promo: 'Promotion',
      general: 'General',
      campaign: 'Campaign',
      delivery: 'Delivery',
      success: 'Success',
      danger: 'Alert',
      announcement: 'Announcement',
    };
    return names[type] || 'Notification';
  };

  const handleAcknowledge = useCallback(async () => {
    if (!notification || notification.is_acknowledged || isAcknowledging) return;
    
    setIsAcknowledging(true);
    try {
      await acknowledgeNotification(notification.id);
      setNotification({
        ...notification,
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      });
      refreshUnreadCount();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      Alert.alert('Error', 'Failed to acknowledge notification');
    } finally {
      setIsAcknowledging(false);
    }
  }, [notification, acknowledgeNotification, isAcknowledging]);

  const handleDelete = useCallback(() => {
    if (!notification) return;
    
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteNotification(notification.id);
              refreshNotifications();
              refreshUnreadCount();
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [notification, deleteNotification, navigation]);

  const handleAction = useCallback(() => {
    if (!notification) return;
    
    // Handle navigation based on notification data
    if (notification.data?.screen && notification.data.screen !== 'Notifications' && notification.data.screen !== 'NotificationDetail') {
      navigation.navigate(notification.data.screen, notification.data);
    } else if (notification.data?.action === 'top_up_wallet') {
      navigation.navigate('BuySms');
    }
  }, [notification, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <View style={styles.container}>
          <Header
            title="Notification"
            onMenuPress={() => navigation.openDrawer()}
            showBack
            onBackPress={handleGoBack}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ea6118" />
            <Text style={styles.loadingText}>Loading notification...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <View style={styles.container}>
          <Header
            title="Notification"
            onMenuPress={() => navigation.openDrawer()}
            showBack
            onBackPress={handleGoBack}
          />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Notification Not Found</Text>
            <Text style={styles.emptyText}>
              This notification may have been deleted or is no longer available.
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = getTypeColor(notification.type);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <View style={styles.container}>
        <Header
          title="Notification"
          onMenuPress={() => navigation.openDrawer()}
          showBack
          onBackPress={handleGoBack}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={[styles.iconContainer, {backgroundColor: `${typeColor}20`}]}>
              <Text style={styles.iconText}>{getIconForType(notification.type)}</Text>
            </View>
            
            <Text style={styles.title}>{notification.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, {backgroundColor: `${typeColor}15`}]}>
                <Text style={[styles.typeBadgeText, {color: typeColor}]}>
                  {getTypeName(notification.type)}
                </Text>
              </View>
              
              <View style={[styles.sourceBadge, notification.source === 'push' ? styles.pushBadge : styles.adminBadge]}>
                <Text style={styles.sourceBadgeText}>
                  {notification.source === 'push' ? 'Push' : 'Admin'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.timeText}>{notification.time_ago}</Text>
          </View>

          {/* Message Section */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Message</Text>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>{notification.message}</Text>
            </View>
          </View>

          {/* Acknowledgement Section */}
          {notification.requires_acknowledgement && (
            <View style={styles.acknowledgementSection}>
              <Text style={styles.sectionTitle}>Acknowledgement Required</Text>
              
              {notification.is_acknowledged ? (
                <View style={styles.acknowledgedCard}>
                  <View style={styles.acknowledgedHeader}>
                    <Text style={styles.acknowledgedIcon}>✓</Text>
                    <Text style={styles.acknowledgedTitle}>Acknowledged</Text>
                  </View>
                  {notification.acknowledged_at && (
                    <Text style={styles.acknowledgedTime}>
                      {new Date(notification.acknowledged_at).toLocaleString()}
                    </Text>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.acknowledgeButton, isAcknowledging && styles.buttonDisabled]}
                  onPress={handleAcknowledge}
                  disabled={isAcknowledging}
                >
                  {isAcknowledging ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.acknowledgeButtonIcon}>✓</Text>
                      <Text style={styles.acknowledgeButtonText}>Acknowledge This Notification</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Action Button */}
          {(notification.data?.screen && notification.data.screen !== 'Notifications' && notification.data.screen !== 'NotificationDetail') || notification.data?.action === 'top_up_wallet' ? (
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
                <Text style={styles.actionButtonText}>
                  {notification.data?.action === 'top_up_wallet' ? '💰 Top Up Wallet' : '→ View Details'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, notification.is_read ? styles.readBadge : styles.unreadBadge]}>
                  <Text style={[styles.statusBadgeText, notification.is_read ? styles.readBadgeText : styles.unreadBadgeText]}>
                    {notification.is_read ? 'Read' : 'Unread'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{getTypeName(notification.type)}</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Source</Text>
                <Text style={styles.detailValue}>
                  {notification.source === 'push' ? 'Push Notification' : 'Admin Notification'}
                </Text>
              </View>
              
              {notification.created_at && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Received</Text>
                    <Text style={styles.detailValue}>
                      {new Date(notification.created_at).toLocaleString()}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Delete Section */}
          <View style={styles.deleteSection}>
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#dc3545" />
              ) : (
                <>
                  <Text style={styles.deleteButtonIcon}>🗑️</Text>
                  <Text style={styles.deleteButtonText}>Delete Notification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#293B50',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#293B50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#293B50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Header Section
  headerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  adminBadge: {
    backgroundColor: '#e7f1ff',
  },
  pushBadge: {
    backgroundColor: '#fff3cd',
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  timeText: {
    fontSize: 13,
    color: '#adb5bd',
  },
  
  // Message Section
  messageSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
  },
  
  // Acknowledgement Section
  acknowledgementSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  acknowledgedCard: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acknowledgedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acknowledgedIcon: {
    fontSize: 18,
    color: '#155724',
  },
  acknowledgedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
  },
  acknowledgedTime: {
    fontSize: 13,
    color: '#155724',
    marginTop: 6,
  },
  acknowledgeButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  acknowledgeButtonIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  acknowledgeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Action Section
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  actionButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Details Section
  detailsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readBadge: {
    backgroundColor: '#d4edda',
  },
  unreadBadge: {
    backgroundColor: '#fff3cd',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readBadgeText: {
    color: '#155724',
  },
  unreadBadgeText: {
    color: '#856404',
  },
  
  // Delete Section
  deleteSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f8d7da',
    gap: 8,
  },
  deleteButtonIcon: {
    fontSize: 16,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc3545',
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  bottomSpacer: {
    height: 40,
  },
});

export default NotificationDetailScreen;
