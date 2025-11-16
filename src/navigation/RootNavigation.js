// src/navigation/RootNavigation.js
import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Tabs (trang chính sau đăng nhập)
import TabNavigation from "./TabNavigation";

// Guest & Maintenance
import CreateGuestRegistrationScreen from "../screens/guest/CreateGuestRegistrationScreen";
import UpdateGuestRegistrationScreen from "../screens/guest/UpdateGuestRegistrationScreen";
import GuestRegistrationListScreen from "../screens/guest/GuestRegistrationListScreen";
import MaintenanceListScreen from "../screens/maintenance/MaintenanceListScreen";
import CreateMaintenanceRequestScreen from "../screens/maintenance/CreateMaintenanceRequestScreen";

// Auth flow
import LoginScreen from "../screens/auth/LoginScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";
import LoginOTPScreen from "../screens/auth/LoginOTPScreen";

// Profile
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";

// Bill
import BillListScreen from "../screens/bill/BillListScreen";
import OnlinePaymentScreen from "../screens/bill/OnlinePaymentScreen";
import TransactionHistoryScreen from "../screens/bill/TransactionHistoryScreen";

// Notification
import NotificationListScreen from "../screens/notification/NotificationListScreen";
import NotificationDetailScreen from "../screens/notification/NotificationDetailScreen";
import ChatbotScreen from "../screens/chatbot/ChatbotScreen";

// Auth store (đã tạo ở src/auth/index.js)
import { useAuthStore } from "../auth";

import * as SecureStore from "expo-secure-store";
// vehicle
import VehicleListScreen from "../screens/vehicle/VehicleListScreen";
import CreateVehicleScreen from "../screens/vehicle/CreateVehicleScreen";
import EditVehicleScreen from "../screens/vehicle/EditVehicleScreen";

//Regulation
import RegulationListScreen from "../screens/regulation/RegulationListScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { token, hydrated, hydrate } = useAuthStore();

  // Lấy token từ SecureStore 1 lần khi app mở
  useEffect(() => {
    hydrate();
    // const resetToken = async () => {
    //   await SecureStore.deleteItemAsync("sami_access_token");
    //   await SecureStore.deleteItemAsync("sami_refresh_token");
    // };
    // resetToken();
  }, []);

  // Chưa hydrate xong thì tạm thời không render navigator để tránh nhấp nháy
  if (!hydrated) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {token ? (
        // ====== ĐÃ ĐĂNG NHẬP: App stack ======
        <>
          <Stack.Screen
            name="TabNavigation"
            component={TabNavigation}
            options={{ headerShown: false }}
          />

          {/* Guest & Maintenance */}
          <Stack.Screen
            name="GuestRegistrationListScreen"
            component={GuestRegistrationListScreen}
          />
          <Stack.Screen
            name="CreateGuestRegistrationScreen"
            component={CreateGuestRegistrationScreen}
          />
          <Stack.Screen
            name="UpdateGuestRegistrationScreen"
            component={UpdateGuestRegistrationScreen}
          />
          <Stack.Screen
            name="MaintenanceListScreen"
            component={MaintenanceListScreen}
          />
          <Stack.Screen
            name="CreateMaintenanceRequestScreen"
            component={CreateMaintenanceRequestScreen}
          />

          {/* Bill */}
          <Stack.Screen name="BillListScreen" component={BillListScreen} />
          <Stack.Screen
            name="OnlinePaymentScreen"
            component={OnlinePaymentScreen}
          />
          <Stack.Screen
            name="TransactionHistoryScreen"
            component={TransactionHistoryScreen}
          />

          {/* Notification */}
          <Stack.Screen
            name="NotificationListScreen"
            component={NotificationListScreen}
          />
          <Stack.Screen
            name="NotificationDetailScreen"
            component={NotificationDetailScreen}
          />

          {/* Profile */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />

          {/* vehicle */}
          <Stack.Screen
            name="VehicleListScreen"
            component={VehicleListScreen}
          />
          <Stack.Screen
            name="CreateVehicleScreen"
            component={CreateVehicleScreen}
          />
          <Stack.Screen
            name="EditVehicleScreen"
            component={EditVehicleScreen}
          />
          {/* Regulation */}
          <Stack.Screen
            name="RegulationListScreen"
            component={RegulationListScreen}
          />

          {/* Chatbot */}
          <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        </>
      ) : (
        // ====== CHƯA ĐĂNG NHẬP: Auth stack ======
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LoginOTP"
            component={LoginOTPScreen}
            options={{ title: "Xác thực OTP" }}
          />
          <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          />
          <Stack.Screen name="VerifyCodeScreen" component={VerifyCodeScreen} />
          <Stack.Screen
            name="NewPasswordScreen"
            component={NewPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
