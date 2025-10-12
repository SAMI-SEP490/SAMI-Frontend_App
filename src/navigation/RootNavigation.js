import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigation from "./TabNavigation";
import CreateGuestRegistrationScreen from "../screens/guest/CreateGuestRegistrationScreen";
import UpdateGuestRegistrationScreen from "../screens/guest/UpdateGuestRegistrationScreen";
import MaintenanceListScreen from "../screens/maintenance/MaintenanceListScreen";
import CreateMaintenanceRequestScreen from "../screens/maintenance/CreateMaintenanceRequestScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
