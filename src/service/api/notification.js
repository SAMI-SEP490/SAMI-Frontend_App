// src/service/api/notification.js
import { Platform } from "react-native";
import { http, unwrap } from "../http"; // nếu http export khác thì chỉnh lại cho khớp

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

// Đánh dấu tất cả thông báo của 1 tenant là đã đọc
export function markAllNotificationsRead() {
  return unwrap(http.put("/notifications/read-all"));
}

// Đăng ký token thiết bị lên backend (để backend gửi push)
export async function registerDeviceToken(token) {
  const { data } = await http.post("/notifications/register-device", {
    token,
    device_type: Platform.OS === "ios" ? "IOS" : "ANDROID",
  });
  return unwrap(data);
}

// Hủy đăng ký token khi logout
export async function unregisterDeviceToken(token) {
  try {
    const { data } = await http.post("/notifications/unregister-device", { token });
    return unwrap(data);
  } catch (error) {
    // Silent fail: If unregister fails (e.g. offline), we still want to let the user logout
    console.log("Unregister token failed:", error);
  }
}
