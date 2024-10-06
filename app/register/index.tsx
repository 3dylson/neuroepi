import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import * as Location from "expo-location";
import { router } from "expo-router";
import { CustomButton } from "@/components/CustomButton";

const LandingScreen = () => {
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);

  // Function to request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setHasLocationPermission(true);
      router.push("/register/form_name");
    } else {
      Alert.alert(
        "Permissão de localização negada",
        "Este aplicativo precisa de permissão de localização para funcionar corretamente."
      );
    }
  };

  // Handle the "Continuar" button press
  const handleContinuePress = () => {
    requestLocationPermission();
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
      <Text variant="bodyLarge" style={styles.text}>
        Preencha com atenção todas as suas informações. São essenciais para que
        você possa obter os melhores resultados do aplicativo
      </Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          mode="contained"
          onPress={handleContinuePress} // Call permission function on button press
        >
          Continuar
        </CustomButton>
        {__DEV__ && (
          <CustomButton mode="text" onPress={() => router.replace("/home")}>
            Pular Registro
          </CustomButton>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
    marginTop: 40,
  },
  text: {
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 40,
    position: "absolute",
    bottom: 0,
  },
});

export default LandingScreen;
