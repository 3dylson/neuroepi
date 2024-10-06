import React, { Component } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  Agenda,
  DateData,
  AgendaEntry,
  AgendaSchedule,
} from "react-native-calendars";
import calendarIDs from "./calendarIDs";
import { DoseFrequency } from "@/constants/DoseFrequency";
import { User } from "@/app/model/User";
import { Medicine } from "@/app/model/Medicine";

interface State {
  items?: AgendaSchedule;
}

export default class CalendarScreen extends Component<State> {
  state: State = {
    items: undefined,
  };

  componentDidMount() {
    this.loadUserMedicines();
  }

  // Fetch User's Medicines and Load them into the Calendar
  loadUserMedicines = async () => {
    const user = await User.getFromLocal(); // Fetch user data from secure storage
    if (user && user.medicines) {
      const items = this.state.items || {};
      const today = new Date(); // Get today's date

      // Generate medicine events based on frequency and times
      user.medicines.forEach((medicine) => {
        this.addMedicineToCalendar(items, medicine, today);
      });

      this.setState({ items });
    } else {
      Alert.alert("Nenhum dado de usuário encontrado");
    }
  };

  // Add medicine to the calendar based on its frequency and times
  addMedicineToCalendar = (
    items: AgendaSchedule,
    medicine: Medicine,
    startDate: Date
  ) => {
    // Logic to add medicine entries based on frequency
    const { frequency, times } = medicine;
    let currentDate = new Date(startDate); // Start from today

    // Adjust number of days based on frequency (for this example, we'll do it for 30 days)
    const daysToGenerate = 30;
    for (let i = 0; i < daysToGenerate; i++) {
      const strTime = this.timeToString(currentDate.getTime());

      // Check if the medicine should be added for this date based on the frequency
      if (this.isMedicineDueOnDate(medicine, currentDate)) {
        if (!items[strTime]) {
          items[strTime] = [];
        }

        // Add medicine entry to the calendar for each time
        times.forEach((time) => {
          items[strTime].push({
            name: `${medicine.name} (${time}) - ${medicine.dose} ${medicine.doseUnit}`,
            height: 60,
            day: strTime,
          });
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  // Check if the medicine is due on the given date based on frequency
  isMedicineDueOnDate = (medicine: Medicine, date: Date): boolean => {
    const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, ...
    switch (medicine.frequency) {
      case DoseFrequency.DAILY:
        return true; // Show every day
      case DoseFrequency.WEEKLY:
        return dayOfWeek === 0; // For example, every Sunday
      case DoseFrequency.MONTHLY:
        return date.getDate() === 1; // For example, first day of the month
      // Add more cases based on your DoseFrequency enum
      default:
        return false;
    }
  };

  render() {
    return (
      <Agenda
        testID={calendarIDs.agenda.CONTAINER}
        items={this.state.items}
        loadItemsForMonth={this.loadItems}
        selected={this.timeToString(new Date().getTime())} // Set today's date as selected
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEmptyDate}
        rowHasChanged={this.rowHasChanged}
        showClosingKnob={true}
      />
    );
  }

  loadItems = (day: DateData) => {
    // You can keep this logic to handle loading more items if needed
  };

  renderItem = (reservation: AgendaEntry, isFirst: boolean) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? "black" : "#43515c";

    return (
      <TouchableOpacity
        testID={calendarIDs.agenda.ITEM}
        style={[styles.item, { height: reservation.height }]}
        onPress={() => Alert.alert(reservation.name)}
      >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
      </TouchableOpacity>
    );
  };

  renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text>This is an empty date!</Text>
      </View>
    );
  };

  rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  };

  timeToString(time: number) {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  customDay: {
    margin: 10,
    fontSize: 24,
    color: "green",
  },
  dayItem: {
    marginLeft: 34,
  },
});
