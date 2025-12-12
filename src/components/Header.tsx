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
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
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

      {/* Right Side - Notification */}
      <View style={styles.rightSection}>
        {/* Notification Bell */}
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
