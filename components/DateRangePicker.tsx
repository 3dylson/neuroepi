import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface DateRangePickerProps {
  isVisible: boolean; // Control visibility from the parent
  onVisibilityChange: (visible: boolean) => void; // Callback to change visibility
  onDateSelected: (startDate?: string, endDate?: string) => void; // Callback to return selected dates
  maximumDate?: Date; // Optional maximum date
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isVisible,
  onVisibilityChange,
  onDateSelected,
  maximumDate,
}) => {
  const [startDate, setStartDate] = useState<DateData | undefined>(undefined);
  const [endDate, setEndDate] = useState<DateData | undefined>(undefined);

  const onDayPress = (day: DateData) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(undefined); // Reset end date if a new start date is selected
    } else if (startDate && !endDate) {
      if (day.dateString >= startDate.dateString) {
        setEndDate(day); // Set end date if it's after the start date
      } else {
        setStartDate(day); // Reset to new start date if selected end date is before the start date
      }
    }
  };

  // Helper function to get dates between two date strings
  const getDatesInRange = (start: string, end: string) => {
    const dateArray: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  };

  // Function to mark selected dates on the calendar
  const markedDates = {
    [startDate?.dateString || ""]: {
      selected: true,
      marked: true,
      color: "#4A90E2", // Use a consistent blue color
    },
    [endDate?.dateString || ""]: {
      selected: true,
      marked: true,
      color: "#4A90E2", // Use the same blue color for consistency
    },
    ...(startDate &&
      endDate && {
        // Mark dates in between
        ...getDatesInRange(startDate.dateString, endDate.dateString).reduce(
          (acc, date) => {
            acc[date] = { color: "#A2C2E6", selected: false }; // Light blue for range dates
            return acc;
          },
          {} as Record<string, any>
        ),
      }),
  };

  const handleConfirm = () => {
    onDateSelected(startDate?.dateString, endDate?.dateString); // Pass selected dates to the callback
    onVisibilityChange(false); // Close the picker
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => onVisibilityChange(false)} // Close modal on request
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione o intervalo de datas</Text>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType={"period"}
            maxDate={maximumDate} // Set the maximum date
          />
          {startDate && (
            <Text style={styles.dateText}>
              Data de início: {startDate.dateString}
            </Text>
          )}
          {endDate && (
            <Text style={styles.dateText}>
              Data de término: {endDate.dateString}
            </Text>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm} // Use the handleConfirm function
          >
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onVisibilityChange(false)} // Close picker on cancel
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  openButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateText: {
    marginVertical: 5,
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#4CAF50", // Green for confirm
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336", // Red for cancel
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
});

export default DateRangePicker;
