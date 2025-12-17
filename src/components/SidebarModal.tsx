import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Alert,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import WalletContext from App
import {WalletContext} from '../../App';

const {width} = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// Storage key for app mode
const APP_MODE_KEY = '@sms_expert_app_mode';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

// Dashboard Menu Items
const dashboardMenuItems: MenuItem[] = [
  {name: 'Dashboard', icon: '🏠', route: 'Dashboard'},
  {name: 'SMS Wallet', icon: '💰', route: 'SMSWallet'},
  {name: 'Buy SMS', icon: '🛒', route: 'BuySms'},
  {name: 'Invoices', icon: '🧾', route: 'Invoices'},
  {name: 'Send New SMS', icon: '📤', route: 'SendSMS'},
  {name: 'Received SMS', icon: '📥', route: 'ReceivedSMS'},
  {name: 'Sent SMS', icon: '💬', route: 'SentSMS'},
  {name: 'Keywords', icon: '🔑', route: 'Keywords'},
  {name: 'Numbers', icon: '📋', route: 'Numbers'},
  {name: 'Groups', icon: '👥', route: 'Groups'},
  {name: 'Client Profile', icon: '👤', route: 'Profile'},
  {name: 'Contracts', icon: '📄', route: 'Contracts'},
  {name: 'Delivery Receipt', icon: '📖', route: 'DeliveryReceipt'},
  {name: 'STOPs/Optouts', icon: '🛟', route: 'Stops'},
  {name: 'Blacklist', icon: '🚫', route: 'Blacklist'},
];

// Campaign Manager Menu Items with access control
// Access codes: m = main dashboard, c = campaign, a = accounts
// Combined: mc, ca, mca
interface CampaignMenuItem {
  name: string;
  icon: string;
  route: string;
  allowedAccess: string[]; // Which dashboard_access values can see this menu
}

const campaignMenuItemsWithAccess: CampaignMenuItem[] = [
  {
    name: 'Campaign Dashboard',
    icon: '🏠',
    route: 'CampaignHome',
    allowedAccess: ['m', 'c', 'a', 'mc', 'ca', 'mca'],
  },
  {
    name: 'Quick Campaign',
    icon: '📤',
    route: 'CampaignQuick',
    allowedAccess: ['c', 'mc', 'ca', 'mca'],
  },
  {
    name: 'Bulk Campaign',
    icon: '📁',
    route: 'CampaignFile',
    allowedAccess: ['c', 'mc', 'ca', 'mca'],
  },
  {
    name: 'Campaigns History',
    icon: '📋',
    route: 'CampaignHistory',
    allowedAccess: ['c', 'mc', 'ca', 'mca'],
  },
  {
    name: 'STOP Blacklist',
    icon: '🚫',
    route: 'CampaignBlacklist',
    allowedAccess: ['c', 'mc', 'ca', 'mca'],
  },
  {
    name: 'View Accounts',
    icon: '👥',
    route: 'CampaignAccounts',
    allowedAccess: ['c', 'a', 'mc', 'ca', 'mca'],
  },
  {
    name: 'New Sub-Account',
    icon: '➕',
    route: 'CampaignAddAccount',
    allowedAccess: ['a', 'ca', 'mca'],
  },
];

interface SidebarModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onLogoutAllDevices?: () => void;
  currentRoute: string;
  userName?: string;
  companyName?: string;
  isCampaignMode: boolean;
  onModeChange: (isCampaign: boolean) => void;
  dashboardAccess?: string; // m, c, a, mc, ca, mca - for campaign menu filtering
}

