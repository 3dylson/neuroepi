import { User } from "@/app/model/User";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, IconButton, Card } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { generateAndOpenPDF, generateAndSharePDF } from "@/app/utils/PdfUtils";
import DateRangePicker from "@/components/DateRangePicker";

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const openEmergencySheet = () => {
    setShowCalendar(true);
  };

  // Load user data (first and last name) when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser) {
        setFirstName(savedUser.firstName || "");
        setLastName(savedUser.lastName || "");
      }
    };
    loadUserData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <DateRangePicker
        isVisible={showCalendar}
        onVisibilityChange={setShowCalendar}
        onDateSelected={(startDate, endDate) => {
          console.log("Selected dates:", startDate, endDate);
          if (startDate && endDate) {
            console.log("Generating PDF...");
            let allDayEndDate = new Date(endDate);
            allDayEndDate.setHours(23, 59, 59, 999);
            generateAndSharePDF(new Date(startDate), allDayEndDate)
              .then(() => {
                console.log("PDF generated and shared successfully.");
              })
              .catch((error) => {
                console.error("Error generating or sharing PDF:", error);
              });
          }
        }}
      />
      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <IconButton
            icon="account"
            size={80}
            iconColor={Colors.light.onPrimaryContainer}
          />
        </View>
        {/* Display first and last name */}
        <Text style={styles.username}>
          {firstName} {lastName}
        </Text>
      </View>

      {/* Group 1: Registered Crisis and Patient Information */}
      <View style={styles.cardGroup}>
        {/* <TouchableOpacity onPress={() => {}}>
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Crises Registradas</Text>
              <IconButton icon="chevron-right" size={24} onPress={() => {}} />
            </View>
          </Card>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/register/form_name",
              params: { id: "showSaveAndExit" },
            });
          }}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>
                Consultar ou Editar Minhas Informações
              </Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => {
                  router.push("/register/form_name");
                }}
              />
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Group 2: Share Medical Record and Settings */}
      <View style={styles.cardGroup}>
        <TouchableOpacity
          onPress={() => {
            openEmergencySheet();
          }}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>
                Compartilhar meu registro médico
              </Text>
              <IconButton
                icon="share"
                size={24}
                onPress={() => {
                  openEmergencySheet();
                }}
              />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.push("/home/profile/app_config");
          }}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Configurações da app</Text>
              <IconButton
                icon="cog"
                size={24}
                onPress={() => {
                  router.push("/home/profile/app_config");
                }}
              />
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: Colors.light.primaryContainer,
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
  cardGroup: {
    marginVertical: 16,
  },
  card: {
    backgroundColor: Colors.light.primaryContainer,
    marginVertical: 8,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardText: {
    fontSize: 16,
  },
});
