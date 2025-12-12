/**
 * SMS Expert Mobile App
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet, Text, Alert} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SMSWalletScreen from './src/screens/SMSWalletScreen';
import SendNewSMSScreen from './src/screens/SendNewSMSScreen';
import ReceivedSMSScreen from './src/screens/ReceivedSMSScreen';
import SentSMSScreen from './src/screens/SentSMSScreen';
import KeywordsScreen from './src/screens/KeywordsScreen';
import NumbersScreen from './src/screens/NumbersScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ContractsScreen from './src/screens/ContractsScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import DeliveryReceiptScreen from './src/screens/DeliveryReceiptScreen';
import BlacklistScreen from './src/screens/BlacklistScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import CampaignDashboardScreen from './src/screens/CampaignDashboardScreen';
import QuickCampaignScreen from './src/screens/QuickCampaignScreen';
import BulkCampaignScreen from './src/screens/BulkCampaignScreen';
import CampaignHistoryScreen from './src/screens/CampaignHistoryScreen';
import CampaignBlacklistScreen from './src/screens/CampaignBlacklistScreen';
import CampaignAccountsScreen from './src/screens/CampaignAccountsScreen';
import CampaignAddAccountScreen from './src/screens/CampaignAddAccountScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import SidebarModal from './src/components/SidebarModal';

// Import Toast Provider
import {ToastProvider, useToast, setGlobalToast} from './src/context/ToastContext';

// Import services
import * as authService from './src/services/authService';
import {User} from './src/services/authService';
import {getWalletBalance, formatWalletBalance} from './src/services/walletService';
import * as notificationService from './src/services/notificationService';

type ScreenName = 
  | 'Login' 
  | 'Dashboard' 
  | 'SMSWallet' 
  | 'SendSMS' 
  | 'ReceivedSMS'
  | 'SentSMS' 
  | 'Keywords' 
  | 'Numbers' 
  | 'Groups' 
  | 'Profile' 
  | 'Contracts'
  | 'Invoices' 
  | 'TechDocs' 
  | 'DeliveryReceipt' 
  | 'Stops' 
  | 'Blacklist'
  | 'ChangePassword'
  | 'CampaignHome'
  | 'CampaignQuick'
  | 'CampaignFile'
  | 'CampaignHistory'
  | 'CampaignBlacklist'
  | 'CampaignAccounts'
  | 'CampaignAddAccount';

// Create a global wallet balance context to share across components
export const WalletContext = React.createContext<{
  walletBalance: string;
  refreshWallet: () => Promise<void>;
}>({
  walletBalance: '£0.00',
  refreshWallet: async () => {},
});

// Main App Content Component
function AppContent(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('£0.00');
  
  // Get toast functions
  const {showToast, showSuccess, showError} = useToast();
  
  // Store unsubscribe functions for FCM listeners
  const fcmUnsubscribeRef = useRef<(() => void)[]>([]);

  // Setup global toast for use in services
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
    setupNotificationListeners();
    checkInitialNotification();

    // Cleanup FCM listeners on unmount
    return () => {
      fcmUnsubscribeRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Refresh wallet when screen changes (except Login)
  useEffect(() => {
    if (currentScreen !== 'Login' && userData) {
      refreshWalletBalance();
    }
  }, [currentScreen, userData]);

  /**
   * Setup FCM notification listeners
   */
  const setupNotificationListeners = () => {
    if (!notificationService.isFirebaseAvailable()) {
      console.log('Firebase not available, skipping notification setup');
      return;
    }

    // Listen for foreground messages
    const unsubscribeForeground = notificationService.onForegroundMessage((message) => {
      console.log('Foreground notification received:', message);
      
      // Show alert for foreground notifications
      const title = message.notification?.title || 'New Message';
      const body = message.notification?.body || '';
      
      notificationService.showLocalNotification(title, body, message.data);
    });
    fcmUnsubscribeRef.current.push(unsubscribeForeground);

    // Listen for notification opened (background state)
    const unsubscribeOpened = notificationService.onNotificationOpenedApp((message) => {
      console.log('Notification opened app:', message);
      handleNotificationAction(message);
    });
    fcmUnsubscribeRef.current.push(unsubscribeOpened);

    // Listen for token refresh
    const unsubscribeTokenRefresh = notificationService.onTokenRefresh(async (newToken) => {
      console.log('FCM token refreshed, updating server...');
      
      // Check if user is logged in before updating token
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await authService.updatePushToken(newToken);
      }
    });
    fcmUnsubscribeRef.current.push(unsubscribeTokenRefresh);

    console.log('FCM notification listeners setup complete');
  };

  /**
   * Check if app was opened from a notification (quit state)
   */
  const checkInitialNotification = async () => {
    const initialNotification = await notificationService.getInitialNotification();
    if (initialNotification) {
      console.log('App opened from notification (quit state):', initialNotification);
      // Handle the notification after auth check
      setTimeout(() => {
        handleNotificationAction(initialNotification);
      }, 1000);
    }
  };

  /**
   * Handle notification action/navigation
   */
  const handleNotificationAction = (message: any) => {
    const data = message.data;
    
    if (data?.screen) {
      // Navigate to specific screen based on notification data
      console.log('Navigating to screen from notification:', data.screen);
      setCurrentScreen(data.screen as ScreenName);
    } else if (data?.action) {
      // Handle custom actions
      console.log('Handling notification action:', data.action);
    }
  };

  /**
   * Register FCM token after login
   */
  const registerPushToken = async () => {
    try {
      if (!notificationService.isFirebaseAvailable()) {
        console.log('Firebase not available, skipping push token registration');
        return;
      }

      console.log('Registering FCM token...');
      
      // Get FCM token
      const fcmToken = await notificationService.getFCMToken();
      
      if (fcmToken) {
        console.log('Got FCM token, sending to server...');
        
        // Send token to server
        const result = await authService.updatePushToken(fcmToken);
        
        if (result.success) {
          console.log('FCM token registered successfully');
        } else {
          console.log('Failed to register FCM token:', result.message);
        }
      } else {
        console.log('Could not get FCM token');
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      
      // Check if authService functions are available
      if (!authService || typeof authService.isAuthenticated !== 'function') {
        console.log('Auth service not available, showing login');
        setCurrentScreen('Login');
        setIsCheckingAuth(false);
        return;
      }
      
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        console.log('User is authenticated, getting user data...');
        const user = await authService.getCurrentUser();
        
        if (user) {
          console.log('User data found:', user.username);
          setUserData(user);
          setCurrentScreen('Dashboard');
          
          // Refresh wallet balance
          refreshWalletBalance();
          
          // Register push token for already logged in user
          registerPushToken();
        } else {
          console.log('No user data found, redirecting to login');
          setCurrentScreen('Login');
        }
      } else {
        console.log('User is not authenticated, showing login');
        setCurrentScreen('Login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentScreen('Login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const refreshWalletBalance = useCallback(async () => {
    try {
      console.log('Refreshing wallet balance...');
      const result = await getWalletBalance();
      
      if (result.success && result.data) {
        const formattedBalance = formatWalletBalance(result.data.balance, result.data.currency);
        setWalletBalance(formattedBalance);
        console.log('Wallet balance updated:', formattedBalance);
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  }, []);

  // Get user info from stored data or use defaults
  const userInfo = {
    userName: userData?.contact_name || 'Customer',
    companyName: userData?.company_name || 'Dashboard User',
  };

  const navigate = (screen: string) => {
    setCurrentScreen(screen as ScreenName);
    setSidebarVisible(false);
  };

  const openSidebar = () => {
    console.log('Opening sidebar');
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    console.log('Closing sidebar');
    setSidebarVisible(false);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    setSidebarVisible(false);
    
    try {
      // Delete FCM token on logout
      if (notificationService.isFirebaseAvailable()) {
        await notificationService.deleteFCMToken();
      }
      
      // Call logout service
      if (authService && typeof authService.logout === 'function') {
        const result = await authService.logout();
        console.log('Logout result:', result);
        
        if (result.success) {
          showSuccess('Logged out successfully');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear user data
    setUserData(null);
    setWalletBalance('£0.00');
    
    // Navigate to login
    setCurrentScreen('Login');
  };

  const handleLogoutAllDevices = async () => {
    console.log('Logging out from all devices...');
    setSidebarVisible(false);
    
    try {
      // Delete FCM token
      if (notificationService.isFirebaseAvailable()) {
        await notificationService.deleteFCMToken();
      }
      
      // Call logout all devices service
      if (authService && typeof authService.logoutAllDevices === 'function') {
        const result = await authService.logoutAllDevices();
        console.log('Logout all devices result:', result);
        
        if (result.success) {
          showSuccess(result.message || 'Logged out from all devices');
        }
      }
    } catch (error) {
      console.error('Logout all devices error:', error);
    }
    
    // Clear user data
    setUserData(null);
    setWalletBalance('£0.00');
    
    // Navigate to login
    setCurrentScreen('Login');
  };

  const handleLoginSuccess = async (loginData: any) => {
    console.log('Login successful, updating user data');
    if (loginData?.user) {
      setUserData(loginData.user);
      
      // Set initial wallet balance from login response
      if (loginData.user.wallet_balance) {
        setWalletBalance(`£${loginData.user.wallet_balance.toFixed(2)}`);
      }
      
      // Show success toast
      showSuccess('Login successful! Welcome back.');
      
      // Refresh wallet from API to get latest balance
      setTimeout(() => {
        refreshWalletBalance();
      }, 500);
      
      // Register FCM token after successful login
      setTimeout(() => {
        registerPushToken();
      }, 1000);
    }
  };

  const navigation = {
    navigate,
    openDrawer: openSidebar,
    goBack: () => navigate('Dashboard'),
    reset: ({routes}: {index: number; routes: {name: string}[]}) => {
      setCurrentScreen(routes[0].name as ScreenName);
    },
  };

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#293B50" />
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoSMS}>SMS</Text>
            <Text style={styles.logoExpert}>Expert</Text>
          </View>
          <ActivityIndicator size="large" color="#ea6118" style={styles.loader} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return (
          <LoginScreen 
            navigation={navigation} 
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'Dashboard':
        return <DashboardScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'SMSWallet':
        return <SMSWalletScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'SendSMS':
        return <SendNewSMSScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'ReceivedSMS':
        return <ReceivedSMSScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'SentSMS':
        return <SentSMSScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Keywords':
        return <KeywordsScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Numbers':
        return <NumbersScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Groups':
        return <GroupsScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Contracts':
        return <ContractsScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Invoices':
        return <InvoicesScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'DeliveryReceipt':
        return <DeliveryReceiptScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'Blacklist':
        return <BlacklistScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'ChangePassword':
        return <ChangePasswordScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignHome':
        return <CampaignDashboardScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignQuick':
        return <QuickCampaignScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignFile':
        return <BulkCampaignScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignHistory':
        return <CampaignHistoryScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignBlacklist':
        return <CampaignBlacklistScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignAccounts':
        return <CampaignAccountsScreen navigation={navigation} walletBalance={walletBalance} />;
      case 'CampaignAddAccount':
        return <CampaignAddAccountScreen navigation={navigation} walletBalance={walletBalance} />;
      default:
        return (
          <PlaceholderScreen
            navigation={navigation}
            route={{name: currentScreen}}
          />
        );
    }
  };

  return (
    <WalletContext.Provider value={{walletBalance, refreshWallet: refreshWalletBalance}}>
      <StatusBar barStyle="light-content" backgroundColor="#293B50" />
      {renderScreen()}
      {currentScreen !== 'Login' && (
        <SidebarModal
          visible={sidebarVisible}
          onClose={closeSidebar}
          onNavigate={navigate}
          onLogout={handleLogout}
          onLogoutAllDevices={handleLogoutAllDevices}
          currentRoute={currentScreen}
          userName={userInfo.userName}
          companyName={userInfo.companyName}
        />
      )}
    </WalletContext.Provider>
  );
}

// Main App Component with ToastProvider
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#293B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 30,
  },
  logoSMS: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ea6118',
  },
  logoExpert: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default App;
