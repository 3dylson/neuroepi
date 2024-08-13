import React from "react";
import { Stack, useRouter } from "expo-router";
import { IconButton } from "react-native-paper";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export default function RegisterLayout() {
  const router = useRouter();

  // Function to handle setting parameters
  const handleHelpPress = () => {
    router.setParams({ showHelpDialog: "true" });
  };

  // Reusable headerRight component
  const HeaderRightButton = () => (
    <IconButton icon="help-circle" onPress={handleHelpPress} />
  );

  // Common screen options for screens with the help button
  const screenWithHelpOptions: NativeStackNavigationOptions = {
    headerRight: HeaderRightButton,
  };

  return (
    <Stack
      screenOptions={{
        headerTitle: "",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="form_name" />
      <Stack.Screen name="form_birthday" />
      <Stack.Screen name="form_gender" />
      <Stack.Screen name="form_my_contact" />
      <Stack.Screen
        name="form_emergency_contact"
        options={screenWithHelpOptions}
      />
      <Stack.Screen name="form_diagnosis" options={screenWithHelpOptions} />
      <Stack.Screen name="form_medication" options={screenWithHelpOptions} />
    </Stack>
  );
}
