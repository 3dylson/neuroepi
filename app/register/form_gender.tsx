import React, { useState } from "react";
import { useColorScheme, View, StyleSheet } from "react-native";
import { FAB, Text, RadioButton } from "react-native-paper";
import { router } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import Gender from "./utils/GenderEnum";
import { Colors } from "@/constants/Colors";

export default function FormGender() {
  const [gender, setGender] = useState("");
  const theme = useColorScheme() ?? "light";

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu gênero?
        </Text>
        <Text style={FormStyles.subtitle} children={undefined}></Text>
        <RadioButton.Group
          onValueChange={(value) => setGender(value)}
          value={gender}
        >
          {Object.values(Gender).map((option, index) => (
            <RadioButton.Item
              key={index}
              label={option}
              value={option}
              //style={{ marginTop: index === 2 ? 16 : 0 }}
              style={styles.radioButtonItem}
              rippleColor={Colors.light.inversePrimary}
            />
          ))}
        </RadioButton.Group>
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => router.push("/register/form_my_contact")}
      />
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
