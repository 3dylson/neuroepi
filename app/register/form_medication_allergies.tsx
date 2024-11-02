import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { User } from "../model/User";
import { debounce } from "lodash";

export default function FormMedicationAllergies() {
  const [medicationAllergies, setMedicationAllergies] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    // Load user data if it exists
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser) {
        setMedicationAllergies(savedUser.allergies || []);
        setInputValue((savedUser.allergies ?? []).join(", ")); // Set the initial input value
      }
    };

    loadUserData();
  }, []);

  const handleContinue = async () => {
    // Filter out unwanted terms from the medication allergies
    const filteredAllergies = medicationAllergies.filter(
      (allergy) => !["não", "nenhum", "nada"].includes(allergy.toLowerCase())
    );

    let user = await User.getFromLocal();

    if (!user) {
      user = new User({ allergies: filteredAllergies });
      await user.saveToLocal();
    } else {
      await user.updateUserData({ allergies: filteredAllergies });
    }

    router.push("/register/form_surgery_neurostimulator");
  };

  const handleSetAllergies = debounce((text: string) => {
    const allergiesArray = text
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0); // Filter out empty values
    setMedicationAllergies(allergiesArray);
  }, 300); // 300ms debounce

  const handleInputChange = (text: string) => {
    setInputValue(text);
    handleSetAllergies(text);
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Alergia a algum medicamento ou substância?
        </Text>
        <Text style={FormStyles.subtitle}>
          Separe os itens por vírgula. Deixe em branco se não houver.
        </Text>
        <TextInput
          mode="outlined"
          label="Alergias"
          placeholder="Ex: Penicilina, Aspirina"
          value={inputValue}
          onChangeText={handleInputChange}
          style={FormStyles.input}
        />
      </View>
      <FAB icon="arrow-right" style={FormStyles.fab} onPress={handleContinue} />
    </View>
  );
}
