/**
 * Notification Service
 * Handle Firebase Cloud Messaging for push notifications
 */

import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {storeSettings, getSettings} from './storageService';

// FCM Token storage key
const FCM_TOKEN_KEY = '@smsexpert_fcm_token';

// Try to import Firebase messaging
let messaging: any = null;
let firebaseApp: any = null;

try {
  firebaseApp = require('@react-native-firebase/app').default;
  messaging = require('@react-native-firebase/messaging').default;
  console.log('Firebase messaging loaded successfully');
} catch (error) {
  console.log('Firebase messaging not available:', error);
}

/**
 * Check if Firebase is available
 */
export const isFirebaseAvailable = (): boolean => {
  return messaging !== null;
};

/**
 * Request notification permissions (iOS and Android 13+)
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not available');
      return false;
    }

    if (Platform.OS === 'android') {
      // Android 13+ requires notification permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
          return false;
        }
      }
    }

    // Request Firebase messaging permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted:', authStatus);
      return true;
    }

    console.log('Notification permission denied:', authStatus);
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not available');
      return null;
    }

    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission, cannot get FCM token');
      return null;
    }

    // Get the token
    const token = await messaging().getToken();
    
    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    }

    console.log('Failed to get FCM token');
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Delete FCM token (useful for logout)
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    if (!messaging) {
      return true;
    }

    await messaging().deleteToken();
    console.log('FCM token deleted');
    return true;
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return false;
  }
};

/**
 * Setup FCM token refresh listener
 */
export const onTokenRefresh = (callback: (token: string) => void): (() => void) => {
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = messaging().onTokenRefresh((token: string) => {
    console.log('FCM token refreshed:', token.substring(0, 20) + '...');
    callback(token);
  });

  return unsubscribe;
};

/**
 * Handle foreground messages
 */
export const onForegroundMessage = (
  callback: (message: any) => void
): (() => void) => {
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
    console.log('Foreground message received:', remoteMessage);
    callback(remoteMessage);
  });

  return unsubscribe;
};

/**
 * Handle notification opened app (when app is in background)
 */
export const onNotificationOpenedApp = (
  callback: (message: any) => void
): (() => void) => {
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage: any) => {
    console.log('Notification opened app from background:', remoteMessage);
    callback(remoteMessage);
  });

  return unsubscribe;
};

/**
 * Get initial notification (when app was opened from quit state)
 */
export const getInitialNotification = async (): Promise<any | null> => {
  try {
    if (!messaging) {
      return null;
    }

    const remoteMessage = await messaging().getInitialNotification();
    
    if (remoteMessage) {
      console.log('App opened from notification (quit state):', remoteMessage);
      return remoteMessage;
    }

    return null;
  } catch (error) {
    console.error('Error getting initial notification:', error);
    return null;
  }
};

/**
 * Set background message handler
 * NOTE: This should be called in index.js, not in a component
 */
export const setBackgroundMessageHandler = (
  handler: (message: any) => Promise<void>
): void => {
  if (!messaging) {
    return;
  }

  messaging().setBackgroundMessageHandler(handler);
  console.log('Background message handler set');
};

/**
 * Show local notification for foreground messages
 */
export const showLocalNotification = (title: string, body: string, data?: any): void => {
  // For foreground notifications, we can show an Alert or use a library like notifee
  Alert.alert(
    title || 'New Notification',
    body || '',
    [
      {
        text: 'OK',
        onPress: () => {
          if (data?.action) {
            console.log('Notification action:', data.action);
          }
        },
      },
    ],
    {cancelable: true}
  );
};

/**
 * Subscribe to a topic
 */
export const subscribeToTopic = async (topic: string): Promise<boolean> => {
  try {
    if (!messaging) {
      return false;
    }

    await messaging().subscribeToTopic(topic);
    console.log('Subscribed to topic:', topic);
    return true;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return false;
  }
};

/**
 * Unsubscribe from a topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<boolean> => {
  try {
    if (!messaging) {
      return false;
    }

    await messaging().unsubscribeFromTopic(topic);
    console.log('Unsubscribed from topic:', topic);
    return true;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return false;
  }
};

export default {
  isFirebaseAvailable,
  requestNotificationPermission,
  getFCMToken,
  deleteFCMToken,
  onTokenRefresh,
  onForegroundMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  showLocalNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
};