const SidebarModal: React.FC<SidebarModalProps> = ({
  visible,
  onClose,
  onNavigate,
  onLogout,
  onLogoutAllDevices,
  currentRoute,
  userName = 'John Doe',
  companyName = 'Dashboard User',
  isCampaignMode,
  onModeChange,
  dashboardAccess = 'mca', // Default to full access
}) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  // Get wallet balance from context
  const {walletBalance} = useContext(WalletContext);

  // Filter campaign menu items based on dashboard access
  const filteredCampaignMenuItems = campaignMenuItemsWithAccess.filter(item =>
    item.allowedAccess.includes(dashboardAccess.toLowerCase())
  );

  // Get current menu items based on mode
  const menuItems: MenuItem[] = isCampaignMode
    ? filteredCampaignMenuItems.map(({name, icon, route}) => ({name, icon, route}))
    : dashboardMenuItems;
  
  // Get user type based on mode
  const userType = isCampaignMode ? 'Campaign User' : 'Dashboard User';

  useEffect(() => {
    console.log('SidebarModal useEffect - visible:', visible);
    if (visible) {
      setIsAnimating(true);
      // Reset to closed position first
      slideAnim.setValue(-SIDEBAR_WIDTH);
      fadeAnim.setValue(0);
      
      // Then animate open
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
      ]).start(() => {
        setIsAnimating(false);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = (route: string) => {
    console.log('Navigating to:', route);
    handleClose();
    setTimeout(() => {
      onNavigate(route);
    }, 100);
  };

  const handleSwitchMode = async () => {
    const newMode = !isCampaignMode;
    
    // Save mode to AsyncStorage
    try {
      await AsyncStorage.setItem(APP_MODE_KEY, newMode ? 'campaign' : 'dashboard');
      console.log('App mode saved:', newMode ? 'campaign' : 'dashboard');
    } catch (error) {
      console.error('Error saving app mode:', error);
    }
    
    // Update mode in parent
    onModeChange(newMode);
    
    // Navigate to appropriate dashboard
    handleClose();
    setTimeout(() => {
      if (newMode) {
        onNavigate('CampaignHome');
      } else {
        onNavigate('Dashboard');
      }
    }, 100);
  };

  const handleClose = () => {
    console.log('SidebarModal: handleClose called');
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
    ]).start(() => {
      onClose();
    });
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      'Logout All Devices',
      'Are you sure you want to logout from all devices? You will need to login again on all your devices.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: () => {
            handleClose();
            setTimeout(() => {
              if (onLogoutAllDevices) {
                onLogoutAllDevices();
              }
            }, 300);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            handleClose();
            setTimeout(() => {
              onLogout();
            }, 300);
          },
        },
      ]
    );
  };

  console.log('SidebarModal render - visible:', visible, 'at', new Date().toISOString());

  // Log when visible prop changes
  useEffect(() => {
    console.log('SidebarModal: visible changed to', visible);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
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

          {/* Wallet Balance Section */}
          <View style={styles.walletSection}>
            <View style={styles.walletCard}>
              <View style={styles.walletIconContainer}>
                <Text style={styles.walletIcon}>💳</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletAmount}>{walletBalance}</Text>
              </View>
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

            {/* Divider */}
            <View style={styles.menuDivider} />

            {/* Settings Section */}
            <Text style={styles.sectionTitle}>Settings</Text>

            {/* Change Password */}
            <Pressable
              style={({pressed}) => [
                styles.menuItem,
                currentRoute === 'ChangePassword' && styles.menuItemActive,
                pressed && currentRoute !== 'ChangePassword' && styles.menuItemPressed,
              ]}
              onPress={() => handleNavigate('ChangePassword')}>
              <View style={[styles.menuIconContainer, styles.menuIconContainerSettings]}>
                <Text style={styles.menuItemIcon}>🔐</Text>
              </View>
              <Text style={[
                styles.menuItemText,
                currentRoute === 'ChangePassword' && styles.menuItemTextActive,
              ]}>
                Change Password
              </Text>
            </Pressable>

            {/* Logout All Devices */}
            <Pressable
              style={({pressed}) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={handleLogoutAllDevices}>
              <View style={[styles.menuIconContainer, styles.menuIconContainerWarning]}>
                <Text style={styles.menuItemIcon}>📱</Text>
              </View>
              <Text style={styles.menuItemText}>
                Logout All Devices
              </Text>
            </Pressable>
          </ScrollView>

          {/* Logout Button */}
          <View style={styles.footer}>
            <Pressable
              style={({pressed}) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#293B50',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
  walletSection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  walletIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  walletIcon: {
    fontSize: 18,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
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
  menuIconContainerSettings: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuIconContainerWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
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
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  footer: {
    padding: 12,
    paddingBottom: Platform.OS === 'android' ? 50 : 40,
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
