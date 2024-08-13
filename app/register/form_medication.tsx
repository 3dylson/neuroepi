import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import AddCard from "@/components/AddCard";

export default function FormMedication() {
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert("Medicamentos prescritos pelo médico.");
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Está tomando algum medicamento?
        </Text>
        <Text style={FormStyles.subtitle}>
          Liste todos os medicamentos que você está tomando atualmente, mesmo
          que não estejam relacionados à epilepsia.
        </Text>
        <AddCard
          text="Adicionar Medicamento"
          onPress={() => console.log("Add medication")}
        />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => console.log("Next")}
      />
    </View>
  );
}
