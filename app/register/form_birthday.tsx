import React, { useState } from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { FormStyles } from "./styles/FormStyle";
import { router } from "expo-router";

export default function FormBirthday() {
  const [birthday, setBirthday] = useState(new Date());

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    console.log(selectedDate);
    setShowDatePicker(Platform.OS === "ios");
    setBirthday(selectedDate || birthday);
  };

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleTextInputClick = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é seu aniversário?
        </Text>
        <Text style={FormStyles.subtitle}>Escolha sua data de nascimento.</Text>
        {Platform.OS === "ios" ? (
          <CustomDateTimePicker
            value={birthday}
            mode="date"
            onChange={handleDateChange}
          />
        ) : (
          <TouchableOpacity onPress={handleTextInputClick}>
            <TextInput
              mode="outlined"
              label="Aniversário"
              editable={false}
              style={FormStyles.input}
              value={birthday.toLocaleDateString("pt-BR")}
            />
          </TouchableOpacity>
        )}
        {showDatePicker && Platform.OS !== "ios" && (
          <CustomDateTimePicker
            value={birthday}
            mode="date"
            onChange={handleDateChange}
            onDismiss={() => setShowDatePicker(false)}
          />
        )}
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.push("/register/form_gender")}
      />
    </View>
  );
}
