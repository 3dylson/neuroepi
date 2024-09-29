import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, IconButton, Chip } from "react-native-paper";
import { CustomButton } from "@/components/CustomButton";
import { DoseUnitEnum } from "@/constants/DoseUnitEnum";
import DropDownInput from "@/components/DropDownInput";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { generateId, isAndroid, isIOS } from "../utils/Utils";
import { DoseFrequency } from "@/constants/DoseFrequency";
import { Medicine } from "../model/Medicine";

interface BottomSheetAddMedicineScreenProps {
  onClose: () => void;
  onSave: (newMedicine: Medicine) => void;
}

enum ChipType {
  Epilepsy = "epilepsy",
  Other = "other",
}

const BottomSheetAddMedicineScreen: React.FC<
  BottomSheetAddMedicineScreenProps
> = ({ onClose, onSave }) => {
  const [formState, setFormState] = useState({
    name: "",
    dose: "",
    doseUnit: DoseUnitEnum.MG,
    frequency: null as DoseFrequency | null,
    notes: "",
    relatedMedication: "",
    epilepsyChipSelected: true,
    otherChipSelected: false,
    setAlarm: false,
  });

  const [timeList, setTimeList] = useState<string[]>([""]); // Initialize with one empty time input
  const [renderAndroidTimePicker, setRenderAndroidTimePicker] = useState(false);

  const handleChipPress = (chip: ChipType) => {
    setFormState((prev) => ({
      ...prev,
      epilepsyChipSelected: chip === ChipType.Epilepsy,
      otherChipSelected: chip === ChipType.Other,
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (index: number, value: string) => {
    const updatedTimes = [...timeList];
    updatedTimes[index] = value;
    setTimeList(updatedTimes);
  };

  const addTimeInput = () => {
    if (timeList[timeList.length - 1] !== "") {
      setTimeList([...timeList, ""]);
    }
  };

  const removeTimeInput = (index: number) => {
    const updatedTimes = [...timeList];
    updatedTimes.splice(index, 1);
    setTimeList(updatedTimes);
  };

  function checkLastTimeInputFilled() {
    return timeList[timeList.length - 1] !== "";
  }

  const handleSave = () => {
    const newMedicine: Medicine = new Medicine(
      generateId(),
      formState.name,
      formState.dose,
      formState.doseUnit,
      formState.frequency ?? DoseFrequency.OTHER, // Provide a default value if frequency is null
      timeList.filter((time) => time !== ""),
      formState.notes,
      formState.relatedMedication,
      formState.epilepsyChipSelected,
      formState.setAlarm
    );

    onSave(newMedicine);
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
          }}
        >
          {doseUnit}
        </Button>
      ))}
    </View>
  );

  const renderFrequencyPopoverContent = (
    selectItem: (item: string) => void
  ) => (
    <View style={styles.menu}>
      {Object.values(DoseFrequency).map((frequency) => (
        <Button
          key={frequency}
          mode="text"
          onPress={() => {
            selectItem(frequency);
            handleInputChange("frequency", frequency);
            console.log("Frequency selected:", frequency);
          }}
        >
          {frequency}
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
              handleTimeChange(timeList.length - 1, date.toHourMinuteString());
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
        <Button onPress={handleSave}>GUARDAR</Button>
      </View>

      <TextInput
        label="Nome"
        value={formState.name}
        onChangeText={(text) => handleInputChange("name", text)}
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
          keyboardType="numeric"
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
      {timeList.map((time, index) => (
        <View style={styles.row} key={index}>
          <DropDownInput
            label=""
            text={time}
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
          {index > 0 && (
            <IconButton
              icon="minus-circle-outline"
              onPress={() => removeTimeInput(index)}
            />
          )}

          {renderAndroidTimePicker && (
            <CustomDateTimePicker
              value={new Date()}
              mode="time"
              onChange={(event, date) => {
                if (date) {
                  setRenderAndroidTimePicker(false);
                  const timeString = date.toHourMinuteString();
                  handleTimeChange(index, timeString);
                }
              }}
              onDismiss={() => setRenderAndroidTimePicker(false)}
            />
          )}
        </View>
      ))}

      {checkLastTimeInputFilled() && (
        <CustomButton
          mode="text"
          style={{ marginBottom: 16 }}
          onPress={addTimeInput}
        >
          Adicionar Mais Doses
        </CustomButton>
      )}

      <DropDownInput
        label="Frequência"
        text={formState.frequency?.toString() ?? ""}
        textInputProps={{
          editable: false,
          mode: "outlined",
          style: [styles.input, { flex: 1, marginTop: 16 }],
          left: <TextInput.Icon icon="repeat" />,
        }}
        renderPopoverContent={renderFrequencyPopoverContent}
      />

      <Chip
        selected={formState.setAlarm}
        style={styles.alarmChip}
        onPress={() => handleInputChange("setAlarm", !formState.setAlarm)}
      >
        Adicionar Alarme
      </Chip>

      <Text style={styles.label}>Notas</Text>
      <TextInput
        value={formState.notes}
        multiline={true}
        onChangeText={(text) => handleInputChange("notes", text)}
        mode="outlined"
        style={styles.notesInput}
      />

      <CustomButton
        mode="contained"
        style={styles.saveButton}
        onPress={handleSave}
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
  alarmChip: {
    marginBottom: 32,
    width: "auto",
    alignSelf: "flex-start",
  },
  notesInput: {
    height: 80,
    marginBottom: 16,
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
