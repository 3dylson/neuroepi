import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { TextInput, FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View, StyleSheet } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import AddCard from "@/components/AddCard";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheetAddMedicineScreen from "./bottom_sheet_add_medicine";

export default function FormMedication() {
  const params = useLocalSearchParams();
  // ref for bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  // state to control bottom sheet visibility
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const closeDialog = () => router.setParams({ showHelpDialog: "false" });
  const snapPoints = useMemo(() => ["25%", "90%"], []);

  // callbacks for bottom sheet
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Function to handle AddCard press
  const handleAddCardPress = () => {
    setIsBottomSheetVisible(true); // Show bottom sheet
  };

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert("Medicamentos prescritos pelo médico.");
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <View style={FormStyles.content}>
        <Text variant="headlineSmall" style={FormStyles.title}>
          Está tomando algum medicamento?
        </Text>
        <Text style={FormStyles.subtitle}>
          Liste todos os medicamentos que você está tomando atualmente, mesmo
          que não estejam relacionados à epilepsia.
        </Text>
        <AddCard text="Adicionar Medicamento" onPress={handleAddCardPress} />
      </View>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => console.log("Next")}
      />

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          index={1}
          snapPoints={snapPoints}
          onClose={() => setIsBottomSheetVisible(false)} // Close bottom sheet on swipe down
        >
          <BottomSheetView style={styles.bottomSheetContentContainer}>
            <BottomSheetAddMedicineScreen />
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheetContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
