import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigation from "./navigation/RootNavigation";
import { RootProvider } from "./contexts/RootProvider";

export default function App() {
  return (
    <NavigationContainer>
      <RootProvider>
        <RootNavigation />
      </RootProvider>
    </NavigationContainer>
  );
}
