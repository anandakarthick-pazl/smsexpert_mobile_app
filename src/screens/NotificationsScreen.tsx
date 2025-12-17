/**
 * Notifications Screen
 * Display list of all notifications with detail view
 */

import React, {useEffect, useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {useNotifications} from '../context/NotificationContext';
import {Notification} from '../services/notificationApiService';

interface NotificationsScreenProps {
  navigation: any;
  route?: {
    params?: {
      notification_id?: string;
      highlightId?: string;
    };
  };
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({navigation, route}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    acknowledgeNotification,
    deleteNotification,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const highlightAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Refresh notifications when screen mounts
    refreshNotifications();
  }, []);

  // Handle notification_id from navigation params (when clicking push notification)
  useEffect(() => {
    if (route?.params?.notification_id) {
      const notificationId = route.params.notification_id;
      console.log('Opening notification from params:', notificationId);
      
      // Set highlighted ID for visual feedback
      setHighlightedId(notificationId);
      
      // Start highlight animation
      Animated.sequence([
        Animated.timing(highlightAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(2000),
        Animated.timing(highlightAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setHighlightedId(null);
      });
      
      // Find and open the notification after data is loaded
      setTimeout(() => {
        const notification = notifications.find(
          n => n.id === notificationId || n.notification_id?.toString() === notificationId
        );
        if (notification) {
          handleNotificationPress(notification);
          // Scroll to notification
          const index = notifications.findIndex(
            n => n.id === notificationId || n.notification_id?.toString() === notificationId
          );
          if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({index, animated: true, viewPosition: 0.5});
          }
        }
      }, 500);
    }
  }, [route?.params?.notification_id, notifications]);

  // Handle highlightId from navigation params
  useEffect(() => {
    if (route?.params?.highlightId) {
      setHighlightedId(route.params.highlightId);
      
      // Animate highlight
      Animated.sequence([
        Animated.timing(highlightAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(2000),
        Animated.timing(highlightAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setHighlightedId(null);
      });
    }
  }, [route?.params?.highlightId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMoreNotifications();
    }
  }, [isLoading, hasMore, loadMoreNotifications]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Show detail modal
    setSelectedNotification(notification);
    setDetailModalVisible(true);
  }, [markAsRead]);

  const handleDetailClose = useCallback(() => {
    setDetailModalVisible(false);
    setSelectedNotification(null);
  }, []);

  const handleDetailAction = useCallback((notification: Notification) => {
    // Close modal first
    setDetailModalVisible(false);
    setSelectedNotification(null);

    // Handle navigation based on notification data
    if (notification.data?.screen && notification.data.screen !== 'Notifications') {
      navigation.navigate(notification.data.screen, notification.data);
    } else if (notification.data?.action === 'top_up_wallet') {
      navigation.navigate('BuySms');
    }
  }, [navigation]);

  const handleAcknowledge = useCallback(async (notification: Notification) => {
    if (notification.requires_acknowledgement && !notification.is_acknowledged) {
      await acknowledgeNotification(notification.id);
      // Update selected notification if in detail view
      if (selectedNotification?.id === notification.id) {
        setSelectedNotification({
          ...notification,
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        });
      }
    }
  }, [acknowledgeNotification, selectedNotification]);

  const handleDelete = useCallback((notification: Notification) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(notification.id);
            // Close detail modal if deleting the selected notification
            if (selectedNotification?.id === notification.id) {
              setDetailModalVisible(false);
              setSelectedNotification(null);
            }
          },
        },
      ]
    );
  }, [deleteNotification, selectedNotification]);

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount > 0) {
      Alert.alert(
        'Mark All as Read',
        `Mark all ${unreadCount} unread notifications as read?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Mark All Read',
            onPress: markAllAsRead,
          },
        ]
      );
    }
  }, [unreadCount, markAllAsRead]);

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

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const renderNotificationItem = ({item, index}: {item: Notification; index: number}) => {
    const isHighlighted = highlightedId === item.id || highlightedId === item.notification_id?.toString();
    
    const backgroundColor = isHighlighted 
      ? highlightAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['#ffffff', '#fff3cd'],
        })
      : item.is_read ? '#ffffff' : '#fff8f5';

    return (
      <Animated.View style={{backgroundColor}}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !item.is_read && styles.notificationItemUnread,
          ]}
          onPress={() => handleNotificationPress(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.notificationIcon, {backgroundColor: `${getTypeColor(item.type)}15`}]}>
            <Text style={styles.notificationIconText}>{getIconForType(item.type)}</Text>
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, !item.is_read && styles.notificationTitleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message_preview || item.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <Text style={styles.notificationTime}>{item.time_ago}</Text>
              
              <View style={styles.notificationBadges}>
                <View style={[styles.sourceBadge, item.source === 'push' ? styles.pushBadge : styles.adminBadge]}>
                  <Text style={styles.sourceBadgeText}>
                    {item.source === 'push' ? 'Push' : 'Admin'}
                  </Text>
                </View>
                
                {item.requires_acknowledgement && !item.is_acknowledged && (
                  <TouchableOpacity
                    style={styles.acknowledgeButton}
                    onPress={() => handleAcknowledge(item)}
                  >
                    <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        {filter === 'unread' 
          ? "You're all caught up! No unread notifications."
          : "You don't have any notifications yet."}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || refreshing) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ea6118" />
      </View>
    );
  };

  // Notification Detail Modal
  const renderDetailModal = () => {
    if (!selectedNotification) return null;

    return (
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleDetailClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalTypeIcon, {backgroundColor: `${getTypeColor(selectedNotification.type)}20`}]}>
                  <Text style={styles.modalTypeIconText}>{getIconForType(selectedNotification.type)}</Text>
                </View>
                <Text style={styles.modalTitle} numberOfLines={2}>{selectedNotification.title}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleDetailClose}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalMeta}>
                <View style={[styles.sourceBadge, selectedNotification.source === 'push' ? styles.pushBadge : styles.adminBadge]}>
                  <Text style={styles.sourceBadgeText}>
                    {selectedNotification.source === 'push' ? 'Push Notification' : 'Admin Notification'}
                  </Text>
                </View>
                <Text style={styles.modalTime}>{selectedNotification.time_ago}</Text>
              </View>

              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

              {selectedNotification.requires_acknowledgement && (
                <View style={styles.acknowledgementSection}>
                  {selectedNotification.is_acknowledged ? (
                    <View style={styles.acknowledgedBadge}>
                      <Text style={styles.acknowledgedBadgeText}>✓ Acknowledged</Text>
                      {selectedNotification.acknowledged_at && (
                        <Text style={styles.acknowledgedTime}>
                          {new Date(selectedNotification.acknowledged_at).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.acknowledgeButtonLarge}
                      onPress={() => handleAcknowledge(selectedNotification)}
                    >
                      <Text style={styles.acknowledgeButtonLargeText}>Acknowledge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {selectedNotification.data?.screen && selectedNotification.data.screen !== 'Notifications' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDetailAction(selectedNotification)}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedNotification.data?.action === 'top_up_wallet' ? 'Top Up Wallet' : 'View Details'}
                  </Text>
                </TouchableOpacity>
              )}

              {selectedNotification.data?.action === 'top_up_wallet' && !selectedNotification.data?.screen && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    handleDetailClose();
                    navigation.navigate('BuySms');
                  }}
                >
                  <Text style={styles.actionButtonText}>Top Up Wallet</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(selectedNotification)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDetailClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      <View style={styles.container}>
        <Header
          title="Notifications"
          onMenuPress={() => navigation.openDrawer()}
          showBack
          onBackPress={() => navigation.goBack()}
        />

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#ea6118']}
              tintColor="#ea6118"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            // Handle scroll to index failure
            setTimeout(() => {
              if (flatListRef.current && filteredNotifications.length > 0) {
                flatListRef.current.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }
            }, 100);
          }}
        />

        {renderDetailModal()}
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  filterTabActive: {
    backgroundColor: '#293B50',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    fontSize: 13,
    color: '#ea6118',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationItemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#ea6118',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: '700',
    color: '#293B50',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ea6118',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  notificationBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adminBadge: {
    backgroundColor: '#e7f1ff',
  },
  pushBadge: {
    backgroundColor: '#fff3cd',
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#495057',
  },
  acknowledgeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#dc3545',
  },
  acknowledgeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
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
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  modalTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTypeIconText: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293B50',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTime: {
    fontSize: 13,
    color: '#adb5bd',
  },
  modalMessage: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 20,
  },
  acknowledgementSection: {
    marginBottom: 20,
  },
  acknowledgedBadge: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acknowledgedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
  },
  acknowledgedTime: {
    fontSize: 12,
    color: '#155724',
    marginTop: 4,
  },
  acknowledgeButtonLarge: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  acknowledgeButtonLargeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#ea6118',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
  },
  closeButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#293B50',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default NotificationsScreen;
