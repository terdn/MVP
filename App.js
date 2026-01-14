import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SubscriptionScreen from "./screens/SubscriptionScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import CameraScreen from "./screens/CameraScreen";
import AnalysisScreen from "./screens/AnalysisScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Subscription"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
