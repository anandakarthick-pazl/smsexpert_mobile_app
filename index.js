/**
 * @format
 */

import {AppRegistry} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';
import {name as appName} from './app.json';

// Storage key for pending notification (when app opens from quit state)
const PENDING_NOTIFICATION_KEY = '@sms_expert_pending_notification';

// Try to setup Firebase background message handler
try {
  const messaging = require('@react-native-firebase/messaging').default;
  
  // Register background handler
  // This handler is called when the app is in background or quit state
  // and receives a push notification
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('=== BACKGROUND MESSAGE HANDLER ===');
    console.log('Background message received:', JSON.stringify(remoteMessage, null, 2));
    
    // Extract notification data
    const data = remoteMessage.data || {};
    const notification = remoteMessage.notification || {};
    
    console.log('Background notification data:', {
      title: notification.title || data.title,
      body: notification.body || data.message,
      notification_id: data.notification_id,
      action: data.action,
      screen: data.screen,
      type: data.type,
    });
    
    // The notification will be displayed automatically by FCM
    // if it has a notification payload
    
    // Note: This handler must return a Promise
    return Promise.resolve();
  });
  
  console.log('Firebase background message handler registered');
  
  // Check for initial notification on cold start
  // This runs before the React app is mounted
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('=== INITIAL NOTIFICATION (QUIT STATE - index.js) ===');
        console.log('App opened from quit state via notification:', JSON.stringify(remoteMessage, null, 2));
        
        // Store the notification so App.tsx can handle it after auth
        AsyncStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(remoteMessage))
          .then(() => {
            console.log('Stored pending notification for processing after auth');
          })
          .catch(err => {
            console.log('Failed to store pending notification:', err);
          });
      } else {
        console.log('No initial notification (app opened normally)');
      }
    })
    .catch(err => {
      console.log('Error checking initial notification in index.js:', err);
    });

  // Also listen for notification opened while app is starting
  // This catches the case where the app is in background and notification is tapped
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('=== NOTIFICATION OPENED APP (index.js) ===');
    console.log('Notification caused app to open from background:', JSON.stringify(remoteMessage, null, 2));
    
    // Store the notification so App.tsx can handle it
    AsyncStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(remoteMessage))
      .then(() => {
        console.log('Stored notification from background open for processing');
      })
      .catch(err => {
        console.log('Failed to store notification from background:', err);
      });
  });
  console.log('onNotificationOpenedApp listener registered in index.js');
    
} catch (error) {
  console.log('Firebase messaging not available for background handler:', error);
}

AppRegistry.registerComponent(appName, () => App);
