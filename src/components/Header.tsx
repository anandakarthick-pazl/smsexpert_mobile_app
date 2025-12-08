import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  onNotificationPress?: () => void;
  onFilterPress?: () => void;
  notificationCount?: number;
  walletBalance?: string;
  showFilter?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuPress,
  onNotificationPress,
  onFilterPress,
  notificationCount = 0,
  walletBalance = '£0',
  showFilter = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Menu Button */}
      <Pressable
        style={({pressed}) => [
          styles.menuButton,
          pressed && styles.menuButtonPressed,
        ]}
        onPress={() => {
          console.log('Menu button pressed');
          onMenuPress();
        }}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Title */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      {/* Right Side - Wallet, Filter & Notification */}
      <View style={styles.rightSection}>
        {/* Wallet Balance - Always visible */}
        <View style={styles.walletBadge}>
          <Text style={styles.walletIcon}>💳</Text>
          <Text style={styles.walletText}>{walletBalance}</Text>
        </View>

        {/* Filter Icon - Only on Dashboard */}
        {showFilter && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onFilterPress}
            activeOpacity={0.7}>
            <Text style={styles.filterIcon}>📅</Text>
          </TouchableOpacity>
        )}
        
        {/* Notification Bell - Always visible */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}>
          <Text style={styles.bellIcon}>🔔</Text>
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#293B50',
    zIndex: 100,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{scale: 0.95}],
  },
  menuIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  walletIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIcon: {
    fontSize: 20,
  },
  bellIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default Header;
