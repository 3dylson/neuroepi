import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Linking } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { User } from "@/app/model/User";
import { DateUtils } from "@/app/utils/TimeUtils";
import { getAnyOtherDisease } from "@/app/utils/PdfUtils";
import { useKeepAwake } from "expo-keep-awake";

export default function EmergencySheetScreen() {
  useKeepAwake();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating={true} />
        <Text style={styles.loadingText}>Loading Emergency Information...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user data available.</Text>
      </View>
    );
  }

  const formattedBirthDate = user.birthDate
    ? DateUtils.toDayMonthYearString(user.birthDate)
    : "N/A";

  const medicinesUsed = user.medicines?.map((m) => m.name).join(", ") || "N/A";
  const allergiesList = user.allergies?.join(", ") || "N/A";
  const otherDiseases =
    getAnyOtherDisease(user.medicines || []).join(", ") || "N/A";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ficha de Emergência</Text>
      <Card style={styles.card}>
        <Text style={styles.sectionHeader}>Informações pessoais</Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Nome: </Text>
          {`${user.firstName} ${user.lastName}`}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Data de nascimento: </Text>
          {formattedBirthDate}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionHeader}>Contactos de emergência</Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Telefone: </Text>
          {user.emergencyContact || "N/A"}
        </Text>
        {/* <Button
          mode="contained"
          style={styles.button}
          onPress={() => Linking.openURL(`tel:${user.emergencyContact}`)}
        >
          Call Emergency Contact 1
        </Button> */}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionHeader}>Informações de saúde</Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Diagnóstico: </Text>
          {user.diagnostic || "N/A"}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Medicamentos em uso: </Text>
          {medicinesUsed}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Alergias: </Text>
          {allergiesList}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Outras doenças: </Text>
          {otherDiseases}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
  },
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007bff",
  },
  field: {
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
  },
});
