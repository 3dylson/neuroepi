import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { FAB, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { FormStyles } from "./styles/FormStyle";
import { View, StyleSheet, ScrollView } from "react-native";
import { RegisterInfoAlert } from "./utils/RegisterInfoAlert";
import AddCard from "@/components/AddCard";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import BottomSheetAddMedicineScreen from "./bottom_sheet_add_medicine";
import MedicineCard from "@/components/MedicineCard";
import { Medicine } from "../model/Medicine";

export default function FormMedication() {
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);
  const params = useLocalSearchParams();
  // ref for bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  // ref for scroll view
  const scrollViewRef = useRef<ScrollView>(null);
  // state to control bottom sheet visibility
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const closeDialog = () => router.setParams({ showHelpDialog: "false" });
  const snapPoints = useMemo(() => ["95%"], []);

  // callbacks for bottom sheet
  const handleSheetChanges = useCallback((index: number) => {
    //console.log("handleSheetChanges", index);
  }, []);

  // Function to handle AddCard press
  const handleAddCardPress = () => {
    setIsBottomSheetVisible(true); // Show bottom sheet
  };

  const handleOnSavePress = useCallback((newMedicine: Medicine) => {
    setMedicineList((prevList) => [...prevList, newMedicine]);
    handleClosePress();
  }, []);

  useEffect(() => {
    if (medicineList.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [medicineList]);

  const handleMedicineDelete = useCallback((id: string) => {
    setMedicineList((prevList) =>
      prevList.filter((medicine) => medicine.id !== id)
    );
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  useEffect(() => {
    if (params.showHelpDialog === "true") {
      RegisterInfoAlert("Medicamentos prescritos pelo médico.");
      closeDialog();
    }
  }, [params.showHelpDialog]);

  return (
    <View style={FormStyles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          FormStyles.content,
          { flex: medicineList.length ? 0 : 1 },
        ]}
      >
        <Text
          variant="headlineSmall"
          style={[
            FormStyles.title,
            { marginTop: medicineList.length ? 54 : 0 },
          ]}
        >
          Está tomando algum medicamento?
        </Text>
        <Text style={FormStyles.subtitle}>
          Liste todos os medicamentos que você está tomando atualmente, mesmo
          que não estejam relacionados à epilepsia.
        </Text>
        {medicineList.map((medicine, index) => (
          <MedicineCard
            key={index}
            id={medicine.id}
            name={medicine.name}
            dosage={medicine.dose + " " + medicine.doseUnit.toString()}
            times={medicine.times}
            icon={require("@/assets/images/pills.png")}
            onDelete={handleMedicineDelete}
          />
        ))}
        <AddCard text="Adicionar Medicamento" onPress={handleAddCardPress} />
      </ScrollView>
      <FAB
        icon="arrow-right"
        style={FormStyles.fab}
        onPress={() => console.log("Next")}
      />

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          index={0}
          snapPoints={snapPoints}
          onClose={() => setIsBottomSheetVisible(false)} // Close bottom sheet on swipe down
        >
          <BottomSheetScrollView style={styles.bottomSheetContentContainer}>
            <BottomSheetAddMedicineScreen
              onClose={handleClosePress}
              onSave={handleOnSavePress}
            />
          </BottomSheetScrollView>
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
