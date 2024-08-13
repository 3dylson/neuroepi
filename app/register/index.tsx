import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { router } from "expo-router";
import { CustomButton } from "@/components/CustomButton";

const LandingScreen = () => {
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
          onPress={() => router.push("/register/form_name")}
        >
          Continuar
        </CustomButton>
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
