import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#293B50',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  walletIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  walletText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIcon: {
    fontSize: 14,
  },
  bellIcon: {
    fontSize: 14,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default Header;
