import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

interface CountryCode {
  code: string;
  label: string;
}

interface PhoneInputProps {
  value: string;
  onChangePhone: (phone: string) => void;
  onChangeCountryCode: (code: string) => void;
  errorMessage?: string;
}

const countryCodes: CountryCode[] = [
  { code: "+1", label: "United States (+1)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+91", label: "India (+91)" },
  { code: "+61", label: "Australia (+61)" },
  // Add more country codes as needed
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangePhone,
  onChangeCountryCode,
  errorMessage,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(
    countryCodes[0].code
  );

  const handlePhoneChange = (text: string) => {
    onChangePhone(text);
  };

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    onChangeCountryCode(code);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Picker
          selectedValue={selectedCode}
          style={styles.picker}
          onValueChange={handleCodeChange}
        >
          {countryCodes.map((country) => (
            <Picker.Item
              key={country.code}
              label={country.label}
              value={country.code}
            />
          ))}
        </Picker>
        <TextInput
          label="Phone Number"
          value={value}
          onChangeText={handlePhoneChange}
          style={styles.phoneInput}
          keyboardType="phone-pad"
          error={!!errorMessage}
        />
      </View>
      {errorMessage && <HelperText type="error">{errorMessage}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  picker: {
    width: 120,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 8,
  },
});

export default PhoneInput;
