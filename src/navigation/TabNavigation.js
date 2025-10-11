import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import CreateGuestRegistration from "../screens/guest/CreateGuestRegistration";
import GuestRegistrationList from "../screens/guest/GuestRegistrationList";

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="GuestRegistrationList"
        component={GuestRegistrationList}
        options={{ title: "Danh sách đăng ký khách" }}
      />
    </Tab.Navigator>
  );
}
