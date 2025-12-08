// src/service/pushNotifications.js
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { registerDeviceToken } from "./api/notification";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestUserPermission() {
  // 1. Android 13+ requires explicit permission
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('User declined notification permission');
      return false;
    }
  }

  // 2. iOS Permission (if you add iOS later)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export async function setupPushNotifications() {
  const hasPermission = await requestUserPermission();
  
  if (hasPermission) {
    // 3. Get the Native FCM Token
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // 4. Send to Backend
      if (token) {
        await registerDeviceToken(token);
      }
    } catch (error) {
      console.error("Failed to get FCM token:", error);
    }
  } else {
    console.log("No permission for notifications");
  }

  // 5. Handle Foreground Messages (App is OPEN)
  // When app is open, notifications don't popup automatically. We must trigger them.
    const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground Notification:', remoteMessage);
    
    // Schedule a local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || 'Thông báo mới',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data, // Keep the payload for navigation
      },
      trigger: null, // null means "show immediately"
    });
  });

  return unsubscribe;
}

// 6. Handle Background Messages (App is CLOSED/MINIMIZED)
// This must be called OUTSIDE of any component, usually in index.js or App.js
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Notification:', remoteMessage);
  // You don't need to do anything here. Android SDK handles the popup automatically.
});
