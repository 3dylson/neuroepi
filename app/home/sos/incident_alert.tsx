import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import Chroma from "chroma-js";

// Animation component
const PulsatingButton = Animatable.createAnimatableComponent(TouchableOpacity);

// Define vivid alert colors and spectrum lengths
const TOP_COLORS = [
  "#FF3D00",
  "#FF6F00",
  "#FF9100",
  "#FFAB00",
  "#FFC400",
  "#FFD600",
  "#FFEB3B",
];
const BOTTOM_COLORS = [
  "#FF6F00",
  "#FF9100",
  "#FFAB00",
  "#FFC400",
  "#FFD600",
  "#FFEB3B",
  "#FF3D00",
];
const GRADIENT_COLOR_LENGTH = 700;
const TOP_COLORS_SPECTRUM = Chroma.scale(TOP_COLORS).colors(
  GRADIENT_COLOR_LENGTH
);
const BOTTOM_COLORS_SPECTRUM = Chroma.scale(BOTTOM_COLORS).colors(
  GRADIENT_COLOR_LENGTH
);
const INTERVAL = 55; // Reduced interval for faster color transition

const IncidentAlertScreen: React.FC = () => {
  const navigation = useNavigation();
  const emergencyContactNumber = "+123456789"; // Replace with actual contact number

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  // Function to send emergency SMS or WhatsApp
  const sendEmergencyMessage = () => {
    const message =
      "I need help! This is an emergency. Please contact me immediately.";

    const sendSMS = () => {
      const smsLink = `sms:${emergencyContactNumber}?body=${message}`;
      Linking.openURL(smsLink).catch(() => {
        Alert.alert("Failed to send SMS.");
      });
    };

    const sendWhatsApp = () => {
      const whatsappLink = `whatsapp://send?phone=${emergencyContactNumber}&text=${message}`;
      Linking.openURL(whatsappLink).catch(() => {
        Alert.alert("WhatsApp not installed.");
      });
    };

    if (Platform.OS === "android") {
      sendWhatsApp();
    } else {
      sendSMS();
    }
  };

  // Start the interval once when the component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % TOP_COLORS_SPECTRUM.length);
      setBottomIndex((prev) => (prev + 1) % BOTTOM_COLORS_SPECTRUM.length);
    }, INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []); // Run effect only once, when the component mounts

  // Calculate colors based on indices without storing them in state
  const colorTop = TOP_COLORS_SPECTRUM[topIndex];
  const colorBottom = BOTTOM_COLORS_SPECTRUM[bottomIndex];

  const openEmergencySheet = () => {
    //navigation.navigate("EmergencySheetScreen");
  };

  return (
    <LinearGradient colors={[colorTop, colorBottom]} style={styles.container}>
      <Text style={styles.headerText}>Alerta de emergência ativado!</Text>

      {/* Pulsating Button with improved animation and accessibility */}
      <PulsatingButton
        animation="pulse"
        iterationCount="infinite"
        style={styles.emergencyButton}
        onPress={openEmergencySheet}
        accessible={true} // Make the button accessible
        accessibilityLabel="Ver ficha de emergência" // Provide context for screen readers
        accessibilityHint="Press to view emergency details" // Explain the action
      >
        <MaterialCommunityIcons name="alert-circle" size={40} color="white" />
        <Text style={styles.buttonText}>Ver Ficha de Emergência</Text>
      </PulsatingButton>

      <Text style={styles.instructionText}>
        Seu alerta foi enviado para seus contatos de emergência.
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  emergencyButton: {
    backgroundColor: "transparent", // Remove background color
    borderRadius: 100,
    paddingVertical: 20,
    paddingHorizontal: 50,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 200, // Ensure the button is wide enough
    height: 80, // Ensure the button is tall enough for easy tapping
  },
  buttonText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default IncidentAlertScreen;
