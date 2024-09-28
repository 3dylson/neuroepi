import React, { useState, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, TextInput, Button, IconButton, Chip } from "react-native-paper";
import { CustomButton } from "@/components/CustomButton";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import { DoseUnitEnum } from "@/constants/DoseUnitEnum"; // Ensure this path is correct and DoseUnitEnum is properly defined
import DropDownInput from "@/components/DropDownInput";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { isAndroid, isIOS } from "../utils/Utils";

interface BottomSheetAddMedicineScreenProps {
  onClose: () => void;
  onSave: () => void;
}

enum ChipType {
  Epilepsy = "epilepsy",
  Other = "other",
}

const BottomSheetAddMedicineScreen: React.FC<
  BottomSheetAddMedicineScreenProps
> = ({ onClose, onSave }) => {
  const [formState, setFormState] = useState({
    nome: "",
    dose: "",
    doseUnit: DoseUnitEnum.MG,
    frequency: "",
    time: "",
    notes: "",
    relatedMedication: "",
    epilepsyChipSelected: true,
    otherChipSelected: false,
  });
  const [renderAndroidTimePicker, setRenderAndroidTimePicker] = useState(false);

  const handleChipPress = (chip: ChipType) => {
    setFormState((prev) => ({
      ...prev,
      epilepsyChipSelected: chip === ChipType.Epilepsy,
      otherChipSelected: chip === ChipType.Other,
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const renderDoseUnitPopoverContent = (selectItem: (item: string) => void) => (
    <View style={styles.menu}>
      {Object.values(DoseUnitEnum).map((doseUnit) => (
        <Button
          key={doseUnit}
          mode="text"
          onPress={() => {
            selectItem(doseUnit);
            handleInputChange("doseUnit", doseUnit);
            console.log("Dose unit selected:", doseUnit);
          }}
        >
          {doseUnit}
        </Button>
      ))}
    </View>
  );

  const renderTimePopoverContent = (selectItem: (item: string) => void) => {
    const [selectedTime, setSelectedTime] = useState<Date>(new Date());

    return (
      <View style={styles.menu}>
        <CustomDateTimePicker
          value={selectedTime}
          mode="time"
          onChange={(event, date) => {
            if (date) {
              setSelectedTime(date);
            }
          }}
        />
        {isIOS() && (
          <Button
            mode="contained"
            onPress={() => {
              if (selectedTime) {
                const timeString = selectedTime.toHourMinuteString();
                selectItem(timeString);
                handleInputChange("time", timeString);
                console.log("Time selected:", timeString);
              }
            }}
          >
            Confirmar
          </Button>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={onClose} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Medicamento
        </Text>
        <Button onPress={onSave}>GUARDAR</Button>
      </View>

      <TextInput
        label="Nome"
        value={formState.nome}
        onChangeText={(text) => handleInputChange("nome", text)}
        left={<TextInput.Icon icon="pill" />}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.chipGroup}>
        <Chip
          selected={formState.epilepsyChipSelected}
          style={styles.chip}
          onPress={() => handleChipPress(ChipType.Epilepsy)}
        >
          Epilepsia
        </Chip>
        <Chip
          selected={formState.otherChipSelected}
          style={styles.chip}
          onPress={() => handleChipPress(ChipType.Other)}
        >
          Outro
        </Chip>
      </View>

      {formState.otherChipSelected && (
        <TextInput
          label="Este medicamento está relacionado com"
          value={formState.relatedMedication}
          onChangeText={(text) => handleInputChange("relatedMedication", text)}
          mode="outlined"
          style={styles.input}
        />
      )}

      <View style={styles.rowDose}>
        <TextInput
          label="Dose"
          value={formState.dose}
          onChangeText={(text) => handleInputChange("dose", text)}
          mode="outlined"
          style={styles.doseInput}
        />
        <DropDownInput
          label="Unidade"
          text={formState.doseUnit.toString()}
          textInputProps={{
            editable: false,
            mode: "outlined",
            style: styles.unitInput,
          }}
          renderPopoverContent={renderDoseUnitPopoverContent}
        />
      </View>

      <Text style={styles.label}>Horários</Text>
      <View style={styles.row}>
        {/* <TextInput
          value={formState.time}
          onChangeText={(text) => handleInputChange("time", text)}
          mode="outlined"
          left={<TextInput.Icon icon="clock-outline" />}
          style={styles.timeInput}
        /> */}

        <DropDownInput
          label=""
          text={formState.time}
          textInputProps={{
            editable: false,
            mode: "outlined",
            style: styles.timeInput,
          }}
          {...(isIOS() && {
            renderPopoverContent: renderTimePopoverContent,
          })}
          customAction={() => {
            if (isAndroid()) {
              setRenderAndroidTimePicker(true);
            }
          }}
        />
        <IconButton
          icon="minus-circle-outline"
          onPress={() => console.log("Remove time")}
        />

        {renderAndroidTimePicker && (
          <CustomDateTimePicker
            value={new Date()}
            mode="time"
            onChange={(event, date) => {
              if (date) {
                setRenderAndroidTimePicker(false);
                const timeString = date.toHourMinuteString();
                handleInputChange("time", timeString);
                console.log("Time selected:", timeString);
              }
            }}
            onDismiss={() => setRenderAndroidTimePicker(false)}
          />
        )}
      </View>

      <CustomButton
        mode="text"
        onPress={() => console.log("Add more doses pressed")}
      >
        Adicionar Mais Doses
      </CustomButton>

      <TextInput
        label="Frequência"
        value={formState.frequency}
        onChangeText={(text) => handleInputChange("frequency", text)}
        left={<TextInput.Icon icon="repeat" />}
        mode="outlined"
        style={styles.input}
      />

      <CustomButton
        mode="outlined"
        icon="alarm"
        style={styles.alarmButton}
        onPress={() => console.log("Adicionar Alarme pressed")}
      >
        Adicionar Alarme
      </CustomButton>

      <Text style={styles.label}>Notas</Text>
      <TextInput
        value={formState.notes}
        onChangeText={(text) => handleInputChange("notes", text)}
        mode="outlined"
        style={styles.notesInput}
      />

      <CustomButton
        mode="contained"
        style={styles.saveButton}
        onPress={() => console.log("Guardar pressed")}
      >
        Guardar
      </CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 34,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  chipGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  rowDose: {
    flexDirection: "row",
    marginBottom: 34,
  },
  doseInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  alarmButton: {
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  menu: {
    padding: 8,
    borderRadius: 4,
  },
});

export default BottomSheetAddMedicineScreen;
