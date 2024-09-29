import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";
export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="educate/educate" />
      <Stack.Screen name="educate/details" />
    </Stack>
  );
}
