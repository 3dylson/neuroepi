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
import { User } from "@/app/model/User";

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
  >(null); // Retrieve this dynamically

  // Function to retrieve user's emergency contact from storage
  const loadUserEmergencyContact = async () => {
    const savedUser = await User.getFromLocal();
    if (savedUser && savedUser.emergencyContact) {
      setEmergencyContactNumber(savedUser.emergencyContact);
    } else {
      setEmergencyContactNumber(null); // Handle missing contact
    }
  };

  // Load emergency contact on component mount
  useEffect(() => {
    loadUserEmergencyContact();
  }, []);

  // Function to send emergency SMS or WhatsApp
  const sendEmergencyMessage = () => {
    if (!emergencyContactNumber) {
      Alert.alert("Nenhum contato de emergência encontrado.");
      return;
    }

    const message =
      "Estou a ter uma crise epiléptica. Por favor, ajuda-me. Localização atual:";

    const sendSMS = () => {
      const smsLink = `sms:${emergencyContactNumber}?body=${message}`;
      Linking.openURL(smsLink).catch(() => {
        Alert.alert("Failed to send SMS.");
      });
    };

    const sendWhatsApp = () => {
      const whatsappLink = `whatsapp://send?phone=${emergencyContactNumber}&text=${message}`;
      Linking.openURL(whatsappLink).catch(() => {
        Alert.alert("WhatsApp não instalado.");
      });
    };

    //TODO: Decide which platform to use based on user preference
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

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

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

      {/* <Text style={styles.instructionText}>
        Seu alerta foi enviado para seus contatos de emergência.
      </Text> */}

      {/* Button to trigger emergency message */}
      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendEmergencyMessage}
      >
        <Text style={styles.sendButtonText}>Enviar mensagem de emergência</Text>
      </TouchableOpacity>
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
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
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
