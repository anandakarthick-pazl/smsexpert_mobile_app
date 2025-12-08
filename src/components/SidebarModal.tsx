import React, {useEffect, useRef, useState} from 'react';
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
  Pressable,
} from 'react-native';

const {width} = Dimensions.get('window');
const SIDEBAR_WIDTH = 250;

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

// Dashboard Menu Items
const dashboardMenuItems: MenuItem[] = [
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
  {name: 'Delivery Receipt', icon: '📖', route: 'DeliveryReceipt'},
  {name: 'STOPs/Optouts', icon: '🛟', route: 'Stops'},
  {name: 'Blacklist', icon: '🚫', route: 'Blacklist'},
];

// Campaign Manager Menu Items
const campaignMenuItems: MenuItem[] = [
  {name: 'Campaign Dashboard', icon: '🏠', route: 'CampaignHome'},
  {name: 'Quick Campaign', icon: '📤', route: 'CampaignQuick'},
  {name: 'Bulk Campaign', icon: '📁', route: 'CampaignFile'},
  {name: 'Campaigns History', icon: '📋', route: 'CampaignHistory'},
  {name: 'STOP Blacklist', icon: '🚫', route: 'CampaignBlacklist'},
  {name: 'View Accounts', icon: '👥', route: 'CampaignAccounts'},
  {name: 'New Sub-Account', icon: '➕', route: 'CampaignAddAccount'},
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
  const [isCampaignMode, setIsCampaignMode] = useState(false);

  // Get current menu items based on mode
  const menuItems = isCampaignMode ? campaignMenuItems : dashboardMenuItems;
  
  // Get user type based on mode
  const userType = isCampaignMode ? 'Campaign User' : 'Dashboard User';

  useEffect(() => {
    console.log('SidebarModal visible changed:', visible);
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
    console.log('Navigating to:', route);
    onNavigate(route);
  };

  const handleSwitchMode = () => {
    setIsCampaignMode(!isCampaignMode);
  };

  const handleClose = () => {
    console.log('Closing sidebar');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable 
          style={styles.backdropPressable}
          onPress={handleClose}>
          <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]} />
        </Pressable>

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
            <Pressable 
              style={({pressed}) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]} 
              onPress={handleClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* User Info Section */}
          <View style={styles.userSection}>
            <View style={[styles.userAvatar, isCampaignMode && styles.userAvatarCampaign]}>
              <Text style={styles.userAvatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.companyName}>{userName}</Text>
              <Text style={styles.userName}>{userType}</Text>
            </View>
          </View>

          {/* Switch Mode Button */}
          <Pressable
            style={({pressed}) => [
              styles.switchButton,
              isCampaignMode && styles.switchButtonCampaign,
              pressed && styles.switchButtonPressed,
            ]}
            onPress={handleSwitchMode}>
            <Text style={styles.switchIcon}>🔄</Text>
            <Text style={[styles.switchText, isCampaignMode && styles.switchTextCampaign]}>
              {isCampaignMode ? 'Switch to Dashboard' : 'Switch to Campaign Manager'}
            </Text>
          </Pressable>

          {/* Menu Items */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}>
            {menuItems.map((item, index) => {
              const isActive = currentRoute === item.route;
              return (
                <Pressable
                  key={index}
                  style={({pressed}) => [
                    styles.menuItem,
                    isActive && (isCampaignMode ? styles.menuItemActiveCampaign : styles.menuItemActive),
                    pressed && !isActive && styles.menuItemPressed,
                  ]}
                  onPress={() => handleNavigate(item.route)}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      isCampaignMode && styles.menuIconContainerCampaign,
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
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Logout Button */}
          <View style={styles.footer}>
            <Pressable
              style={({pressed}) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={onLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
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
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoSMS: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ea6118',
  },
  logoExpert: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeIcon: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ea6118',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarCampaign: {
    backgroundColor: '#0891b2',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  userName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(234, 97, 24, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 97, 24, 0.3)',
  },
  switchButtonCampaign: {
    backgroundColor: 'rgba(8, 145, 178, 0.15)',
    borderColor: 'rgba(8, 145, 178, 0.3)',
  },
  switchButtonPressed: {
    opacity: 0.7,
  },
  switchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea6118',
  },
  switchTextCampaign: {
    color: '#0891b2',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 1,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#ea6118',
  },
  menuItemActiveCampaign: {
    backgroundColor: '#0891b2',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(234, 97, 24, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuIconContainerCampaign: {
    backgroundColor: 'rgba(8, 145, 178, 0.2)',
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemIcon: {
    fontSize: 14,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    padding: 12,
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
  logoutButtonPressed: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc3545',
  },
});

export default SidebarModal;
