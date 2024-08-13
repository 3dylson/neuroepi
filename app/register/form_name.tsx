import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";

export default function FormName() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual o seu nome?
        </Text>
        <Text style={FormStyles.subtitle}>
          Digite o nome conforme está no seu documento de identificação.
        </Text>
        <TextInput
          mode="outlined"
          label="Primeiro nome"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={FormStyles.input}
        />
        <TextInput
          mode="outlined"
          label="Sobrenome"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.push("/register/form_birthday")}
      />
    </View>
  );
}
