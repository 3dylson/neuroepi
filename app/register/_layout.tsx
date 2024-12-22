import React, { useEffect } from "react";
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Button, IconButton } from "react-native-paper";

export default function RegisterLayout() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Get the params from router
  const [showExitHeader, setShowExitHeader] = React.useState(false);

  useEffect(() => {
    if (params.id == "showSaveAndExit") {
      setShowExitHeader(true);
    }
  }, [params.id]);

  // Function to handle setting parameters
  const handleHelpPress = () => {
    router.setParams({ showHelpDialog: "true" });
  };

  // Reusable headerRight component
  const HeaderRightButton = () => (
    <IconButton icon="help-circle" onPress={handleHelpPress} />
  );

  return (
    <Stack
      screenOptions={{
        headerTitle: "",
        headerRight: () =>
          showExitHeader ? (
            <Button onPress={() => router.navigate("/home/profile/profile")}>
              Sair
            </Button>
          ) : null,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="form_name" />
      <Stack.Screen name="form_birthday" />
      <Stack.Screen name="form_gender" />
      <Stack.Screen name="form_my_contact" />
      <Stack.Screen
        name="form_emergency_contact"
        options={{ headerRight: HeaderRightButton }}
      />
      <Stack.Screen
        name="form_diagnosis"
        options={{ headerRight: HeaderRightButton }}
      />
      <Stack.Screen
        name="form_medication"
        options={{ headerRight: HeaderRightButton }}
      />
      <Stack.Screen name="form_medication_allergies" />
      <Stack.Screen
        name="form_surgery_neurostimulator"
        options={{ headerRight: HeaderRightButton }}
      />
      <Stack.Screen
        name="form_doctor_contact"
        options={{ headerRight: HeaderRightButton }}
      />
    </Stack>
  );
}
