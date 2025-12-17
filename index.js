/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Try to setup Firebase background message handler
try {
  const messaging = require('@react-native-firebase/messaging').default;
  
  // Register background handler
  // This handler is called when the app is in background or quit state
  // and receives a push notification
  messaging().setBackgroundMessageHandler(async remoteMessage => {
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
    
    // You can also perform background tasks here, like:
    // - Update local storage with the notification
    // - Sync data with the server
    // - Update app badge count
    
    // Note: This handler must return a Promise
    return Promise.resolve();
  });
  
  console.log('Firebase background message handler registered');
} catch (error) {
  console.log('Firebase messaging not available for background handler:', error);
}

AppRegistry.registerComponent(appName, () => App);
