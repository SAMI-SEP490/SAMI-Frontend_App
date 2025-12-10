// src/auth/store.js
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "sami_access_token";
export const REFRESH_KEY = "sami_refresh_token";

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

  // This is the "Dumb" logout (just clears state)
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
    set({ token: null, refreshToken: null, user: null });
  },
}));
