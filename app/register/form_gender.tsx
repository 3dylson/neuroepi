import React, { useState, useEffect } from "react";
import { useColorScheme, View, StyleSheet } from "react-native";
import { FAB, Text, RadioButton } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import Gender from "./utils/GenderEnum";
import { Colors } from "@/constants/Colors";
import { User } from "../model/User";

export default function FormGender() {
  const [gender, setGender] = useState<string>(""); // Set gender as a string
  const theme = useColorScheme() ?? "light";

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser?.gender) {
        setGender(savedUser.gender as string);
      }
    };
    loadUserData();
  }, []);

  // Save or update gender and navigate to the next screen
  const handleContinue = async () => {
    let user = await User.getFromLocal();

    if (!user) {
      user = new User({ gender: gender as Gender });
    } else {
      await user.updateUserData({ gender: gender as Gender });
    }

    router.push("/register/form_my_contact");
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu gênero?
        </Text>
        <Text style={FormStyles.subtitle} children={undefined}></Text>
        <RadioButton.Group
          onValueChange={(value) => setGender(value)} // Ensure value is string
          value={gender}
        >
          {Object.values(Gender).map((option, index) => (
            <RadioButton.Item
              key={index}
              label={option}
              value={option}
              style={styles.radioButtonItem}
              rippleColor={Colors.light.inversePrimary}
            />
          ))}
        </RadioButton.Group>
      </View>
      <FAB icon="arrow-right" style={FormStyles.fab} onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  radioButtonItem: {
    backgroundColor: Colors.light.primaryContainer,
    borderRadius: 8,
    marginVertical: 4,
  },
});
