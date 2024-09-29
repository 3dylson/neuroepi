import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { FAB, Text, RadioButton } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { Colors } from "@/constants/Colors";
import { SurgeryNeurostimulatorEnum } from "@/constants/SurgeryNeurostimulatorEnum";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import Dialog from "react-native-dialog";

export default function FormSurgeryNeurostimulator() {
  const [option, setOption] = useState("");
  const params = useLocalSearchParams();
  const [visible, setVisible] = useState(false);
  const [surgeryInputValue, setSurgeryInputValue] = useState("");

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

  const handleOnChipPress = (selected: SurgeryNeurostimulatorEnum) => {
    console.log(selected);
    if (selected === SurgeryNeurostimulatorEnum.SURGERY) {
      showSurgeryDialog();
    }
    setOption(selected);
  };

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert(
        "Cirurgias já realizadas para epilepsia ou uso de neuroestimuladores visando o controle da epilepsia."
      );
      closeDialog();
    }
  }, [params.showHelpDialog]);

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
        <Text style={FormStyles.subtitle} children={undefined}></Text>
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
                  option +
                  (option === SurgeryNeurostimulatorEnum.SURGERY &&
                  surgeryInputValue
                    ? ` (${surgeryInputValue})`
                    : "")
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
        onPress={() => router.push("/register/form_doctor_contact")}
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
