import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigation from "./TabNavigation";
import CreateGuestRegistrationScreen from "../screens/guest/CreateGuestRegistrationScreen";
import UpdateGuestRegistrationScreen from "../screens/guest/UpdateGuestRegistrationScreen";
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
    </Stack.Navigator>
  );
}
