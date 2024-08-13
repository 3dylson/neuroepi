import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";

export default function FormMyContact() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu contato?
        </Text>
        <Text style={FormStyles.subtitle}>
          Insira o telefone e o e-mail onde você pode ser contatado.
        </Text>
        <TextInput
          mode="outlined"
          label="Telefone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => setPhone(text)}
          style={FormStyles.input}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.push("/register/form_emergency_contact")}
      />
    </View>
  );
}
