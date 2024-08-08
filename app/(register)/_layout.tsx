import { Stack } from "expo-router";
import React from "react";
export default function RegisterLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register_form_name" options={{ headerTitle: "" }} />
    </Stack>
  );
}
