import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // To add gradient to SOS button
import { IconButton, useTheme } from "react-native-paper";
import { router, useNavigation } from "expo-router";

const HomeLayout: React.FC = () => {
  const { colors } = useTheme(); // Using colors from theme for flexibility
  const [scale] = useState(new Animated.Value(1)); // Scale for SOS button press animation
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="account-circle"
          onPress={() => router.push("/home/profile/profile")}
        />
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>NEUROEPI</Text>

      {/* Top Grid */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/home/crise/crisis_list")}
        >
          <Text style={styles.cardEmoji}>🚑</Text>
          <Text style={styles.cardText}>Crises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/home/calendar/calendar")}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardText}>Calendário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/home/educate/educate")}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>📚</Text>
          <Text style={styles.cardText}>Informações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/home/medicine/medicines")}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>💊</Text>
          <Text style={styles.cardText}>Medicação</Text>
        </TouchableOpacity>
      </View>

      {/* Animated SOS Button */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push("/home/sos/incident_alert")} // Add your SOS action here
          style={styles.sosButtonContainer}
        >
          <LinearGradient
            colors={["#FF5F6D", "#FFC371"]} // Gradient for a modern look
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosButton}
          >
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubText}>Avisar contato de emergência</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Lighter background for a modern look
    alignItems: "center",
    justifyContent: "space-between", // More balanced layout
    paddingVertical: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#333", // Darker color for better contrast
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffe5e5", // Softer pink for the cards
    width: 150, // Adjust based on design
    height: 150,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 15, // Increased margin for better spacing
    shadowColor: "#000", // Add shadow for a modern look
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8, // Shadow for Android
  },
  cardEmoji: {
    fontSize: 55, // Larger emoji for a modern feel
    marginBottom: 10, // Space between the emoji and text
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sosButtonContainer: {
    marginBottom: 30, // Bottom padding for the SOS button
  },
  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF5F6D", // Red glow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10, // Elevation for Android
  },
  sosText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff", // White text for contrast against gradient
  },
  sosSubText: {
    fontSize: 14,
    paddingHorizontal: 10, // Padding for better spacing
    color: "#fff", // Matching color for text consistency
  },
});

export default HomeLayout;
