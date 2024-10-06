import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { TextInput, FAB, Text } from "react-native-paper";
import { router } from "expo-router";
import { TextInputMask } from "react-native-masked-text";
import { FormStyles } from "./styles/FormStyle";
import { User } from "../model/User";
import { EmailRegex, PhoneRegex } from "../utils/StringUtils";

export default function FormMyContact() {
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Load user data and populate the phone and email fields
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Fetch saved user
      if (savedUser?.phoneNumber) {
        setPhone(savedUser.phoneNumber); // Populate phone if available
      }
      if (savedUser?.email) {
        setEmail(savedUser.email); // Populate email if available
      }
    };
    loadUserData();
  }, []);

  // Phone validation
  const validatePhone = (input: string) => {
    const phoneRegex = PhoneRegex;
    if (!input.match(phoneRegex)) {
      setPhoneError("Telefone inválido.");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };

  // Email validation
  const validateEmail = (input: string) => {
    const emailRegex = EmailRegex;
    if (!input.match(emailRegex)) {
      setEmailError("Email inválido.");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Handle input changes and validation
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    validatePhone(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  // Check if the form is valid
  useEffect(() => {
    setIsFormValid(validatePhone(phone) && validateEmail(email));
  }, [phone, email]);

  // Save or update user contact details and navigate to the next screen
  const handleContinue = async () => {
    if (!isFormValid) {
      return;
    }

    let user = await User.getFromLocal();

    if (!user) {
      user = new User({ phoneNumber: phone, email });
    } else {
      await user.updateUserData({ phoneNumber: phone, email });
    }

    router.push("/register/form_emergency_contact"); // Navigate to the next screen
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Qual é o seu contato?
        </Text>
        <Text style={FormStyles.subtitle}>
          Insira o telefone e o e-mail onde você pode ser contatado.
        </Text>
        <TextInput
          mode="outlined"
          label="Telefone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          style={FormStyles.input}
          error={!!phoneError} // Display error state if phone is invalid
        />
        {phoneError ? (
          <Text style={{ color: "red", marginBottom: 16 }}>{phoneError}</Text>
        ) : null}

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={handleEmailChange}
          style={FormStyles.input}
          error={!!emailError} // Display error state if email is invalid
        />
        {emailError ? <Text style={{ color: "red" }}>{emailError}</Text> : null}
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        // disabled={!isFormValid} // Disable the button if form is invalid
        onPress={handleContinue}
      />
    </View>
  );
}
