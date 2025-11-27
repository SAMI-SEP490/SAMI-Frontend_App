// src/service/pushNotifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerDeviceToken } from "./api/notification";

// Khi app đang mở mà có noti tới: vẫn hiện banner / sound
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupPushNotifications() {
  try {
    if (!Device.isDevice) {
      console.log("Push notifications chỉ hoạt động trên thiết bị thật.");
      return;
    }

    // Android cần channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // Hỏi quyền
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status !== "granted") {
      console.log("Người dùng từ chối quyền thông báo.");
      return;
    }

    // Lấy FCM token (Android) / APNS token (iOS)
    const pushToken = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("Device push token:", pushToken);

    if (!pushToken) return;

    // Gửi token lên backend để lưu vào device_tokens
    await registerDeviceToken(pushToken);
    console.log("Đã đăng ký device token với backend.");
  } catch (error) {
    console.log("setupPushNotifications error:", error);
  }
}
