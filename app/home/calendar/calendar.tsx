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
import { Crise } from "@/app/model/Crise"; // Import Crise

interface State {
  items?: AgendaSchedule;
  markedDates: { [key: string]: any }; // To hold marked dates
}

export default class CalendarScreen extends Component<State> {
  state: State = {
    items: undefined,
    markedDates: {}, // Initialize empty marked dates
  };

  componentDidMount() {
    this.loadUserMedicinesAndCrises();
    //this.insertEmptyItems();
  }

  // Load both Medicines and Crises into the Calendar
  loadUserMedicinesAndCrises = async () => {
    const user = await User.getFromLocal(); // Fetch user data
    const crises = await Crise.getCrises(); // Fetch crises data

    const items = this.state.items || {};
    const markedDates: { [key: string]: any } = {}; // For holding the dates with crises and medicines marked
    const today = new Date(); // Get today's date

    // Add medicines to the calendar and mark the dates
    if (user && user.medicines) {
      user.medicines.forEach((medicine) => {
        this.addMedicineToCalendar(items, medicine, today);

        // Mark the date with a green dot for medicines
        const medicineDates = this.getMedicineDates(medicine, today); // A helper to get all dates for medicines
        medicineDates.forEach((strTime) => {
          if (!markedDates[strTime]) {
            markedDates[strTime] = { dots: [] };
          }
          markedDates[strTime].dots.push({ color: "green" });
        });
      });
    }

    // Add crises to the calendar and mark the dates
    if (crises) {
      crises.forEach((crise) => {
        this.addCriseToCalendar(items, crise);

        // Mark the date with a red dot for crises
        const strTime = this.timeToString(new Date(crise.dateTime!).getTime());
        if (!markedDates[strTime]) {
          markedDates[strTime] = { dots: [] };
        }
        markedDates[strTime].dots.push({ color: "red" });
      });
    }

    this.setState({ items, markedDates });
  };

  // A helper function to get all the dates when a medicine should appear on the calendar
  getMedicineDates = (medicine: Medicine, startDate: Date) => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const daysToGenerate = 30; // Number of days to generate

    for (let i = 0; i < daysToGenerate; i++) {
      if (this.isMedicineDueOnDate(medicine, currentDate)) {
        dates.push(this.timeToString(currentDate.getTime()));
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dates;
  };

  // Add medicine to the calendar based on its frequency and times
  addMedicineToCalendar = (
    items: AgendaSchedule,
    medicine: Medicine,
    startDate: Date
  ) => {
    const { frequency, times } = medicine;
    let currentDate = new Date(startDate);
    const daysToGenerate = 30; // Number of days to generate

    for (let i = 0; i < daysToGenerate; i++) {
      const strTime = this.timeToString(currentDate.getTime());

      if (this.isMedicineDueOnDate(medicine, currentDate)) {
        if (!items[strTime]) {
          items[strTime] = [];
        }

        times.forEach((time) => {
          items[strTime].push({
            name: `${medicine.name} (${time}) - ${medicine.dose} ${medicine.doseUnit}`,
            height: 60,
            day: strTime,
          });
        });
      }

      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  };

  // Add crises to the calendar
  addCriseToCalendar = (items: AgendaSchedule, crise: Crise) => {
    const strTime = this.timeToString(new Date(crise.dateTime!).getTime());

    if (!items[strTime]) {
      items[strTime] = [];
    }

    items[strTime].push({
      name: `Crise - ${crise.type || "Desconhecido"} (${
        crise.intensity || "N/A"
      })`,
      height: 60,
      day: strTime,
    });
  };

  // Check if the medicine is due on the given date based on frequency
  isMedicineDueOnDate = (medicine: Medicine, date: Date): boolean => {
    const dayOfWeek = date.getDay();
    switch (medicine.frequency) {
      case DoseFrequency.DAILY:
        return true; // Show every day
      case DoseFrequency.WEEKLY:
        return dayOfWeek === 0; // Every Sunday, for example
      case DoseFrequency.MONTHLY:
        return date.getDate() === 1; // First day of the month
      default:
        return false;
    }
  };

  render() {
    return (
      <Agenda
        testID={calendarIDs.agenda.CONTAINER}
        items={this.state.items}
        markedDates={this.state.markedDates} // Mark dates with crises
        markingType={"multi-dot"} // Allow multiple dots
        loadItemsForMonth={this.loadItems}
        selected={this.timeToString(new Date().getTime())} // Set today's date as selected
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEmptyDate}
        rowHasChanged={this.rowHasChanged}
        showClosingKnob={true}
        onDayPress={this.onDayPress}
      />
    );
  }

  loadItems = (day: DateData) => {
    // Logic to load items (if needed for other months)
    // if the day is not in the items, add an empty array
    // if (!this.state.items?.[day.dateString]) {
    //   let itemsWithoutEmpty = Object.keys(this.state.items || {}).reduce(
    //     (acc: any, key: string) => {
    //       if (this.state.items![key].length > 0) {
    //         console.log("Adding items for ", key);
    //         acc[key] = this.state.items![key];
    //       }
    //       return acc;
    //     },
    //     {}
    //   );
    //   this.setState({
    //     items: {
    //       ...itemsWithoutEmpty,
    //       [day.dateString]: [],
    //     },
    //   });
    // } else {
    //   console.log("Items already exist for ", day.dateString);
    // }
  };

  onDayPress = (day: DateData) => {
    console.log("Selected day: ", day);
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
        <Text>Nada Registrado para hoje</Text>
      </View>
    );
  };

  rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  };

  timeToString(time: number) {
    const date = new Date(time);
    // Convert to YYYY-MM-DD format
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure month is 2 digits
    const day = date.getDate().toString().padStart(2, "0"); // Ensure day is 2 digits
    return `${year}-${month}-${day}`;
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
});
