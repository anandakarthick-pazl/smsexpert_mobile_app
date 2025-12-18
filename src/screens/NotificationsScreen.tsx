/**
 * Notifications Screen
 * Display list of all notifications
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
  Animated,
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
      fromPush?: boolean;
    };
  };
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({navigation, route}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const highlightAnimation = useRef(new Animated.Value(0)).current;

  // Initial load of notifications
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('NotificationsScreen: Loading initial notifications');
      await refreshNotifications();
      setInitialLoadDone(true);
    };
    loadInitialData();
  }, []);

  // Handle notification_id from navigation params (when clicking push notification)
  useEffect(() => {
    const notificationId = route?.params?.notification_id || route?.params?.highlightId;
    const fromPush = route?.params?.fromPush;
    
    if (notificationId && fromPush) {
      console.log('NotificationsScreen: Received notification_id from push, navigating to detail:', notificationId);
      // Navigate directly to NotificationDetail screen
      navigation.navigate('NotificationDetail', {
        notification_id: notificationId,
        fromPush: true,
      });
    }
  }, [route?.params?.notification_id, route?.params?.highlightId, route?.params?.fromPush, navigation]);

  // Handle highlightId from navigation params (without fromPush - for highlighting in list)
  useEffect(() => {
    if (route?.params?.highlightId && !route?.params?.fromPush && initialLoadDone) {
      const highlightId = route.params.highlightId;
      
      setHighlightedId(highlightId);
      
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
      
      // Scroll to highlighted notification
      const index = notifications.findIndex(
        n => n.id === highlightId || 
             n.notification_id?.toString() === highlightId ||
             n.recipient_id?.toString() === highlightId
      );
      
      if (index !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({index, animated: true, viewPosition: 0.5});
        }, 300);
      }
    }
  }, [route?.params?.highlightId, initialLoadDone, notifications]);

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

  const handleNotificationPress = useCallback((notification: Notification) => {
    console.log('NotificationsScreen: Opening notification detail:', notification.id);
    
    // Navigate to detail screen
    navigation.navigate('NotificationDetail', {
      notification_id: notification.id,
      notification: notification,
    });
  }, [navigation]);

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
          },
        },
      ]
    );
  }, [deleteNotification]);

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

  const renderNotificationItem = ({item}: {item: Notification}) => {
    const isHighlighted = highlightedId === item.id || 
                          highlightedId === item.notification_id?.toString() ||
                          highlightedId === item.recipient_id?.toString();
    
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
                  <View style={styles.acknowledgeIndicator}>
                    <Text style={styles.acknowledgeIndicatorText}>!</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowIcon}>›</Text>
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

        {/* Show loading indicator during initial load */}
        {!initialLoadDone && isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ea6118" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
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
        )}
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
    flexGrow: 1,
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
  acknowledgeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acknowledgeIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#adb5bd',
    fontWeight: '300',
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
});

export default NotificationsScreen;
