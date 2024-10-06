import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { Platform, TouchableOpacity, View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { User } from "../model/User";

export default function FormDiagnosis() {
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [diagnosisDate, setDiagnosisDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  // Retrieve saved user data on mount and populate form fields
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Fetch saved user
      if (savedUser?.diagnostic) {
        setDiagnosis(savedUser.diagnostic); // Populate diagnosis
      }
      if (savedUser?.diagnosticDate) {
        setDiagnosisDate(new Date(savedUser.diagnosticDate)); // Populate diagnosis date
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Caso não saiba seu diagnóstico, pergunte ao seu médico."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  // Handle date change
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    setDiagnosisDate(selectedDate || diagnosisDate);
  };

  const handleTextInputClick = () => {
    setShowDatePicker(true);
  };

  // Save or update user data and navigate to the next screen
  const handleContinue = async () => {
    let user = await User.getFromLocal();

    if (!user) {
      user = new User({
        diagnostic: diagnosis,
        diagnosticDate: diagnosisDate,
      });
    } else {
      await user.updateUserData({
        diagnostic: diagnosis,
        diagnosticDate: diagnosisDate,
      });
    }

    router.push("/register/form_medication"); // Navigate to the next screen
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu diagnóstico?
        </Text>
        <TextInput
          mode="outlined"
          label="Diagnóstico"
          value={diagnosis}
          multiline={true}
          onChangeText={(text) => setDiagnosis(text)}
          style={FormStyles.input}
        />
        {Platform.OS === "ios" && (
          <Text style={[FormStyles.subtitle, { marginTop: 30 }]}>
            Data do diagnóstico:
          </Text>
        )}
        {Platform.OS === "ios" ? (
          <CustomDateTimePicker
            value={diagnosisDate}
            mode="date"
            onChange={handleDateChange}
          />
        ) : (
          <TouchableOpacity onPress={handleTextInputClick}>
            <TextInput
              mode="outlined"
              label="Data do diagnóstico"
              editable={false}
              style={FormStyles.input}
              value={diagnosisDate.toLocaleDateString("pt-BR")}
            />
          </TouchableOpacity>
        )}
        {showDatePicker && Platform.OS !== "ios" && (
          <CustomDateTimePicker
            value={diagnosisDate}
            mode="date"
            onChange={handleDateChange}
            onDismiss={() => setShowDatePicker(false)}
          />
        )}
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={handleContinue} // Save and continue
      />
    </View>
  );
}
