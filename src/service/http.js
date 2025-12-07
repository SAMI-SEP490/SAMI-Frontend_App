// src/service/http.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export const baseURL = (
  Constants?.expoConfig?.extra?.apiUrl ||
  "https://itself-watch-danny-store.trycloudflare.com/api"
).replace(/\/+$/, "");

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
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== GỌN DỮ LIỆU ======
export async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Đã xảy ra lỗi trong quá trình gọi API.";
    throw new Error(message);
  }
}
