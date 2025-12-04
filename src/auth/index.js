// src/auth/index.js
import axios from "axios";
import Constants from "expo-constants";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "sami_access_token";
const REFRESH_KEY = "sami_refresh_token";

// Lấy API_URL từ app.json -> expo.extra.apiUrl
export const API_URL =
  (Constants?.expoConfig?.extra?.apiUrl || "").replace(/\/+$/, "") ||
  "https://aid-labeled-adapted-been.trycloudflare.com/api"; // TODO: đổi IP LAN của bạn

// ===== Store Auth (token, refresh, user) =====
export const useAuthStore = create((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [t, r] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
      ]);
      set({ token: t || null, refreshToken: r || null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setAuth: async ({ accessToken, refreshToken, user }) => {
    if (accessToken)
      await SecureStore.setItemAsync(TOKEN_KEY, String(accessToken));
    if (refreshToken)
      await SecureStore.setItemAsync(REFRESH_KEY, String(refreshToken));
    set({
      token: accessToken || null,
      refreshToken: refreshToken || null,
      user: user || null,
    });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
    set({ token: null, refreshToken: null, user: null });
  },
}));

// ===== Axios instance + interceptors =====
export const api = axios.create({
  baseURL: API_URL, // ví dụ: http://192.168.1.50:3000/api
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ===== Helpers =====
const unwrap = (response) => response?.data?.data ?? response?.data;

// ===== Services: Auth =====
export async function login({ email, password, deviceId }) {
  const headers = {};
  if (deviceId) headers["x-device-id"] = deviceId;

  const res = await api.post("/auth/login", { email, password }, { headers });
  const data = unwrap(res);

  // Nếu backend yêu cầu OTP (đăng nhập lần đầu)
  if (data?.requiresOTP) {
    return { requiresOTP: true, userId: data.userId, email: data.email };
  }

  // Login bình thường
  if (data?.accessToken) {
    await useAuthStore.getState().setAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
  }
  return data;
}

export async function verifyLoginOTP({ userId, otp }) {
  const res = await api.post("/auth/verify-otp", { userId, otp });
  const data = unwrap(res);
  if (data?.accessToken) {
    await useAuthStore.getState().setAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
  }
  return data;
}

export async function me() {
  const res = await api.get("/auth/profile");
  const data = unwrap(res);
  // backend có thể trả { user } hoặc trả user trực tiếp
  if (data?.user) {
    useAuthStore.getState().setUser(data.user);
    return data.user;
  }
  useAuthStore.getState().setUser(data);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const res = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return unwrap(res);
}

export async function logout() {
  try {
    // gọi API nếu backend có route /auth/logout (không bắt buộc)
    if (typeof api?.post === "function") {
      try {
        await api.post("/auth/logout");
      } catch (e) {
        /* optional ignore */
      }
    }
  } finally {
    // xóa token ở SecureStore
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
      ]);
    } catch {}

    // đưa store về trạng thái chưa đăng nhập
    try {
      // nếu file đã khai báo useAuthStore rồi:
      useAuthStore.getState().logout
        ? await useAuthStore.getState().logout()
        : useAuthStore.setState({
            token: null,
            refreshToken: null,
            user: null,
          });
    } catch {}
  }
}
