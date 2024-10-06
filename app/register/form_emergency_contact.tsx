import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import { User } from "../model/User";
import { PhoneRegex } from "../utils/StringUtils";

export default function FormEmergencyContact() {
  const [phone1, setPhone1] = useState<string>("");
  const [phone2, setPhone2] = useState<string>("");
  const [phone1Error, setPhone1Error] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  // Load user data and populate the emergency contact fields
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser?.emergencyContact) {
        setPhone1(savedUser.emergencyContact);
      }
      if (savedUser?.emergencyContact2) {
        setPhone2(savedUser.emergencyContact2);
      }
    };
    loadUserData();
  }, []);

  // Display alert if showHelpDialog is true
  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Atenção: Estes contatos serão acionados em caso de emergência."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  // Phone validation using regex
  const validatePhone = (input: string): boolean => {
    const phoneRegex = PhoneRegex;
    if (!input.match(phoneRegex)) {
      setPhone1Error("Telefone inválido.");
      return false;
    } else {
      setPhone1Error("");
      return true;
    }
  };

  // Handle phone input change
  const handlePhone1Change = (text: string) => {
    setPhone1(text);
    validatePhone(text);
  };

  // Check if form is valid
  useEffect(() => {
    setIsFormValid(validatePhone(phone1)); // Validate only phone1
  }, [phone1]);

  // Save or update user emergency contacts and navigate to the next screen
  const handleContinue = async () => {
    if (!isFormValid) {
      return;
    }

    let user = await User.getFromLocal();
    if (!user) {
      user = new User({ emergencyContact: phone1, emergencyContact2: phone2 });
    } else {
      await user.updateUserData({
        emergencyContact: phone1,
        emergencyContact2: phone2,
      });
    }

    router.push("/register/form_diagnosis"); // Navigate to the next screen
  };

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
          onChangeText={handlePhone1Change}
          style={FormStyles.input}
          error={!!phone1Error} // Highlight input if invalid
        />
        {phone1Error ? (
          <Text style={{ color: "red", marginBottom: 16 }}>{phone1Error}</Text>
        ) : null}

        <TextInput
          mode="outlined"
          label="Telefone 2 (Opcional)"
          keyboardType="phone-pad"
          value={phone2}
          onChangeText={(text) => setPhone2(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB icon="arrow-right" style={FormStyles.fab} onPress={handleContinue} />
    </View>
  );
}
