// src/service/api/notification.js
import { Platform } from "react-native";
import { http, unwrap } from "../http";

// Lấy danh sách thông báo của tenant đang đăng nhập
export function getMyNotifications() {
  return unwrap(http.get("/notifications"));
}

// Đánh dấu 1 thông báo đã đọc
export function markNotificationRead(userNotificationId) {
  return unwrap(http.post(`/notifications/${userNotificationId}/read`));
}

// Đánh dấu tất cả thông báo của 1 tenant là đã đọc
export function markAllNotificationsRead() {
  return unwrap(http.put("/notifications/read-all"));
}

// Đăng ký token thiết bị lên backend (để backend gửi push)
export function registerDeviceToken(token) {
  return unwrap(http.post("/notifications/register-device", {
    token,
    device_type: Platform.OS === "ios" ? "IOS" : "ANDROID",
  }));
}

// Hủy đăng ký token khi logout
export function unregisterDeviceToken(token) {
  // unwrap handles the await internally
  return unwrap(http.post("/notifications/unregister-device", { token }));
}
