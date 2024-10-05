import { Stack } from "expo-router";
import React from "react";
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
      <Stack.Screen name="sos/incident_alert" />
      <Stack.Screen name="medicine/medicines" />
      <Stack.Screen name="calendar/calendar" />
    </Stack>
  );
}
