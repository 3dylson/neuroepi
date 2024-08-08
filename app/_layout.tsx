import { Stack } from "expo-router";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

export default function RootLayout() {
  //const colorScheme = useColorScheme(); // Only light theme is used

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(register)" options={{ headerShown: false }} />
        <Stack.Screen name="home_screen" options={{ headerTitle: "Test" }} />
      </Stack>
    </ThemeProvider>
  );
}
