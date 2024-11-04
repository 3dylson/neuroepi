import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
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
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { generateId, isAndroid, isIOS } from "../utils/Utils";
import { DoseFrequency } from "@/constants/DoseFrequency";
import { Medicine } from "../model/Medicine";
import * as Notifications from "expo-notifications";
import {
  getDefaultCalendarId,
  getNextNotificationDates,
  requestCalendarPermission,
} from "../utils/NotifUtils";
import * as Calendar from "expo-calendar";
import * as Localization from "expo-localization";
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
  const [timeList, setTimeList] = useState<string[]>(medicine?.times || [""]);
  const [renderAndroidTimePicker, setRenderAndroidTimePicker] = useState<
    null | number
  >(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e: any) => {
    console.log("Key pressed:", e.nativeEvent.key);
    // Allow line breaks with Shift + Enter
    if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
      e.preventDefault(); // Prevent new line insertion
      Keyboard.dismiss(); // Dismiss the keyboard
      // You can also handle any submission logic here if needed
    }
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

  async function setNotificationAlarm(newMedicine: Medicine) {
    if (newMedicine.isAlarmSet) {
      const calendarPermissionGranted = await requestCalendarPermission();

      if (calendarPermissionGranted) {
        const notificationDates = getNextNotificationDates(
          newMedicine.times,
          newMedicine.frequency
        );

        notificationDates.forEach(async (notificationDate) => {
          // Schedule notifications
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Hora de tomar seu remédio!`,
              body: `Não se esqueça de tomar seu remédio: ${newMedicine.name}`,
              data: { medicineId: newMedicine.id },
            },
            trigger: {
              date: notificationDate,
            },
          });

          // Create calendar event
          const calendarId = await getDefaultCalendarId(); // Get the user's default calendar ID

          if (calendarId) {
            const deviceTimeZone = Localization.timezone;
            console.log("Device time zone:", deviceTimeZone);
            await Calendar.createEventAsync(calendarId, {
              title: `Tome seu remédio: ${newMedicine.name}`,
              startDate: notificationDate,
              endDate: new Date(notificationDate.getTime() + 30 * 60 * 1000), // Assume a 30-minute event
              timeZone: deviceTimeZone, // Adjust as needed for your time zone
              notes: newMedicine.notes,
            });

            console.log(
              "Calendar event added for medicine:",
              newMedicine.name,
              "at",
              notificationDate
            );
          } else {
            console.log("Default calendar ID not found");
          }
        });
      } else {
        console.log("Notification or calendar permissions not granted");
      }
    }
  }

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
              handleTimeChange(
                timeList.length - 1,
                DateUtils.toHourMinuteString(date)
              );
            }
          }}
        />
        {isIOS() && (
          <Button
            mode="contained"
            onPress={() => {
              if (selectedTime) {
                const timeString = DateUtils.toHourMinuteString(selectedTime);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        contentInsetAdjustmentBehavior="automatic"
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
                  setRenderAndroidTimePicker(index);
                }
              }}
            />
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
                onChange={(event, date) => {
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

        <View style={styles.switchContainer}>
          <Text>Adicionar Alarme</Text>
          <Switch
            value={formState.setAlarm}
            onValueChange={(value) => handleAlarmSwitchChange(value)}
          />
        </View>

        <Text style={styles.label}>Notas</Text>
        <TextInput
          value={formState.notes}
          multiline={true}
          onChangeText={(text) => handleInputChange("notes", text)}
          mode="outlined"
          onKeyPress={handleKeyPress} // Capture key presses
          onSubmitEditing={() => {
            // Handle the done action
            Keyboard.dismiss(); // To dismiss the keyboard
          }}
          returnKeyType="done" // This should show "Done" on the keyboard
          blurOnSubmit={true} // Blurs the TextInput on submit
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
    marginBottom: 16,
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
