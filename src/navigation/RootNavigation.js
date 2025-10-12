import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigation from "./TabNavigation";
import LoginScreen from "../screens/auth/LoginScreen";
import CreateGuestRegistration from "../screens/guest/CreateGuestRegistration";
import UpdateGuestRegistration from "../screens/guest/UpdateGuestRegistration";
const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigation} />
      <Stack.Screen
        name="CreateGuestRegistration"
        component={CreateGuestRegistration}
      />
      <Stack.Screen
        name="UpdateGuestRegistration"
        component={UpdateGuestRegistration}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
       />
       </Stack.Navigator>
  );
}
