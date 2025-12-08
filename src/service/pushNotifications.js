// src/service/pushNotifications.js
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  setBackgroundMessageHandler, 
  requestPermission, 
  AuthorizationStatus 
} from '@react-native-firebase/messaging';

import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';
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

  // Pass the messaging instance to the function
  const messaging = getMessaging();
  const authStatus = await requestPermission(messaging);
  
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export async function setupPushNotifications() {
  const hasPermission = await requestUserPermission();
  const messaging = getMessaging(); // Get the instance once
  
  if (hasPermission) {
    try {
      // 4. New Syntax: getToken(messaging)
      const token = await getToken(messaging);
      console.log('FCM Token:', token);
      
      if (token) {
        await registerDeviceToken(token);
      }
    } catch (error) {
      console.error("Failed to get FCM token:", error);
    }
  } else {
    console.log("No permission for notifications");
  }

  const unsubscribe = onMessage(messaging, async remoteMessage => {
    console.log('Foreground Notification:', remoteMessage);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || 'Thông báo mới',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
      },
      trigger: null,
    });
  });

  return unsubscribe;
}

// setBackgroundMessageHandler(messaging, callback)
// Note: This must be called immediately, so we call getMessaging() inline
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('Background Notification:', remoteMessage);
});
