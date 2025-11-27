// src/service/api/notification.js
import { Platform } from "react-native";
import http, { unwrap } from "../http"; // nếu http export khác thì chỉnh lại cho khớp

// Lấy danh sách thông báo của tenant đang đăng nhập
export async function getMyNotifications() {
  const { data } = await http.get("/notifications");
  return unwrap(data);
}

// Đánh dấu 1 thông báo đã đọc
export async function markNotificationRead(userNotificationId) {
  const { data } = await http.post(`/notifications/${userNotificationId}/read`);
  return unwrap(data);
}

// Đăng ký token thiết bị lên backend (để backend gửi push)
export async function registerDeviceToken(token) {
  const { data } = await http.post("/notifications/register-device", {
    token,
    device_type: Platform.OS === "ios" ? "IOS" : "ANDROID",
  });
  return unwrap(data);
}
