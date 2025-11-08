// src/service/http.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const baseURL = "https://cigarless-rathely-harriett.ngrok-free.dev/api";

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ====== GẮN TOKEN TỰ ĐỘNG ======
http.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("sami_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("⚠️ Không tìm thấy token trong SecureStore.");
      }
    } catch (e) {
      console.error("❌ Lỗi khi lấy token từ SecureStore:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== XỬ LÝ LỖI CHUNG ======
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token hết hạn hoặc không hợp lệ.");
      SecureStore.deleteItemAsync("sami_access_token");
    }
    console.error("API Error:", error);
    return Promise.reject(error.response?.data || error);
  }
);

// ====== GỌN DỮ LIỆU ======
export async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    const message =
      error?.message ||
      error?.data?.message ||
      "Đã xảy ra lỗi trong quá trình gọi API.";
    throw new Error(message);
  }
}
