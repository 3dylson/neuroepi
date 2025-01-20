import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  RadioButton,
  Switch,
} from "react-native-paper";
import { CustomButton } from "@/components/CustomButton";
import { DoseUnitEnum } from "@/constants/DoseUnitEnum";
import DropDownInput from "@/components/DropDownInput";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { generateId, isAndroid, isIOS } from "../utils/Utils";
import { DoseFrequency } from "@/constants/DoseFrequency";
import { Medicine } from "../model/Medicine";
import {
  requestCalendarPermission,
  setNotificationAlarm,
} from "../utils/NotifUtils";
import { DateUtils } from "../utils/TimeUtils";

interface BottomSheetAddMedicineScreenProps {
  onClose: () => void;
  onSave: (newMedicine: Medicine) => void;
  medicine?: Medicine;
}

const BottomSheetAddMedicineScreen: React.FC<
  BottomSheetAddMedicineScreenProps
> = ({ onClose, onSave, medicine }) => {
  const [formState, setFormState] = useState({
    name: medicine?.name || "",
    dose: medicine?.dose || "",
    doseUnit: medicine?.doseUnit || DoseUnitEnum.MG,
    frequency: medicine?.frequency || DoseFrequency.DAILY,
    notes: medicine?.notes || "",
    relatedMedication: medicine?.relatedMedication || "",
    isForEpilepsy: medicine?.isForEpilepsy ?? true,
    setAlarm: medicine?.isAlarmSet || false,
  });

  // Pre-fill the timeList with medicine times or initialize with one empty time input
  const [timeList, setTimeList] = useState<string[]>(
    medicine?.times || [DateUtils.toHourMinuteString(new Date())]
  );
  const [renderAndroidTimePicker, setRenderAndroidTimePicker] = useState<
    null | number
  >(null);
  const [renderIOSTimePicker, setRenderIOSTimePicker] = useState<null | number>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAlarmSwitchChange = async (value: boolean) => {
    const calendarPermissionGranted = await requestCalendarPermission();
    console.log("Calendar permission granted:", calendarPermissionGranted);

    if (calendarPermissionGranted) {
      setFormState((prev) => ({ ...prev, setAlarm: value }));
    } else {
      setFormState((prev) => ({ ...prev, setAlarm: false }));
    }
  };

  const handleTimeChange: (index: number, value: string) => void = (
    index,
    value
  ) => {
    const updatedTimes = [...timeList];
    updatedTimes[index] = value;
    console.log("Updated times:", updatedTimes);
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

  const handleSave = async () => {
    const newMedicine: Medicine = new Medicine(
      generateId(),
      formState.name,
      formState.dose,
      formState.doseUnit,
      formState.frequency ?? DoseFrequency.DAILY,
      timeList.filter((time) => time !== ""),
      formState.notes,
      formState.relatedMedication,
      formState.isForEpilepsy,
      formState.setAlarm
    );

    await setNotificationAlarm(newMedicine);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <IconButton icon="close" onPress={onClose} />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Medicamento
          </Text>
          <Button onPress={handleSave}>GUARDAR</Button>
        </View>

        <TextInput
          label="Nome"
          returnKeyType="done"
          blurOnSubmit={true}
          value={formState.name}
          onChangeText={(text) => handleInputChange("name", text)}
          left={<TextInput.Icon icon="pill" />}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>Este medicamento é para:</Text>
        <RadioButton.Group
          onValueChange={(value) =>
            handleInputChange("isForEpilepsy", value === "epilepsy")
          }
          value={formState.isForEpilepsy ? "epilepsy" : "other"}
        >
          <View style={styles.radioGroup}>
            <RadioButton.Item label="Epilepsia" value="epilepsy" />
            <RadioButton.Item label="Outra condição" value="other" />
          </View>
        </RadioButton.Group>

        {formState.isForEpilepsy === false && (
          <TextInput
            label="Este medicamento está relacionado com"
            returnKeyType="done"
            blurOnSubmit={true}
            value={formState.relatedMedication}
            onChangeText={(text) =>
              handleInputChange("relatedMedication", text)
            }
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
            returnKeyType="done"
            blurOnSubmit={true}
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

        <View style={styles.switchContainer}>
          <Text>Adicionar Alarme</Text>
          <Switch
            value={formState.setAlarm}
            onValueChange={(value) => handleAlarmSwitchChange(value)}
          />
        </View>

        <Text style={styles.label}>Horários</Text>
        {timeList.map((time, index) => (
          <View style={styles.row} key={index}>
            {isAndroid() && (
              <DropDownInput
                label=""
                text={time}
                textInputProps={{
                  editable: false,
                  mode: "outlined",
                  style: styles.timeInput,
                }}
                // {...(isIOS() && {
                //   renderPopoverContent: renderTimePopoverContent,
                // })}
                customAction={() => {
                  if (isAndroid()) {
                    setRenderAndroidTimePicker(index);
                  }
                }}
              />
            )}

            {isIOS() && (
              <DateTimePicker
                value={time ? DateUtils.fromHourMinuteString(time) : new Date()}
                mode="time"
                display="clock"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    console.log("Selected date:", selectedDate);
                    handleTimeChange(
                      index,
                      DateUtils.toHourMinuteString(selectedDate)
                    );
                  }
                }}
              />
            )}

            {index > 0 && (
              <IconButton
                icon="minus-circle-outline"
                onPress={() => removeTimeInput(index)}
              />
            )}

            {renderAndroidTimePicker === index && (
              <CustomDateTimePicker
                value={new Date()}
                mode="time"
                display="spinner"
                onChange={(_event, date) => {
                  if (date) {
                    setRenderAndroidTimePicker(null);
                    const timeString = DateUtils.toHourMinuteString(date);
                    handleTimeChange(index, timeString);
                  }
                }}
                onDismiss={() => setRenderAndroidTimePicker(null)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    padding: 16,
    flexGrow: 1, // Allow the content to grow
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 26,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    zIndex: 1,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  rowDose: {
    flexDirection: "row",
    marginBottom: 24,
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
