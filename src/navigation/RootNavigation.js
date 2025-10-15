import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigation from "./TabNavigation";
import CreateGuestRegistrationScreen from "../screens/guest/CreateGuestRegistrationScreen";
import UpdateGuestRegistrationScreen from "../screens/guest/UpdateGuestRegistrationScreen";
import MaintenanceListScreen from "../screens/maintenance/MaintenanceListScreen";
import CreateMaintenanceRequestScreen from "../screens/maintenance/CreateMaintenanceRequestScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import GuestRegistrationListScreen from "../screens/guest/GuestRegistrationListScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={TabNavigation} />
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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyCodeScreen" component={VerifyCodeScreen} />
       <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />

      <Stack.Screen
        name="GuestRegistrationListScreen"
        component={GuestRegistrationListScreen}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
