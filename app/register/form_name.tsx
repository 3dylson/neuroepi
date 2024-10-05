import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { User } from "../model/User";

export default function FormName() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    // Function to load the user data if it exists
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Fetch the saved user
      if (savedUser) {
        setFirstName(savedUser.firstName || ""); // Populate first name
        setLastName(savedUser.lastName || ""); // Populate last name
      }
    };

    loadUserData(); // Load user data on component mount
  }, []);

  // Function to handle the "Continue" button press
  const handleContinue = async () => {
    let user = await User.getFromLocal();

    if (!user) {
      // If no user exists, create and save a new user
      user = new User({ firstName, lastName });
      await user.saveToLocal(); // Save user to secure storage
    } else {
      // Update existing user with the new name
      await user.updateUserData({ firstName, lastName });
    }

    // Navigate to the next screen after saving/updating the user
    router.push("/register/form_birthday");
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual o seu nome?
        </Text>
        <Text style={FormStyles.subtitle}>
          Digite o nome conforme está no seu documento de identificação.
        </Text>
        <TextInput
          mode="outlined"
          label="Primeiro nome"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={FormStyles.input}
        />
        <TextInput
          mode="outlined"
          label="Sobrenome"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={FormStyles.input}
        />
      </View>
      <FAB icon="arrow-right" style={FormStyles.fab} onPress={handleContinue} />
    </View>
  );
}
