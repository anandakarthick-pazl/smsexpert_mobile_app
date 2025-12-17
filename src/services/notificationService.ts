/**
 * Notification Service
 * Handle Firebase Cloud Messaging for push notifications
 */

import {Platform, PermissionsAndroid, Alert, AppState, Linking} from 'react-native';

// Try to import Firebase messaging
let messaging: any = null;

try {
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
 * Check if notification permission is granted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!messaging) {
      return false;
    }

    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.log('Error checking notification permission:', error);
    return false;
  }
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

    // First check if already granted
    const alreadyGranted = await checkNotificationPermission();
    if (alreadyGranted) {
      console.log('Notification permission already granted');
      return true;
    }

    console.log('Requesting notification permission...');

    if (Platform.OS === 'android') {
      // Android 13+ requires POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        console.log('Android 13+, requesting POST_NOTIFICATIONS permission');
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'SMS Expert needs notification permission to send you important updates about your campaigns and wallet.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          console.log('Android permission result:', granted);
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission granted');
            return true;
          } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
            console.log('Android notification permission denied');
            return false;
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('Android notification permission permanently denied');
            // Show alert to guide user to settings
            Alert.alert(
              'Notifications Disabled',
              'To receive important updates, please enable notifications in your device settings.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: () => Linking.openSettings()},
              ]
            );
            return false;
          }
        } catch (permError: any) {
          console.log('Error requesting Android permission:', permError.message);
          // If Activity not attached, return false and let caller retry
          if (permError.message?.includes('not attached to an Activity')) {
            console.log('Activity not attached, will retry later');
            return false;
          }
          throw permError;
        }
      } else {
        // Android < 13 doesn't need runtime permission for notifications
        console.log('Android < 13, no runtime permission needed');
        return true;
      }
    }

    // Request Firebase messaging permission (for iOS)
    try {
      console.log('Requesting Firebase messaging permission...');
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Firebase notification permission granted:', authStatus);
        return true;
      }

      console.log('Firebase notification permission denied:', authStatus);
      return false;
    } catch (fbError) {
      console.log('Error requesting Firebase permission:', fbError);
      return false;
    }
  } catch (error: any) {
    console.error('Error in requestNotificationPermission:', error);
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

    // Check current permission status
    const hasPermission = await checkNotificationPermission();
    
    if (!hasPermission) {
      // Try to request permission
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('No notification permission, cannot get FCM token');
        return null;
      }
    }

    // Get the token
    const token = await messaging().getToken();
    
    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    }

    console.log('Failed to get FCM token');
    return null;
  } catch (error: any) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Get FCM token without requesting permission (for already granted)
 */
export const getFCMTokenIfPermitted = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      return null;
    }

    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const token = await messaging().getToken();
    return token || null;
  } catch (error) {
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

/**
 * Prompt user to enable notifications if not granted
 */
export const promptEnableNotifications = (): void => {
  Alert.alert(
    'Enable Notifications',
    'Would you like to receive notifications about your campaigns, wallet balance, and important updates?',
    [
      {text: 'Not Now', style: 'cancel'},
      {
        text: 'Enable',
        onPress: async () => {
          const granted = await requestNotificationPermission();
          if (granted) {
            Alert.alert('Success', 'Notifications enabled successfully!');
          }
        },
      },
    ]
  );
};

export default {
  isFirebaseAvailable,
  checkNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  getFCMTokenIfPermitted,
  deleteFCMToken,
  onTokenRefresh,
  onForegroundMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  showLocalNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  promptEnableNotifications,
};
