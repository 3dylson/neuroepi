import React from "react";
import { Image, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { router } from "expo-router";

const RegisterLandingScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
      <ThemedText style={styles.text}>
        Preencha com atenção todas as suas informações. São essenciais para que
        você possa obter os melhores resultados do aplicativo
      </ThemedText>
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton
          title="Continuar"
          onPress={() => router.push("/register_form_name")}
        />
      </ThemedView>
    </ThemedView>
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

export default RegisterLandingScreen;
