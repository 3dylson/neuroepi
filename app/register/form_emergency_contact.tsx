import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";

export default function FormEmergencyContact() {
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Atenção: Estes contatos serão acionados em caso de emergência."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu contato de emergência?
        </Text>
        <Text style={FormStyles.subtitle}>
          Insira o telefone para ser contatado em caso de emergência.
        </Text>
        <TextInput
          mode="outlined"
          label="Telefone 1"
          keyboardType="phone-pad"
          value={phone1}
          onChangeText={(text) => setPhone1(text)}
          style={FormStyles.input}
        />
        <TextInput
          mode="outlined"
          label="Telefone 2 (Opcional)"
          keyboardType="phone-pad"
          value={phone2}
          onChangeText={(text) => setPhone2(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.push("/register/form_diagnosis")}
      />
    </View>
  );
}
