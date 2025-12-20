// src/auth/index.js
import { getMessaging, getToken, deleteToken } from '@react-native-firebase/messaging';
import { unregisterDeviceToken } from "../service/api/notification";
import { loginApi, logoutApi, getProfile } from "../service/api/auth";
import { useAuthStore } from "./store"; 

// Re-export store for convenience
export { useAuthStore };

// ===== SMART LOGOUT =====
// Use this in UI components instead of store.logout()
export async function logout() {
  const { refreshToken } = useAuthStore.getState();

  // 1. Unregister FCM (Best Effort)
  try {
    const messaging = getMessaging();
    const currentPushToken = await getToken(messaging).catch(() => null);
    
    if (currentPushToken) {
      console.log("Unregistering FCM Token:", currentPushToken);
      // We catch error here so logout flow doesn't stop if API fails
      await unregisterDeviceToken(currentPushToken).catch(err => console.log("API unregister failed:", err));
      await deleteToken(messaging).catch(() => null);
    }
  } catch (err) {
    console.log("FCM Logout Error:", err);
  }

  // 2. Call Backend Logout
  if (refreshToken) {
    try {
      await logoutApi({ refreshToken });
    } catch (e) {
      console.log("Backend Logout Error:", e);
    }
  }

  // 3. Local Cleanup (Zustand + SecureStore)
  await useAuthStore.getState().logout();
}

// ===== SMART LOGIN =====
export async function login({ email, password, deviceId }) {
  // Call API
  const response = await loginApi({ email, password, deviceId });
  
  // NOTE: Your unwrap function returns res.data. 
  // If backend returns { success: true, data: {...} }, then 'response' here is that whole object.
  // We need to check if the user/token is nested inside 'data' or at the top level.
  
  const actualData = response.data || response; 

  // Handle OTP Case
  if (actualData?.requiresOTP) {
    return { 
      requiresOTP: true, 
      userId: actualData.userId, 
      email: actualData.email 
    };
  }

  // Handle Success Case
  const token = actualData?.accessToken;
  
  if (token) {
    await useAuthStore.getState().setAuth({
      accessToken: token,
      refreshToken: actualData.refreshToken,
      user: actualData.user,
    });
  }
  
  return actualData;
}

// ===== ME (PROFILE) =====
export async function me() {
  const response = await getProfile();
  const actualData = response.data || response;

  const user = actualData?.user || actualData;
  
  if (user) {
    useAuthStore.getState().setUser(user);
    return user;
  }
  return null;
}
