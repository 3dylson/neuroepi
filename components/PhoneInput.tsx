import React, { useState, useEffect } from "react";
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
  defaultCountryCode?: string; // New prop for passing the default country code
}

const fallbackCountryCodes: CountryCode[] = [
  { code: "+55", label: "Brazil (+55)" },
  { code: "+351", label: "Portugal (+351)" },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangePhone,
  onChangeCountryCode,
  errorMessage,
  mode = "flat",
  label = "Phone Number",
  style,
  defaultCountryCode, // Add defaultCountryCode prop here
}) => {
  const [countryCodes, setCountryCodes] =
    useState<CountryCode[]>(fallbackCountryCodes);
  const [selectedCode, setSelectedCode] = useState<string>(
    defaultCountryCode || "+  "
  );

  // Fetch country codes from API
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        // Extract country names and calling codes
        const fetchedCountryCodes = data
          .map((country: any) => ({
            code: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
            label: `${country.name.common} (${country.idd?.root}${
              country.idd?.suffixes?.[0] || ""
            })`,
          }))
          .filter((country: any) => country.code) // Ensure that the country has a valid code
          .sort((a: CountryCode, b: CountryCode) =>
            a.label.localeCompare(b.label)
          ); // Sort by country name

        // Prepend Brazil and Portugal to the sorted list
        const finalCountryCodes = [
          ...fallbackCountryCodes,
          ...fetchedCountryCodes,
        ];

        setCountryCodes(finalCountryCodes);

        // Set default country code from props if it exists
        if (defaultCountryCode) {
          const country = finalCountryCodes.find(
            (c) => c.code === defaultCountryCode
          );
          if (country) {
            setSelectedCode(defaultCountryCode);
          } else {
            setSelectedCode(finalCountryCodes[0].code);
          }
        } else {
          setSelectedCode(finalCountryCodes[0].code); // Set first country as default
        }
      } catch (error) {
        // On failure, fallback to Brazil and Portugal
        console.error("Failed to fetch country codes, using fallback.");
        setCountryCodes(fallbackCountryCodes);
        setSelectedCode(defaultCountryCode || fallbackCountryCodes[0].code);
      }
    };

    fetchCountryCodes();
  }, [defaultCountryCode]);

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
