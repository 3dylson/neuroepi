import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";

export default function BounceScreen() {
  const [loading, setLoading] = useState(true);

  function isUserFormComplete(userFormIsComplete: string | null) {
    /* TODO: return userFormIsComplete !== null &&
      userFormIsComplete === DataKey.userFormIsComplete; */
    return true;
  }

  const getIsUserFormComplete = async () => {
    console.log("Checking if user form is complete");

    try {
      const userFormIsComplete = await AsyncStorage.getItem(
        DataKey.userFormIsComplete
      );
      if (isUserFormComplete(userFormIsComplete)) {
        console.log("User form is complete");
        router.replace("/home");
      } else {
        console.log("User form is not complete");
        router.replace("/register");
      }
    } catch (e) {
      console.error(e);
      router.replace("/register");
    } finally {
      setLoading(false); // Set loading to false after navigation or in case of an error
    }
  };

  useEffect(() => {
    let isMounted = true; // track if component is mounted

    const checkFormCompletion = async () => {
      if (isMounted) {
        await getIsUserFormComplete();
      }
    };

    checkFormCompletion();

    return () => {
      isMounted = false; // Cleanup function to handle unmounting
    };
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.container}
        size={"large"}
        animating={true}
      />
    );
  }

  return null; // Render nothing once loading is done because we navigate away
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Make the background darker
  },
});
