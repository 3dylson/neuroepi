import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { FAB, Text, RadioButton } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { Colors } from "@/constants/Colors";
import { SurgeryNeurostimulatorEnum } from "@/constants/SurgeryNeurostimulatorEnum";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import Dialog from "react-native-dialog";
import { User } from "../model/User";

export default function FormSurgeryNeurostimulator() {
  const [option, setOption] = useState<SurgeryNeurostimulatorEnum | "">("");
  const [visible, setVisible] = useState(false);
  const [surgeryInputValue, setSurgeryInputValue] = useState<string>("");
  const params = useLocalSearchParams();

  // Show surgery input dialog
  const showSurgeryDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const closeDialog = () => router.setParams({ showHelpDialog: "false" });

  // Handle radio button press
  const handleOnChipPress = (selected: SurgeryNeurostimulatorEnum) => {
    if (selected === SurgeryNeurostimulatorEnum.SURGERY) {
      showSurgeryDialog(); // Show surgery input dialog
    }
    setOption(selected);
  };

  // Load user data on mount and populate the form
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Retrieve saved user data
      if (savedUser?.surgery && savedUser.surgery.length > 0) {
        setOption(SurgeryNeurostimulatorEnum.SURGERY);
        setSurgeryInputValue(savedUser.surgery[0]); // Set surgery value
      } else if (
        savedUser?.neurostimulators &&
        savedUser.neurostimulators.length > 0
      ) {
        setOption(savedUser.neurostimulators[0] as SurgeryNeurostimulatorEnum); // Set neurostimulator value
      } else {
        setOption(SurgeryNeurostimulatorEnum.NONE); // Default to "None"
      }
    };
    loadUserData();
  }, []);

  // Show info dialog if needed
  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Cirurgias já realizadas para epilepsia ou uso de neuroestimuladores visando o controle da epilepsia."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

  // Handle saving data and navigate to the next screen
  const handleContinue = async () => {
    let user = await User.getFromLocal();

    if (!user) {
      user = new User({
        surgery:
          option === SurgeryNeurostimulatorEnum.SURGERY
            ? [surgeryInputValue]
            : [],
        neurostimulators: [option] as SurgeryNeurostimulatorEnum[],
      });
    } else {
      await user.updateUserData({
        surgery:
          option === SurgeryNeurostimulatorEnum.SURGERY
            ? [surgeryInputValue]
            : [],
        neurostimulators:
          option !== SurgeryNeurostimulatorEnum.SURGERY &&
          option !== SurgeryNeurostimulatorEnum.NONE
            ? [option]
            : [],
      });
    }

    router.push("/register/form_doctor_contact"); // Navigate to the next screen
  };

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Nome da Cirurgia</Dialog.Title>
          <Dialog.Input
            placeholder="Nome"
            value={surgeryInputValue}
            onChangeText={setSurgeryInputValue}
          />
          <Dialog.Button label="Cancelar" onPress={handleCancel} />
          <Dialog.Button label="OK" onPress={handleOk} />
        </Dialog.Container>

        <Text variant="headlineSmall" style={FormStyles.title}>
          Cirurgia / Neuroestimuladores:
        </Text>
        <RadioButton.Group
          onValueChange={(value) =>
            handleOnChipPress(
              SurgeryNeurostimulatorEnum[
                value as keyof typeof SurgeryNeurostimulatorEnum
              ] || value
            )
          }
          value={option}
        >
          {Object.values(SurgeryNeurostimulatorEnum).map((option, index) => (
            <View key={option}>
              <RadioButton.Item
                label={
                  option === SurgeryNeurostimulatorEnum.SURGERY &&
                  surgeryInputValue
                    ? `${surgeryInputValue}`
                    : option
                }
                value={option}
                style={styles.radioButtonItem}
                rippleColor={Colors.light.inversePrimary}
              />
            </View>
          ))}
        </RadioButton.Group>
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={handleContinue} // Save and continue
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
