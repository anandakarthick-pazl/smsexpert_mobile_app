/**
 * SMS Expert Mobile App
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet, Text, InteractionManager, AppState} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import InvoiceDetailScreen from './src/screens/InvoiceDetailScreen';
import BuySmsScreen from './src/screens/BuySmsScreen';
import DeliveryReceiptScreen from './src/screens/DeliveryReceiptScreen';
import BlacklistScreen from './src/screens/BlacklistScreen';
import StopCommandsScreen from './src/screens/StopCommandsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import CampaignDashboardScreen from './src/screens/CampaignDashboardScreen';
import QuickCampaignScreen from './src/screens/QuickCampaignScreen';
import BulkCampaignScreen from './src/screens/BulkCampaignScreen';
import CampaignHistoryScreen from './src/screens/CampaignHistoryScreen';
import CampaignBlacklistScreen from './src/screens/CampaignBlacklistScreen';
import CampaignAccountsScreen from './src/screens/CampaignAccountsScreen';
import CampaignAddAccountScreen from './src/screens/CampaignAddAccountScreen';
import KeywordConfigScreen from './src/screens/KeywordConfigScreen';
import SmsResponderScreen from './src/screens/SmsResponderScreen';
import EmailForwarderScreen from './src/screens/EmailForwarderScreen';
import SmsForwarderScreen from './src/screens/SmsForwarderScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import WapPushResponderScreen from './src/screens/WapPushResponderScreen';
import BusinessCardScreen from './src/screens/BusinessCardScreen';
import VotingScreen from './src/screens/VotingScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import MaintenanceScreen from './src/screens/MaintenanceScreen';
import SidebarModal from './src/components/SidebarModal';

// Import Toast Provider
import {ToastProvider, useToast, setGlobalToast} from './src/context/ToastContext';

// Import Notification Provider
import {NotificationProvider, useNotifications} from './src/context/NotificationContext';

// Import services
import * as authService from './src/services/authService';
import {User} from './src/services/authService';
import {getWalletBalance, formatWalletBalance} from './src/services/walletService';
import * as notificationService from './src/services/notificationService';
import * as notificationApiService from './src/services/notificationApiService';

// Storage key for app mode
const APP_MODE_KEY = '@sms_expert_app_mode';
// Storage key for pending notification (when app opens from quit state)
const PENDING_NOTIFICATION_KEY = '@sms_expert_pending_notification';

type ScreenName = 
  | 'Login' 
  | 'Dashboard' 
  | 'SMSWallet' 
  | 'SendSMS' 
  | 'ReceivedSMS'
  | 'SentSMS' 
  | 'Keywords' 
  | 'KeywordConfig'
  | 'SmsResponder'
  | 'EmailForwarder'
  | 'SmsForwarder'
  | 'Subscription'
  | 'WapPushResponder'
  | 'BusinessCard'
  | 'Voting'
  | 'Numbers' 
  | 'Groups' 
  | 'Profile' 
  | 'Contracts'
  | 'Invoices'
  | 'InvoiceDetail'
  | 'BuySms'
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
  | 'CampaignAddAccount'
  | 'Notifications'
  | 'NotificationDetail'
  | 'Maintenance';

// Create a global wallet balance context to share across components (used by SidebarModal)
export const WalletContext = React.createContext<{
  walletBalance: string;
  refreshWallet: () => Promise<void>;
}>({
  walletBalance: '£0.00',
  refreshWallet: async () => {},
});

// Main App Content Component (with notification context access)
function AppContentWithNotifications(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [routeParams, setRouteParams] = useState<{params?: any}>({params: {}});
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('£0.00');
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<{
    enabled: boolean;
    message: string;
    endTime: string | null;
  }>({enabled: false, message: '', endTime: null});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Store pending notification to handle after auth
  const [pendingNotification, setPendingNotification] = useState<any>(null);
  
  // Get toast functions
  const {showToast, showSuccess} = useToast();
  
  // Get notification context
  const {unreadCount, refreshUnreadCount, refreshNotifications} = useNotifications();
  
  // Store unsubscribe functions for FCM listeners
  const fcmUnsubscribeRef = useRef<(() => void)[]>([]);
  
  // Track if FCM token has been registered
  const fcmTokenRegistered = useRef(false);
  
  // Track if initial notification has been processed
  const initialNotificationProcessed = useRef(false);

  // Debug: Log sidebarVisible state changes
  useEffect(() => {
    console.log('App: sidebarVisible changed to:', sidebarVisible);
  }, [sidebarVisible]);

  // Setup global toast for use in services
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);

  // Mark app as ready after initial render (Activity will be attached)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      console.log('App is ready, Activity should be attached');
      setIsAppReady(true);
    });

    return () => task.cancel();
  }, []);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup FCM listeners on unmount
    return () => {
      fcmUnsubscribeRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Setup notification listeners only after app is ready
  useEffect(() => {
    if (isAppReady) {
      setupNotificationListeners();
      checkInitialNotification();
    }
  }, [isAppReady]);

  // Check for pending notifications when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && userData && !initialNotificationProcessed.current) {
        console.log('App came to foreground, checking for pending notifications...');
        const storedNotification = await AsyncStorage.getItem(PENDING_NOTIFICATION_KEY);
        if (storedNotification) {
          console.log('Found pending notification on foreground:', storedNotification);
          const parsed = JSON.parse(storedNotification);
          setPendingNotification(parsed);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userData]);

  // Process pending notification after user is authenticated and screen is not Login
  useEffect(() => {
    const processPendingNotification = async () => {
      if (pendingNotification && userData && currentScreen !== 'Login' && currentScreen !== 'Maintenance') {
        console.log('=== PROCESSING PENDING NOTIFICATION (useEffect) ===');
        console.log('Pending notification:', JSON.stringify(pendingNotification, null, 2));
        console.log('User data available:', !!userData);
        console.log('Current screen:', currentScreen);
        console.log('Already processed:', initialNotificationProcessed.current);
        
        // Check if already processed
        if (initialNotificationProcessed.current) {
          console.log('Notification already processed, clearing pending');
          setPendingNotification(null);
          await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
          return;
        }
        
        // Mark as processed
        initialNotificationProcessed.current = true;
        
        // Extract notification data
        const data = pendingNotification.data || {};
        const notificationId = data?.notification_id || data?.recipient_id;
        
        console.log('Executing navigation for pending notification, id:', notificationId);
        
        // Clear from storage first
        await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
        
        // Delay to ensure the app is fully ready
        setTimeout(() => {
          // Navigate to notification detail
          setRouteParams({
            params: {
              notification_id: notificationId,
              fromPush: true,
            },
          });
          setCurrentScreen('NotificationDetail');
          
          // Clear pending notification state
          setPendingNotification(null);
          
          console.log('Navigated to NotificationDetail for pending notification');
          
          // Refresh notifications
          setTimeout(() => {
            refreshNotifications();
            refreshUnreadCount();
          }, 500);
        }, 500); // Small delay for app to be ready
      }
    };
    
    processPendingNotification();
  }, [pendingNotification, userData, currentScreen]);

  // Refresh wallet when screen changes (except Login)
  useEffect(() => {
    if (currentScreen !== 'Login' && currentScreen !== 'Maintenance' && userData) {
      refreshWalletBalance();
    }
  }, [currentScreen, userData]);

  // Refresh notifications when user logs in (only run once when userData becomes available)
  useEffect(() => {
    if (userData && currentScreen !== 'Login' && currentScreen !== 'Maintenance') {
      refreshUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // Register FCM token when app is ready and user is logged in
  useEffect(() => {
    if (isAppReady && userData && !fcmTokenRegistered.current && currentScreen !== 'Login' && currentScreen !== 'Maintenance') {
      // Delay FCM registration to ensure Activity is fully ready (3 seconds)
      const timer = setTimeout(() => {
        registerPushToken();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAppReady, userData, currentScreen]);

  /**
   * Load saved app mode from AsyncStorage
   */
  const loadAppMode = async (): Promise<boolean> => {
    try {
      const savedMode = await AsyncStorage.getItem(APP_MODE_KEY);
      console.log('Loaded app mode from storage:', savedMode);
      return savedMode === 'campaign';
    } catch (error) {
      console.error('Error loading app mode:', error);
      return false;
    }
  };

  /**
   * Check maintenance mode
   */
  const checkMaintenanceMode = async (): Promise<boolean> => {
    try {
      const result = await notificationApiService.checkMaintenanceMode();
      
      if (result.success && result.data?.is_maintenance) {
        setMaintenanceMode({
          enabled: true,
          message: result.data.message,
          endTime: result.data.end_time,
        });
        return true;
      }
      
      setMaintenanceMode({enabled: false, message: '', endTime: null});
      return false;
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      return false;
    }
  };

  /**
   * Setup FCM notification listeners
   */
  const setupNotificationListeners = () => {
    if (!notificationService.isFirebaseAvailable()) {
      console.log('Firebase not available, skipping notification setup');
      return;
    }

    console.log('Setting up FCM notification listeners...');

    // Listen for foreground messages
    const unsubscribeForeground = notificationService.onForegroundMessage((message) => {
      console.log('Foreground notification received:', JSON.stringify(message, null, 2));
      
      // Show alert for foreground notifications
      const title = message.notification?.title || 'New Message';
      const body = message.notification?.body || '';
      
      // Show local notification with View button
      notificationService.showLocalNotification(title, body, message.data, () => {
        // User tapped "View" - handle the notification action
        handleNotificationAction(message);
      });
      
      // Refresh unread count
      refreshUnreadCount();
    });
    fcmUnsubscribeRef.current.push(unsubscribeForeground);
    console.log('Foreground message listener registered');

    // Listen for notification opened (background state)
    const unsubscribeOpened = notificationService.onNotificationOpenedApp((message) => {
      console.log('=== NOTIFICATION OPENED APP (BACKGROUND) ===');
      console.log('Message:', JSON.stringify(message, null, 2));
      handleNotificationAction(message);
      refreshUnreadCount();
    });
    fcmUnsubscribeRef.current.push(unsubscribeOpened);
    console.log('onNotificationOpenedApp listener registered');

    // Listen for token refresh
    const unsubscribeTokenRefresh = notificationService.onTokenRefresh(async (newToken) => {
      console.log('FCM token refreshed, updating server...');
      
      // Check if user is logged in before updating token
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await notificationApiService.registerFcmToken(newToken);
      }
    });
    fcmUnsubscribeRef.current.push(unsubscribeTokenRefresh);

    console.log('FCM notification listeners setup complete');
  };

  /**
   * Check if app was opened from a notification (quit state)
   */
  const checkInitialNotification = async () => {
    try {
      console.log('Checking for initial notification...');
      
      // First check if there's a stored pending notification from index.js
      const storedNotification = await AsyncStorage.getItem(PENDING_NOTIFICATION_KEY);
      if (storedNotification) {
        console.log('Found stored pending notification from storage');
        const parsed = JSON.parse(storedNotification);
        console.log('Parsed notification:', JSON.stringify(parsed, null, 2));
        setPendingNotification(parsed);
        return;
      }
      
      // Check for Firebase initial notification (backup check)
      const initialNotification = await notificationService.getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification (quit state) - from Firebase:', JSON.stringify(initialNotification, null, 2));
        
        // Store the notification to process after auth
        await AsyncStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(initialNotification));
        setPendingNotification(initialNotification);
      } else {
        console.log('No initial notification found');
      }
    } catch (error) {
      console.log('Could not check initial notification:', error);
    }
  };

  /**
   * Handle notification action/navigation
   */
  const handleNotificationAction = async (message: any) => {
    console.log('=== HANDLE NOTIFICATION ACTION ===');
    const data = message.data || {};
    const notificationPayload = message.notification || {};
    
    console.log('Full message:', JSON.stringify(message, null, 2));
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Notification payload:', JSON.stringify(notificationPayload, null, 2));
    console.log('Current userData state:', !!userData);
    
    // Check authentication status directly (not just state)
    const isAuthenticated = await authService.isAuthenticated();
    console.log('Is authenticated (from service):', isAuthenticated);
    
    // If not authenticated at all, store for later
    if (!isAuthenticated) {
      console.log('User not authenticated at all, storing notification for after login');
      setPendingNotification(message);
      await AsyncStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(message));
      return;
    }
    
    // If authenticated but userData not loaded yet, store and wait
    if (!userData) {
      console.log('Authenticated but userData not loaded yet, storing notification');
      setPendingNotification(message);
      await AsyncStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(message));
      // The useEffect will process it when userData becomes available
      return;
    }
    
    // Extract notification_id from data
    const notificationId = data?.notification_id || data?.recipient_id;
    
    console.log('Extracted notificationId:', notificationId);
    console.log('Navigating to notification...');
    
    // Mark as processed to prevent duplicate handling
    initialNotificationProcessed.current = true;
    
    // Clear any stored notification
    await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
    
    if (data?.screen && data.screen !== 'Notifications') {
      // Navigate to specific screen based on notification data
      console.log('Navigating to screen from notification:', data.screen);
      
      // Set route params with notification data
      setRouteParams({
        params: {
          ...data,
          notification_id: notificationId,
          highlightId: notificationId,
          fromPush: true,
        },
      });
      
      setCurrentScreen(data.screen as ScreenName);
    } else if (data?.action) {
      // Handle custom actions
      console.log('Handling notification action:', data.action);
      
      switch (data.action) {
        case 'top_up_wallet':
          setCurrentScreen('BuySms');
          break;
        case 'view_notification':
        default:
          // Navigate to notification detail screen
          console.log('Navigating to NotificationDetail with id:', notificationId);
          setRouteParams({
            params: {
              notification_id: notificationId,
              fromPush: true,
            },
          });
          setCurrentScreen('NotificationDetail');
          break;
      }
    } else {
      // No specific screen or action, go to notification detail page
      console.log('No specific screen/action, navigating to NotificationDetail with id:', notificationId);
      setRouteParams({
        params: {
          notification_id: notificationId,
          fromPush: true,
        },
      });
      setCurrentScreen('NotificationDetail');
    }
    
    // Refresh notifications after handling
    setTimeout(() => {
      refreshNotifications();
      refreshUnreadCount();
    }, 500);
  };

  /**
   * Register FCM token after login
   */
  const registerPushToken = async () => {
    // Prevent duplicate registration
    if (fcmTokenRegistered.current) {
      console.log('FCM token already registered, skipping');
      return;
    }

    try {
      if (!notificationService.isFirebaseAvailable()) {
        console.log('Firebase not available, skipping push token registration');
        return;
      }

      console.log('Registering FCM token...');
      
      // Check if permission already granted
      const hasPermission = await notificationService.checkNotificationPermission();
      
      if (!hasPermission) {
        console.log('Notification permission not granted, requesting...');
        // Request permission
        const granted = await notificationService.requestNotificationPermission();
        if (!granted) {
          console.log('Notification permission denied by user');
          return;
        }
        console.log('Notification permission granted');
      }
      
      // Get FCM token
      const fcmToken = await notificationService.getFCMToken();
      
      if (fcmToken) {
        console.log('Got FCM token, sending to server...');
        
        // Send token to server using new API service
        const result = await notificationApiService.registerFcmToken(fcmToken);
        
        if (result.success) {
          console.log('FCM token registered successfully');
          fcmTokenRegistered.current = true;
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
      
      // Reset the processed flag on fresh auth check
      // This allows notification to be processed if coming from background
      initialNotificationProcessed.current = false;
      
      // Load saved app mode
      const savedCampaignMode = await loadAppMode();
      setIsCampaignMode(savedCampaignMode);
      console.log('App mode is campaign:', savedCampaignMode);
      
      // Check if authService functions are available
      if (!authService || typeof authService.isAuthenticated !== 'function') {
        console.log('Auth service not available, showing login');
        setCurrentScreen('Login');
        setIsCheckingAuth(false);
        return;
      }
      
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        console.log('User is authenticated, checking maintenance mode...');
        
        // Check maintenance mode first
        const isInMaintenance = await checkMaintenanceMode();
        
        if (isInMaintenance) {
          console.log('App is in maintenance mode');
          setCurrentScreen('Maintenance');
          setIsCheckingAuth(false);
          return;
        }
        
        console.log('Getting user data...');
        const user = await authService.getCurrentUser();
        
        if (user) {
          console.log('User data found:', user.username);
          setUserData(user);
          
          // Check if there's a pending notification to handle
          const storedNotification = await AsyncStorage.getItem(PENDING_NOTIFICATION_KEY);
          
          if (storedNotification && !initialNotificationProcessed.current) {
            console.log('Found pending notification, will navigate to Notifications screen');
            // Set pending notification - it will be processed by the useEffect
            setPendingNotification(JSON.parse(storedNotification));
            // Navigate to a default screen first, notification handling will redirect
            if (savedCampaignMode) {
              setCurrentScreen('CampaignHome');
            } else {
              setCurrentScreen('Dashboard');
            }
          } else {
            // Navigate to the correct dashboard based on saved mode
            if (savedCampaignMode) {
              console.log('Navigating to Campaign Dashboard (saved mode)');
              setCurrentScreen('CampaignHome');
            } else {
              console.log('Navigating to Dashboard (saved mode)');
              setCurrentScreen('Dashboard');
            }
          }
          
          // Refresh wallet balance
          refreshWalletBalance();
          
          // Refresh notification count
          refreshUnreadCount();
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

  const navigate = useCallback((screen: string, params?: any) => {
    console.log('Navigate called:', screen, 'with params:', params);
    setRouteParams({params: params || {}});
    setCurrentScreen(screen as ScreenName);
    setSidebarVisible(false);
  }, []);

  const openSidebar = useCallback(async () => {
    console.log('openSidebar called');
    setSidebarVisible(true);
    
    // Refresh user data to get latest dashboard_access from server
    try {
      const result = await authService.refreshUserData();
      if (result.success && result.user) {
        console.log('User data refreshed on sidebar open, dashboard_access:', result.user.dashboard_access);
        setUserData(result.user);
      }
    } catch (error) {
      console.error('Error refreshing user data on sidebar open:', error);
    }
  }, []);

  const closeSidebar = useCallback(() => {
    console.log('Closing sidebar');
    setSidebarVisible(false);
  }, []);

  const handleModeChange = (newCampaignMode: boolean) => {
    console.log('Mode changed to:', newCampaignMode ? 'Campaign' : 'Dashboard');
    setIsCampaignMode(newCampaignMode);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    
    // Show loading indicator
    setIsLoggingOut(true);
    
    try {
      // Unregister FCM token on logout
      await notificationApiService.unregisterFcmToken();
      
      // Reset FCM registration flag
      fcmTokenRegistered.current = false;
      
      // Clear pending notification
      await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
      setPendingNotification(null);
      initialNotificationProcessed.current = false;
      
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
    
    // Hide loading and close sidebar
    setIsLoggingOut(false);
    setSidebarVisible(false);
    
    // Navigate to login
    setCurrentScreen('Login');
  };

  const handleLogoutAllDevices = async () => {
    console.log('Logging out from all devices...');
    
    // Show loading indicator
    setIsLoggingOut(true);
    
    try {
      // Unregister FCM token
      await notificationApiService.unregisterFcmToken();
      
      // Reset FCM registration flag
      fcmTokenRegistered.current = false;
      
      // Clear pending notification
      await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
      setPendingNotification(null);
      initialNotificationProcessed.current = false;
      
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
    
    // Hide loading and close sidebar
    setIsLoggingOut(false);
    setSidebarVisible(false);
    
    // Navigate to login
    setCurrentScreen('Login');
  };

  const handleLoginSuccess = async (loginData: any) => {
    console.log('Login successful, updating user data');
    if (loginData?.user) {
      // Check maintenance mode first
      const isInMaintenance = await checkMaintenanceMode();
      
      if (isInMaintenance) {
        console.log('App is in maintenance mode after login');
        setCurrentScreen('Maintenance');
        return;
      }
      
      setUserData(loginData.user);
      
      // Reset FCM registration flag for new login
      fcmTokenRegistered.current = false;
      
      // Set initial wallet balance from login response
      if (loginData.user.wallet_balance) {
        setWalletBalance(`£${loginData.user.wallet_balance.toFixed(2)}`);
      }
      
      // Show success toast
      showSuccess('Login successful! Welcome back.');
      
      // Load saved app mode and navigate accordingly
      const savedCampaignMode = await loadAppMode();
      setIsCampaignMode(savedCampaignMode);
      
      console.log('Login - Saved campaign mode:', savedCampaignMode);
      
      // Check if there's a pending notification from quit state
      const storedNotification = await AsyncStorage.getItem(PENDING_NOTIFICATION_KEY);
      
      if (storedNotification && !initialNotificationProcessed.current) {
        console.log('Found pending notification after login, will process it');
        setPendingNotification(JSON.parse(storedNotification));
      }
      
      // Navigate to the correct dashboard based on saved mode
      // The pending notification handling will redirect if needed
      if (savedCampaignMode) {
        console.log('Login - Navigating to Campaign Dashboard');
        setCurrentScreen('CampaignHome');
      } else {
        console.log('Login - Navigating to Dashboard');
        setCurrentScreen('Dashboard');
      }
      
      // Refresh wallet from API to get latest balance
      setTimeout(() => {
        refreshWalletBalance();
      }, 500);
      
      // Refresh notifications
      setTimeout(() => {
        refreshUnreadCount();
        refreshNotifications();
      }, 1000);
    }
  };

  const handleNotificationPress = async () => {
    // Check if notification permission is granted
    if (notificationService.isFirebaseAvailable()) {
      const hasPermission = await notificationService.checkNotificationPermission();
      
      if (!hasPermission && !fcmTokenRegistered.current) {
        // Request permission when user clicks notification bell
        const granted = await notificationService.requestNotificationPermission();
        
        if (granted) {
          // Now try to register FCM token
          registerPushToken();
        }
      }
    }
    
    navigate('Notifications');
  };

  const handleMaintenanceRetry = async () => {
    const isStillInMaintenance = await checkMaintenanceMode();
    
    if (!isStillInMaintenance) {
      // Navigate to dashboard
      const savedCampaignMode = await loadAppMode();
      if (savedCampaignMode) {
        setCurrentScreen('CampaignHome');
      } else {
        setCurrentScreen('Dashboard');
      }
    }
  };

  const navigation = React.useMemo(() => ({
    navigate,
    openDrawer: openSidebar,
    goBack: () => {
      // Go back to appropriate dashboard based on mode
      if (isCampaignMode) {
        navigate('CampaignHome');
      } else {
        navigate('Dashboard');
      }
    },
    reset: ({routes}: {index: number; routes: {name: string}[]}) => {
      setCurrentScreen(routes[0].name as ScreenName);
    },
  }), [navigate, openSidebar, isCampaignMode]);

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a252f" />
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

  // Show maintenance screen if in maintenance mode
  if (currentScreen === 'Maintenance' || maintenanceMode.enabled) {
    return (
      <MaintenanceScreen
        message={maintenanceMode.message}
        endTime={maintenanceMode.endTime}
        onRetry={handleMaintenanceRetry}
        onLogout={handleLogout}
      />
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
        return <DashboardScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'SMSWallet':
        return <SMSWalletScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'SendSMS':
        return <SendNewSMSScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'ReceivedSMS':
        return <ReceivedSMSScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'SentSMS':
        return <SentSMSScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Keywords':
        return <KeywordsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'KeywordConfig':
        return <KeywordConfigScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'SmsResponder':
        return <SmsResponderScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'EmailForwarder':
        return <EmailForwarderScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'SmsForwarder':
        return <SmsForwarderScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Subscription':
        return <SubscriptionScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'WapPushResponder':
        return <WapPushResponderScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'BusinessCard':
        return <BusinessCardScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Voting':
        return <VotingScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Numbers':
        return <NumbersScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Groups':
        return <GroupsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Contracts':
        return <ContractsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Invoices':
        return <InvoicesScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'InvoiceDetail':
        return <InvoiceDetailScreen navigation={navigation} route={routeParams} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'BuySms':
        return <BuySmsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'DeliveryReceipt':
        return <DeliveryReceiptScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Stops':
        return <StopCommandsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Blacklist':
        return <BlacklistScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'ChangePassword':
        return <ChangePasswordScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignHome':
        return <CampaignDashboardScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignQuick':
        return <QuickCampaignScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignFile':
        return <BulkCampaignScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignHistory':
        return <CampaignHistoryScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignBlacklist':
        return <CampaignBlacklistScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignAccounts':
        return <CampaignAccountsScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'CampaignAddAccount':
        return <CampaignAddAccountScreen navigation={navigation} onNotificationPress={handleNotificationPress} notificationCount={unreadCount} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} route={routeParams} />;
      case 'NotificationDetail':
        return <NotificationDetailScreen navigation={navigation} route={routeParams} />;
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
      {currentScreen !== 'Login' && currentScreen !== 'Maintenance' && (
        <SidebarModal
          visible={sidebarVisible}
          onClose={closeSidebar}
          onNavigate={navigate}
          onLogout={handleLogout}
          onLogoutAllDevices={handleLogoutAllDevices}
          currentRoute={currentScreen}
          userName={userInfo.userName}
          companyName={userInfo.companyName}
          isCampaignMode={isCampaignMode}
          onModeChange={handleModeChange}
          dashboardAccess={userData?.dashboard_access || 'mca'}
          isLoggingOut={isLoggingOut}
        />
      )}
    </WalletContext.Provider>
  );
}

// Wrapper component that provides notification context
function AppContent(): React.JSX.Element {
  return (
    <NotificationProvider>
      <AppContentWithNotifications />
    </NotificationProvider>
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
