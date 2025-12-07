import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const {width} = Dimensions.get('window');
const SIDEBAR_WIDTH = 240;

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

const menuItems: MenuItem[] = [
  {name: 'Dashboard', icon: '🏠', route: 'Dashboard'},
  {name: 'SMS Wallet', icon: '💰', route: 'SMSWallet'},
  {name: 'Send New SMS', icon: '📤', route: 'SendSMS'},
  {name: 'Received SMS', icon: '📥', route: 'ReceivedSMS'},
  {name: 'Sent SMS', icon: '💬', route: 'SentSMS'},
  {name: 'Keywords', icon: '🔑', route: 'Keywords'},
  {name: 'Numbers', icon: '📋', route: 'Numbers'},
  {name: 'Groups', icon: '👥', route: 'Groups'},
  {name: 'Client Profile', icon: '👤', route: 'Profile'},
  {name: 'Contracts', icon: '📄', route: 'Contracts'},
  {name: 'Invoices', icon: '🧾', route: 'Invoices'},
  {name: 'Technical Docs', icon: '💡', route: 'TechDocs'},
  {name: 'Delivery Receipt', icon: '📖', route: 'DeliveryReceipt'},
  {name: 'STOPs/Optouts', icon: '🛟', route: 'Stops'},
  {name: 'Blacklist', icon: '🚫', route: 'Blacklist'},
];

interface SidebarModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  currentRoute: string;
  userName?: string;
  companyName?: string;
}

const SidebarModal: React.FC<SidebarModalProps> = ({
  visible,
  onClose,
  onNavigate,
  onLogout,
  currentRoute,
  userName = 'John Doe',
  companyName = 'Dashboard User',
}) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = (route: string) => {
    onNavigate(route);
  };

  const handleSwitchToCampaignManager = () => {
    console.log('Switch to Campaign Manager');
    // Add your navigation logic here
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]} />
        </TouchableWithoutFeedback>

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {transform: [{translateX: slideAnim}]},
          ]}>
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoSMS}>SMS</Text>
              <Text style={styles.logoExpert}>Expert</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User Info Section */}
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>

          {/* Switch to Campaign Manager */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToCampaignManager}
            activeOpacity={0.7}>
            <Text style={styles.switchIcon}>🔄</Text>
            <Text style={styles.switchText}>Switch to Campaign Manager</Text>
          </TouchableOpacity>

          {/* Menu Items */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}>
            {menuItems.map((item, index) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    isActive && styles.menuItemActive,
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      isActive && styles.menuIconContainerActive,
                    ]}>
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      isActive && styles.menuItemTextActive,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Logout Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
              activeOpacity={0.7}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#293B50',
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoSMS: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ea6118',
  },
  logoExpert: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 1,
  },
  userName: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(234, 97, 24, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 97, 24, 0.3)',
  },
  switchIcon: {
    fontSize: 10,
    marginRight: 6,
  },
  switchText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ea6118',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 1,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#ea6118',
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(234, 97, 24, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemIcon: {
    fontSize: 10,
  },
  menuItemText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  menuItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    padding: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc3545',
  },
});

export default SidebarModal;
