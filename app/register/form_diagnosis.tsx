import React, { useEffect, useState } from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { Platform, TouchableOpacity, View } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function FormDiagnosis() {
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const params = useLocalSearchParams();

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    console.log(selectedDate);
    setShowDatePicker(Platform.OS === "ios");
    setDiagnosisDate(selectedDate || diagnosisDate);
  };

  const handleTextInputClick = () => {
    setShowDatePicker(true);
  };

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Caso não saiba seu diagnóstico, pergunte ao seu médico."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu diagnóstico?
        </Text>
        <Text style={FormStyles.subtitle} children={undefined}></Text>
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
        onPress={() => router.push("/register/form_medication")}
      />
    </View>
  );
}
