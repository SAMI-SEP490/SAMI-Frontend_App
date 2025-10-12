import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigation from "./TabNavigation";
import CreateGuestRegistration from "../screens/guest/CreateGuestRegistration";
import UpdateGuestRegistration from "../screens/guest/UpdateGuestRegistration";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigation} />
      <Stack.Screen
        name="CreateGuestRegistration"
        component={CreateGuestRegistration}
      />
      <Stack.Screen
        name="UpdateGuestRegistration"
        component={UpdateGuestRegistration}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
