import React, { useState, useEffect } from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { FormStyles } from "./styles/FormStyle";
import { router } from "expo-router";
import { User } from "../model/User";

export default function FormBirthday() {
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load user data and populate the screen
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Fetch the saved user
      if (savedUser?.birthDate) {
        setBirthday(savedUser.birthDate); // Populate the birthday if available
      }
    };
    loadUserData();
  }, []);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    setBirthday(selectedDate || birthday);
  };

  const handleTextInputClick = () => {
    setShowDatePicker(true);
  };

  // Save or update user data and navigate to the next screen
  const handleContinue = async () => {
    let user = await User.getFromLocal();

    if (!user) {
      user = new User({ birthDate: birthday });
    }

    await user.updateUserData({ birthDate: birthday }); // Update user data
    router.push("/register/form_gender"); // Navigate to the next screen
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é a sua data de nascimento?
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
              label="Nascimento"
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
        onPress={handleContinue} // Use handleContinue to save and navigate
      />
    </View>
  );
}
