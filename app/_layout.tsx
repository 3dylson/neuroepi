import { Colors } from "@/constants/Colors";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from "react-native-paper";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    colors: Colors.light,
  };

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          animation: "none",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
