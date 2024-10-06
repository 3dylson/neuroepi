import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  RadioButton,
  Checkbox,
  FAB,
  Divider,
  Card,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Crise } from "@/app/model/Crise";
import { generateId } from "@/app/utils/Utils";

interface CriseFormScreenProps {
  crise?: Crise; // Optional crise for editing
}

const CriseFormScreen: React.FC<CriseFormScreenProps> = ({ crise }) => {
  const [dateTime, setDateTime] = useState(crise?.dateTime || new Date());
  const [duration, setDuration] = useState(crise?.duration || "");
  const [type, setType] = useState(crise?.type || "");
  const [intensity, setIntensity] = useState(crise?.intensity || "");
  const [recoverySpeed, setRecoverySpeed] = useState(
    crise?.recoverySpeed || ""
  );
  const [symptomsBefore, setSymptomsBefore] = useState<string[]>(
    crise?.symptomsBefore || []
  );
  const [postState, setPostState] = useState(crise?.postState || "");
  const [tookMedication, setTookMedication] = useState(
    crise?.tookMedication || false
  );
  const [whatWasDoing, setWhatWasDoing] = useState(crise?.whatWasDoing || "");
  const [menstruationOrPregnancy, setMenstruationOrPregnancy] = useState(
    crise?.menstruationOrPregnancy || ""
  );
  const [alcohol, setAlcohol] = useState(crise?.alcohol || false);
  const [food, setFood] = useState(crise?.food || false);
  const [emotionalStress, setEmotionalStress] = useState(
    crise?.emotionalStress || ""
  );
  const [substanceUse, setSubstanceUse] = useState(
    crise?.substanceUse || false
  );
  const [selfHarm, setSelfHarm] = useState(crise?.selfHarm || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const params = useLocalSearchParams();

  const handleSave = async () => {
    const newCrise = new Crise({
      id: crise?.id || generateId(),
      dateTime,
      duration,
      type,
      intensity,
      recoverySpeed,
      symptomsBefore,
      postState,
      tookMedication,
      whatWasDoing,
      menstruationOrPregnancy,
      alcohol,
      food,
      emotionalStress,
      substanceUse,
      selfHarm,
    });

    await Crise.addOrUpdateCrise(newCrise);
    // Redirect or show success message
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge" style={styles.header}>
        Ficha Detalhe de Crise
      </Text>

      {/* Date and Time */}
      <Card style={styles.card}>
        <Card.Title title="Data e Hora" />
        <Card.Content>
          <TextInput
            label="Data e Hora"
            value={
              dateTime.toDayMonthYearString() +
              " - " +
              dateTime.toHourMinuteString()
            } // Format the date/time input
            onFocus={() => setShowDatePicker(true)}
            onPress={() => setShowDatePicker(true)}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateTime(selectedDate);
              }}
            />
          )}
        </Card.Content>
      </Card>

      {/* Duration */}
      <Card style={styles.card}>
        <Card.Title title="Duração da Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setDuration} value={duration}>
            <RadioButton.Item label="< 1 min" value="< 1 min" />
            <RadioButton.Item label="1 a 3 minutos" value="1 a 3 minutos" />
            <RadioButton.Item label="> 5 minutos" value="> 5 minutos" />
            <RadioButton.Item label="Não sei" value="Não sei" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Type of Crisis */}
      <Card style={styles.card}>
        <Card.Title title="Tipo de Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setType} value={type}>
            <RadioButton.Item label="Desmaio" value="Desmaio" />
            <RadioButton.Item label="Ausência" value="Ausência" />
            <RadioButton.Item label="Convulsão" value="Convulsão" />
            <RadioButton.Item label="Não sei" value="Não sei" />
            <RadioButton.Item label="Outras" value="Outras" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Intensity */}
      <Card style={styles.card}>
        <Card.Title title="Intensidade da Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setIntensity} value={intensity}>
            <RadioButton.Item label="Leve" value="Leve" />
            <RadioButton.Item label="Moderada" value="Moderada" />
            <RadioButton.Item label="Forte" value="Forte" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Recovery Speed */}
      <Card style={styles.card}>
        <Card.Title title="Recuperação da Crise" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={setRecoverySpeed}
            value={recoverySpeed}
          >
            <RadioButton.Item label="Imediata" value="Imediata" />
            <RadioButton.Item label="Rápida" value="Rápida" />
            <RadioButton.Item label="Demorada" value="Demorada" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Symptoms Before Crisis */}
      <Card style={styles.card}>
        <Card.Title title="Sintomas Antes da Crise" />
        <Card.Content>
          {[
            "Ansiedade/Palpitações",
            "Alterações de visão",
            "Dormência no corpo",
            "Outros",
          ].map((symptom) => (
            <Checkbox.Item
              key={symptom}
              label={symptom}
              status={
                symptomsBefore.includes(symptom) ? "checked" : "unchecked"
              }
              onPress={() =>
                setSymptomsBefore((prev) =>
                  prev.includes(symptom)
                    ? prev.filter((s) => s !== symptom)
                    : [...prev, symptom]
                )
              }
            />
          ))}
        </Card.Content>
      </Card>

      {/* Post Crisis State */}
      <Card style={styles.card}>
        <Card.Title title="Estado após a Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setPostState} value={postState}>
            <RadioButton.Item label="Sonolência" value="Sonolência" />
            <RadioButton.Item label="Confusão Mental" value="Confusão Mental" />
            <RadioButton.Item label="Normal" value="Normal" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Medication and other inputs (can continue as the same) */}
      <FAB icon="check" onPress={handleSave} style={styles.fab} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginVertical: 8,
  },
  fab: {
    marginTop: 16,
    marginBottom: 52,
    alignSelf: "center",
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    padding: 8,
    elevation: 2,
  },
});

export default CriseFormScreen;
