import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Alert } from "react-native"; 
import { useAuthStore } from "../auth"; // Import store để gọi hàm logout

export const baseURL = Constants.expoConfig.extra.apiUrl.replace(/\/+$/, "");

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ====== GẮN TOKEN TỰ ĐỘNG ======
http.interceptors.request.use(
  async (config) => {
    try {
      // Cách 1: Lấy từ SecureStore (như cũ)
      const token = await SecureStore.getItemAsync("sami_access_token");
      
      // Cách 2 (Tối ưu hơn): Lấy trực tiếp từ RAM (Zustand) nếu store đã hydrate xong
      // const token = useAuthStore.getState().token; 
      
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== XỬ LÝ LỖI (TOKEN HẾT HẠN) ======
// Biến cờ này giúp ngăn chặn việc hiển thị 5-6 cái Alert cùng lúc 
// nếu một màn hình gọi nhiều API đồng thời và tất cả đều lỗi 401.
let isSessionExpiredAlertShown = false;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Nếu server trả về lỗi 401 (Unauthorized)
    if (error?.response?.status === 401) {
      if (!isSessionExpiredAlertShown) {
        isSessionExpiredAlertShown = true; // Khóa lại ngay lập tức

        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục.",
          [
            {
              text: "Đồng ý",
              onPress: async () => {
                // 1. Mở khóa biến cờ
                isSessionExpiredAlertShown = false;
                
                // 2. Gọi hàm logout trong store
                // Hành động này sẽ set token = null trong Zustand
                await useAuthStore.getState().logout();
                
                // 3. RootNavigation sẽ tự động phát hiện token = null
                // và chuyển (re-render) sang màn hình Login.
              },
            },
          ],
          { cancelable: false } // Bắt buộc người dùng bấm "Đồng ý"
        );
      }
    }
    return Promise.reject(error);
  }
);

// ====== GỌN DỮ LIỆU ======
export async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    // Ưu tiên message từ backend gửi về
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Đã xảy ra lỗi trong quá trình gọi API.";
    throw new Error(message);
  }
}
