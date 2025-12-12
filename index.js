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
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', remoteMessage);
    
    // You can handle the message here
    // For example, update badge count, store notification, etc.
    
    // The notification will be displayed automatically by FCM
    // if it has a notification payload
  });
  
  console.log('Firebase background message handler registered');
} catch (error) {
  console.log('Firebase messaging not available for background handler:', error);
}

AppRegistry.registerComponent(appName, () => App);
