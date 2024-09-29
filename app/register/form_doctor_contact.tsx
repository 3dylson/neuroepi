import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";

export default function FormDoctorContact() {
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Contato do seu médico que o acompanha no acompanhamento da epilepsia."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o contato do seu médico?
        </Text>
        <Text style={FormStyles.subtitle}>
          Insira o telefone dos médicos que o acompanham no tratamento da
          epilepsia.
        </Text>
        <TextInput
          mode="outlined"
          label="Médico 1"
          keyboardType="phone-pad"
          value={phone1}
          onChangeText={(text) => setPhone1(text)}
          style={FormStyles.input}
        />
        <TextInput
          mode="outlined"
          label="Médico 2 (Opcional)"
          keyboardType="phone-pad"
          value={phone2}
          onChangeText={(text) => setPhone2(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.replace("/home")}
      />
    </View>
  );
}
