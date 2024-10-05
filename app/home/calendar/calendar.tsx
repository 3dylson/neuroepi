import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, FAB } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import * as Localization from "expo-localization";
import AgendaInfiniteListScreen from "./agendaInfinite";
import AgendaScreen from "./agenda";

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    // Set the current date as the selected date
    new Date()
  );

  const [locale, setLocale] = useState("pt-PT");

  useEffect(() => {
    const getLocale = async () => {
      const locale = await Localization.getLocales();
      if (locale[0].languageCode) {
        setLocale(locale[0].languageTag);
        console.log("Locale: ", locale[0].languageTag);
      }
    };
    getLocale();
  }, []);

  // Sample event data based on the provided image
  const events = [
    { time: "9:30 AM", title: "What's new in Machine Learning", location: "" },
    { time: "1:00 PM", title: "Google I/O Keynote", location: "Auditório" },
    { time: "3:15 PM", title: "Developer Keynote", location: "Sala 123" },
    { time: "4:50 PM", title: "What's new in Android", location: "" },
  ];

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  return (
    <AgendaScreen />
    // <View style={styles.container}>
    //   {/* Calendar Component */}
    //   <Calendar
    //     current={selectedDate}
    //     onDayPress={onDayPress}
    //     markedDates={{
    //       [selectedDate.toLocaleDateString(locale)]: {
    //         selected: true,
    //         selectedColor: "green",
    //       },
    //     }}
    //     theme={{
    //       selectedDayBackgroundColor: "green",
    //       todayTextColor: "#00adf5",
    //       textDayFontWeight: "300",
    //       textMonthFontWeight: "500",
    //       textDayHeaderFontWeight: "500",
    //     }}
    //   />

    //   {/* Events List */}
    //   <ScrollView style={styles.eventList}>
    //     <Text style={styles.dateText}>
    //       {selectedDate.toDayMonthNameYearString(true)}
    //     </Text>
    //     {events.map((event, index) => (
    //       <Card key={index} style={styles.card}>
    //         <Card.Content>
    //           <Text style={styles.eventTime}>{event.time}</Text>
    //           <Text style={styles.eventTitle}>{event.title}</Text>
    //           {event.location ? (
    //             <Text style={styles.eventLocation}>{event.location}</Text>
    //           ) : null}
    //         </Card.Content>
    //       </Card>
    //     ))}
    //   </ScrollView>

    //   {/* Floating Action Button for Add Event */}
    //   <FAB
    //     style={styles.fab}
    //     icon="plus"
    //     onPress={() => console.log("Add Event")}
    //   />
    // </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  eventList: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2, // Shadow on Android
  },
  eventTime: {
    fontSize: 14,
    color: "#888",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  fab: {
    margin: 20,
    marginBottom: 40,
    alignSelf: "flex-end",
  },
});
