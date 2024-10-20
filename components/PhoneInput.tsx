import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { ActionSheetIOS } from "react-native";

interface CountryCode {
  code: string;
  label: string;
}

interface PhoneInputProps {
  value: string;
  onChangePhone: (phone: string) => void;
  onChangeCountryCode: (code: string) => void;
  errorMessage?: string;
  mode?: "flat" | "outlined";
  label?: string;
  style?: ViewStyle;
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
  mode = "flat",
  label = "Phone Number",
  style,
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

  // Handle iOS ActionSheet for country code selection
  const showCountryCodePickerIOS = () => {
    const options = countryCodes.map((country) => country.label);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options, "Cancel"],
        cancelButtonIndex: options.length,
      },
      (buttonIndex) => {
        if (buttonIndex < options.length) {
          const selectedCountry = countryCodes[buttonIndex];
          handleCodeChange(selectedCountry.code);
        }
      }
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {Platform.OS === "ios" ? (
          <TouchableOpacity
            style={styles.pickerIOS}
            onPress={showCountryCodePickerIOS}
          >
            <Text style={styles.pickerIOSText}>{selectedCode}</Text>
          </TouchableOpacity>
        ) : (
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
        )}

        <TextInput
          label={label}
          value={value}
          onChangeText={handlePhoneChange}
          style={styles.phoneInput}
          keyboardType="phone-pad"
          error={!!errorMessage}
          mode={mode}
          autoComplete="tel"
          returnKeyType="done"
        />
      </View>
      {errorMessage && <HelperText type="error">{errorMessage}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  picker: {
    width: 120,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  pickerIOS: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#ccc",
    padding: 10,
    justifyContent: "center",
  },
  pickerIOSText: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 8,
  },
});

export default PhoneInput;
