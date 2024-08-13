import { Alert } from "react-native";

export const RegisterInfoAlert = (text: string) => {
  Alert.alert(
    "Dica",
    text,
    [
      {
        text: "OK",
      },
    ],
    { userInterfaceStyle: "light" }
  );
};
