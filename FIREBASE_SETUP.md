# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging for push notifications in the SMS Expert mobile app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "SMS Expert App")
   - Enable/Disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon to add an Android app
2. Enter the Android package name: `com.smsexpertapp`
3. Enter app nickname: `SMS Expert`
4. (Optional) Enter Debug signing certificate SHA-1
5. Click "Register app"

## Step 3: Download google-services.json

1. Download the `google-services.json` file
2. Place it in: `D:\cladue\smsexpert_mobile_app\android\app\google-services.json`

```
android/
└── app/
    └── google-services.json  <-- Place the file here
```

## Step 4: Install Dependencies

Run the following commands:

```bash
cd D:\cladue\smsexpert_mobile_app

# Clean and install dependencies
npm install

# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild the app
npx react-native run-android
```

## Step 5: Verify Installation

After building, check the Metro console for:
- "Firebase messaging loaded successfully"
- "FCM notification listeners setup complete"

## API Integration

The app automatically:
1. Requests notification permission on login
2. Gets the FCM token from Firebase
3. Sends the token to your server via `POST /api/mobile/auth/push-token`

### API Request Format:
```json
POST /api/mobile/auth/push-token
Authorization: Bearer {token}

{
  "fcm_token": "dK7f8kJ9...(FCM token)",
  "device_id": "unique-device-id"
}
```

### Server-Side: Sending Push Notifications

To send push notifications from your Laravel backend:

```php
// Install Firebase Admin SDK
// composer require kreait/firebase-php

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

$factory = (new Factory)->withServiceAccount('/path/to/serviceAccount.json');
$messaging = $factory->createMessaging();

// Send to specific device
$message = CloudMessage::withTarget('token', $fcmToken)
    ->withNotification([
        'title' => 'New SMS',
        'body' => 'You have received a new message',
    ])
    ->withData([
        'screen' => 'ReceivedSMS',
        'action' => 'open_sms',
    ]);

$messaging->send($message);
```

## Notification Payload Structure

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message body"
  },
  "data": {
    "screen": "Dashboard",
    "action": "custom_action",
    "extra_data": "any_value"
  }
}
```

## Handling Notifications in the App

The app handles notifications in three states:

| App State | Handler |
|-----------|---------|
| Foreground | Shows Alert dialog |
| Background | System notification (tap opens app) |
| Quit/Killed | System notification (tap opens app) |

## Troubleshooting

### Common Issues:

1. **"Firebase messaging not available"**
   - Ensure `google-services.json` is in the correct location
   - Run `cd android && ./gradlew clean && cd ..`
   - Rebuild the app

2. **"No FCM token"**
   - Check notification permission is granted
   - Ensure device has Google Play Services

3. **Build errors**
   - Delete `node_modules` and reinstall
   - Delete `android/app/build` folder
   - Sync Gradle files

### Debug Logs

Enable verbose logging in `notificationService.ts`:
```typescript
console.log('FCM Token:', token);
```

## File Structure

```
src/
└── services/
    └── notificationService.ts  # FCM handling
    └── authService.ts          # Push token API call

android/
└── app/
    └── google-services.json    # Firebase config
    └── build.gradle            # Google services plugin
└── build.gradle                # Google services classpath

index.js                        # Background message handler
App.tsx                         # FCM initialization
```

## Security Notes

- Never commit `google-services.json` to public repositories
- Add to `.gitignore`:
  ```
  android/app/google-services.json
  ```
- Store FCM tokens securely on your server
- Tokens can change, always update on token refresh

## Testing

1. **Test Foreground Notification:**
   - Keep app open
   - Send test notification from Firebase Console
   - Should see Alert dialog

2. **Test Background Notification:**
   - Minimize app
   - Send test notification
   - Should see system notification
   - Tap to open app

3. **Test Token Registration:**
   - Login to app
   - Check server logs for push token API call
   - Verify token is stored in database
