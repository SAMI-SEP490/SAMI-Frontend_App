import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import CreateGuestRegistration from "../screens/guest/CreateGuestRegistration";

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
        name="CreateGuestRegistration"
        component={CreateGuestRegistration}
        options={{ title: "Đăng ký khách" }}
      />
    </Tab.Navigator>
  );
}
