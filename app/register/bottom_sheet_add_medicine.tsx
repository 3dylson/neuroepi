import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, IconButton, Chip } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

export default function BottomSheetAddMedicineScreen() {
  const [dose, setDose] = useState("1000");
  const [frequency, setFrequency] = useState("Diariamente");
  const [time, setTime] = useState("09:30");
  const [notes, setNotes] = useState("This is notes");

  return (
    <View>
      <View style={styles.header}>
        <IconButton icon="close" onPress={() => console.log("Close pressed")} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Add Medicine
        </Text>
        <Button onPress={() => console.log("Save pressed")}>GUARDAR</Button>
      </View>

      <TextInput
        label="Nome"
        value="Aptiom"
        left={<TextInput.Icon icon="pill" />}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.chipGroup}>
        <Chip
          selected
          style={styles.chip}
          onPress={() => console.log("Epilepsy selected")}
        >
          Epilepsy
        </Chip>
        <Chip style={styles.chip} onPress={() => console.log("Other selected")}>
          Other
        </Chip>
      </View>

      <Text style={styles.label}>This Medicine is related to</Text>
      <Text style={styles.note}>Allergies</Text>

      <View style={styles.row}>
        <TextInput
          label="Dose"
          value={dose}
          onChangeText={setDose}
          mode="outlined"
          style={[styles.input, styles.doseInput]}
        />
        <TextInput
          value="mg"
          editable={false}
          mode="outlined"
          style={[styles.input, styles.unitInput]}
        />
      </View>

      <Text style={styles.label}>Horários</Text>
      <View style={styles.row}>
        <TextInput
          value={time}
          onChangeText={setTime}
          mode="outlined"
          left={<TextInput.Icon icon="clock-outline" />}
          style={[styles.input, styles.timeInput]}
        />
        <IconButton
          icon="minus-circle-outline"
          onPress={() => console.log("Remove time")}
        />
      </View>
      <Button mode="text" onPress={() => console.log("Add more doses pressed")}>
        Adicionar Mais Doses
      </Button>

      <TextInput
        label="Frequência"
        value={frequency}
        onChangeText={setFrequency}
        left={<TextInput.Icon icon="repeat" />}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="outlined"
        icon="alarm"
        style={styles.alarmButton}
        onPress={() => console.log("Adicionar Alarme pressed")}
      >
        Adicionar Alarme
      </Button>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        style={[styles.input, styles.notesInput]}
      />

      <Button
        mode="contained"
        style={styles.saveButton}
        onPress={() => console.log("Guardar pressed")}
      >
        Guardar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  chipGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  note: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  doseInput: {
    flex: 3,
    marginRight: 8,
  },
  unitInput: {
    flex: 1,
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  alarmButton: {
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
