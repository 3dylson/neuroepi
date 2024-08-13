import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native-paper";

export default function BounceScreen() {
  const getIsUserFormComplete = async () => {
    try {
      const userFormIsComplete = await AsyncStorage.getItem(
        DataKey.userFormIsComplete
      );
      if (
        userFormIsComplete !== null &&
        userFormIsComplete === DataKey.userFormIsComplete
      ) {
        router.replace("/home");
      } else {
        router.replace("/register");
      }
    } catch (e) {
      console.error(e);
      router.replace("/register");
    }
  };

  useEffect(() => {
    getIsUserFormComplete();
  }, []);

  return (
    <ActivityIndicator
      style={styles.container}
      size={"large"}
      animating={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Make the background darker
  },
});
