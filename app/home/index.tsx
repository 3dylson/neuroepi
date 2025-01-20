import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // To add gradient to SOS button
import { IconButton, useTheme } from "react-native-paper";
import { router, useNavigation } from "expo-router";
import { generatePDF } from "../utils/PdfUtils";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system";
import DateRangePicker from "@/components/DateRangePicker";
import { isIOS } from "../utils/Utils";

const HomeLayout: React.FC = () => {
  const { colors } = useTheme(); // Using colors from theme for flexibility
  const [scale] = useState(new Animated.Value(1)); // Scale for SOS button press animation
  const navigation = useNavigation();
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const screenWidth = Dimensions.get("window").width;
  const cardSize = screenWidth / 3 - 20; // Dynamic card size

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            icon="account-circle"
            onPress={() => router.push("/home/profile/profile")}
            size={30}
          />
        </View>
      ),
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            icon="cog"
            onPress={() => router.push("/home/profile/app_config")}
            size={30}
          />
        </View>
      ),
    });
  }, [navigation]);

  // Function to handle press animation
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95, // Button scales down
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1, // Button scales back to original size
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  async function handleDateSelection(
    startDate: string | undefined,
    endDate: string | undefined
  ) {
    console.log("Selected dates:", startDate, endDate);
    if (startDate && endDate) {
      let allDayEndDate = new Date(endDate);
      allDayEndDate.setHours(23, 59, 59, 999);
      let pdfPath = await generatePDF(new Date(startDate), allDayEndDate);
      if (isIOS()) {
        router.push({
          pathname: "/home/sos/report_screen",
          params: { pdfPath: pdfPath },
        });
      } else {
        const contentUri = await FileSystem.getContentUriAsync(pdfPath);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      <DateRangePicker
        isVisible={showCalendar}
        onVisibilityChange={setShowCalendar}
        maximumDate={new Date()}
        onDateSelected={async (startDate, endDate) => {
          await handleDateSelection(startDate, endDate);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Neuroepi</Text>

        {/* Top Grid */}
        <View style={[styles.gridContainer, styles.centerLastRow]}>
          {[
            {
              emoji: "🚑",
              text: "Detalhamento de Crises",
              route: "/home/crise/crisis_list",
            },
            {
              emoji: "📅",
              text: "Calendário",
              route: "/home/calendar/calendar",
            },
            {
              emoji: "📚",
              text: "Informações Úteis",
              route: "/home/educate/educate",
            },
            {
              emoji: "💊",
              text: "Medicações em Uso",
              route: "/home/medicine/medicines",
            },
            { emoji: "📋", text: "Enviar Relatório", route: null },
          ].map((item, index, arr) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                { width: cardSize, height: cardSize },
                index >= arr.length - (arr.length % 3) &&
                  arr.length % 3 !== 0 &&
                  styles.centerCard,
              ]}
              onPress={() => {
                if (item.text === "Enviar Relatório") {
                  setShowCalendar(true);
                } else if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animated SOS Button */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push("/home/sos/incident_alert")}
            style={styles.sosButtonContainer}
          >
            <LinearGradient
              colors={["#6a11cb", "#2575fc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sosButton}
            >
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubText}>
                Avisar contato de emergência
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  centerLastRow: {
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffe5e5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  centerCard: {
    alignSelf: "center",
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  sosButtonContainer: {
    marginBottom: 30,
  },
  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF5F6D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sosText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  sosSubText: {
    fontSize: 14,
    paddingHorizontal: 10,
    color: "#fff",
    textAlign: "center",
  },
});

export default HomeLayout;
