import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import { PhoneRegex } from "../utils/StringUtils";
import { User } from "../model/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

export default function FormDoctorContact() {
  const [phone1, setPhone1] = useState<string>("");
  const [phone2, setPhone2] = useState<string>("");
  const [phone1Error, setPhone1Error] = useState<string>("");
  const [phone2Error, setPhone2Error] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const navigation = useNavigation<NavigationProp<ParamListBase>>(); // Specify navigation type

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  // Phone validation using regex
  const validatePhone = (input: string): boolean => {
    const phoneRegex = PhoneRegex;
    return phoneRegex.test(input);
  };

  const handlePhone1Change = (text: string) => {
    setPhone1(text);
    if (!validatePhone(text)) {
      setPhone1Error("Telefone inválido.");
    } else {
      setPhone1Error("");
    }
  };

  const handlePhone2Change = (text: string) => {
    setPhone2(text);
    if (text && !validatePhone(text)) {
      setPhone2Error("Telefone inválido.");
    } else {
      setPhone2Error("");
    }
  };

  // Method to save the userFormIsComplete flag
  const setUserFormComplete = async () => {
    try {
      await AsyncStorage.setItem(
        DataKey.userFormIsComplete,
        DataKey.userFormIsComplete
      );
      console.log("User form marked as complete");
    } catch (e) {
      console.error("Failed to set user form as complete:", e);
    }
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser?.medicPhone) {
        setPhone1(savedUser.medicPhone);
      }
      if (savedUser?.medicPhone2) {
        setPhone2(savedUser.medicPhone2);
      }
    };
    loadUserData();
  }, []);

  // Show help dialog if necessary
  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Contato do seu médico que o acompanha no acompanhamento da epilepsia."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  // Validate form
  useEffect(() => {
    setIsFormValid(
      !phone1Error &&
        validatePhone(phone1) &&
        (!phone2 || validatePhone(phone2))
    );
  }, [phone1, phone2, phone1Error, phone2Error]);

  // Handle saving the doctor contacts
  const handleContinue = async () => {
    if (!isFormValid) {
      return;
    }

    let user = await User.getFromLocal();
    if (!user) {
      user = new User({ medicPhone: phone1, medicPhone2: phone2 });
    } else {
      await user.updateUserData({ medicPhone: phone1, medicPhone2: phone2 });
    }

    // Mark the user form as complete
    await setUserFormComplete();

    navigation.reset({
      index: 0,
      routes: [{ name: "home" }],
    });
  };

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
          returnKeyType="done"
          value={phone1}
          onChangeText={handlePhone1Change}
          style={FormStyles.input}
          error={!!phone1Error} // Show error state if phone1 is invalid
        />
        {phone1Error ? (
          <Text style={{ color: "red", marginBottom: 16 }}>{phone1Error}</Text>
        ) : null}

        <TextInput
          mode="outlined"
          label="Médico 2 (Opcional)"
          keyboardType="phone-pad"
          value={phone2}
          returnKeyType="done"
          onChangeText={handlePhone2Change}
          style={FormStyles.input}
          error={!!phone2Error} // Show error state if phone2 is invalid
        />
        {phone2Error ? (
          <Text style={{ color: "red" }}>{phone2Error}</Text>
        ) : null}
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        disabled={!isFormValid} // Disable FAB if form is invalid
        onPress={handleContinue}
      />
    </View>
  );
}
