import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import Chroma from "chroma-js";
import * as Location from "expo-location"; // Use expo-location for location services
import { User } from "@/app/model/User";
import * as Linking from "expo-linking";
import { generateAndOpenPDF } from "@/app/utils/PdfUtils";

// Animation component
const PulsatingButton = Animatable.createAnimatableComponent(TouchableOpacity);

// Define vivid alert colors and spectrum lengths
const TOP_COLORS = ["#FF3D00", "#FF6F00", "#FFC400", "#FFEB3B"];
const BOTTOM_COLORS = ["#FF6F00", "#FF9100", "#FFD600", "#FF3D00"];
const GRADIENT_COLOR_LENGTH = 200; // Reduced gradient length for performance
const TOP_COLORS_SPECTRUM = Chroma.scale(TOP_COLORS).colors(
  GRADIENT_COLOR_LENGTH
);
const BOTTOM_COLORS_SPECTRUM = Chroma.scale(BOTTOM_COLORS).colors(
  GRADIENT_COLOR_LENGTH
);
const INTERVAL = 200; // Increased interval to reduce load

const IncidentAlertScreen: React.FC = () => {
  const navigation = useNavigation();
  const [emergencyContactNumber, setEmergencyContactNumber] = useState<
    string | null
  >(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Function to retrieve user's emergency contact from storage
  const loadUserEmergencyContact = async () => {
    const savedUser = await User.getFromLocal();
    if (savedUser && savedUser.emergencyContact) {
      setEmergencyContactNumber(savedUser.emergencyContact);
    } else {
      setEmergencyContactNumber(null); // Handle missing contact
    }
  };

  const redirectBackToAppUrl = Linking.createURL("home/sos/incident_alert");

  // Load emergency contact and location on component mount
  useEffect(() => {
    const initialize = async () => {
      await getCurrentLocation(); // Get the location before sending the message
      await loadUserEmergencyContact();
    };

    initialize();
  }, []);

  // Send emergency message when emergency contact and location are retrieved
  useEffect(() => {
    if (emergencyContactNumber && location) {
      sendEmergencyMessage();
    }
  }, [emergencyContactNumber, location]);

  // Request location permission and retrieve user's current location
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar a localização foi negada."
      );
      return;
    }

    // Get the current location if permission is granted
    const locationResult = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = locationResult.coords;
    setLocation({ latitude, longitude });
  };

  // Function to send emergency SMS or WhatsApp with location
  const sendEmergencyMessage = () => {
    if (!emergencyContactNumber) {
      Alert.alert("Nenhum contato de emergência encontrado.");
      return;
    }

    if (!location) {
      Alert.alert("Localização não disponível. Tente novamente.");
      return;
    }

    // Deep link and location URL
    const deepLink = redirectBackToAppUrl;
    const { latitude, longitude } = location;
    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Create the emergency message
    const message = `Estou a ter uma crise epiléptica. Por favor, ajuda-me.\nLocalização atual: ${locationLink}\nVoltar a neuroepi: ${deepLink}`;

    // Function to send SMS (plain text)
    const sendSMS = () => {
      const smsLink = `sms:${emergencyContactNumber}?body=${message}`;
      Linking.openURL(smsLink).catch(() => {
        Alert.alert("Falha ao enviar SMS.");
      });
    };

    // Function to send WhatsApp (encoded)
    const sendWhatsApp = () => {
      const whatsappMessage = encodeURIComponent(message);
      const whatsappLink = `whatsapp://send?phone=${emergencyContactNumber}&text=${whatsappMessage}`;
      Linking.openURL(whatsappLink).catch(() => {
        Alert.alert("WhatsApp não instalado.");
      });
    };

    //sendSMS();
    sendWhatsApp();
  };

  // Start the interval once when the component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % TOP_COLORS_SPECTRUM.length);
      setBottomIndex((prev) => (prev + 1) % BOTTOM_COLORS_SPECTRUM.length);
    }, INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  // Calculate colors based on indices without storing them in state
  const colorTop = TOP_COLORS_SPECTRUM[topIndex];
  const colorBottom = BOTTOM_COLORS_SPECTRUM[bottomIndex];

  const openEmergencySheet = () => {
    generateAndOpenPDF();
  };

  return (
    <LinearGradient colors={[colorTop, colorBottom]} style={styles.container}>
      <Text style={styles.headerText}>Alerta de emergência ativado!</Text>

      {/* Pulsating Button with improved animation and accessibility */}
      <PulsatingButton
        animation="pulse"
        iterationCount="infinite"
        duration={1000} // Slow down the animation for better performance
        style={styles.emergencyButton}
        onPress={openEmergencySheet}
        accessible={true} // Make the button accessible
        accessibilityLabel="Ver ficha de emergência" // Provide context for screen readers
        accessibilityHint="Pressione para ver detalhes de emergência" // Explain the action
      >
        <MaterialCommunityIcons name="alert-circle" size={40} color="white" />
        <Text style={styles.buttonText}>Ver Ficha de Emergência</Text>
      </PulsatingButton>

      {/* Button to trigger emergency message */}
      {/* <TouchableOpacity
        style={styles.sendButton}
        onPress={() => {
          sendEmergencyMessage(); // Then send the message with location
        }}
      >
        <Text style={styles.sendButtonText}>Enviar mensagem de emergência</Text>
      </TouchableOpacity> */}
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
    elevation: 5, // Reduced elevation to lighten load
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200, // Ensure the button is wide enough
    height: 80, // Ensure the button is tall enough for easy tapping
  },
  buttonText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  sendButton: {
    marginTop: 40,
    backgroundColor: "#FF3D00",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default IncidentAlertScreen;
