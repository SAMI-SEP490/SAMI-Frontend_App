import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigation from "./navigation/RootNavigation";
import * as Linking from 'expo-linking';

const linking = {
  // This allows the app to recognize "sami://" and "exp://" (for development)
  prefixes: [Linking.createURL('/'), 'sami://'],
  
  // Map routes to screen names inside your RootNavigator
  config: {
    screens: {
      DashboardScreen: 'dashboard', 
    },
  },
};

export default function App() {
  return (
    // Wrap the whole app in SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <RootNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
