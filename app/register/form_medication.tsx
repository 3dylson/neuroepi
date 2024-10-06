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
import { User } from "../model/User";

interface FormMedicationProps {
  isFabVisible?: boolean;
}

export default function FormMedication({
  isFabVisible = true,
}: FormMedicationProps) {
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const closeDialog = () => router.setParams({ showHelpDialog: "false" });
  const snapPoints = useMemo(() => ["95%"], []);

  // Function to handle AddCard press
  const handleAddCardPress = () => {
    setIsBottomSheetVisible(true); // Show bottom sheet
  };

  const handleOnSavePress = useCallback(
    async (newMedicine: Medicine) => {
      setMedicineList((prevList) => [...prevList, newMedicine]);
      const user = await User.getFromLocal(); // Retrieve user data
      if (user) {
        await user.updateUserData({
          medicines: [...medicineList, newMedicine],
        }); // Update user data with new medicine
      }
      handleClosePress();
    },
    [medicineList]
  );

  useEffect(() => {
    if (medicineList.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [medicineList]);

  // Retrieve saved medicines when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal(); // Fetch saved user
      if (savedUser?.medicines) {
        setMedicineList(savedUser.medicines); // Populate the medicines list
      }
    };
    loadUserData();
  }, []);

  // Handle medicine delete and update user data
  const handleMedicineDelete = useCallback(
    async (id: string) => {
      const updatedList = medicineList.filter((medicine) => medicine.id !== id);
      setMedicineList(updatedList);
      const user = await User.getFromLocal(); // Retrieve user data
      if (user) {
        await user.updateUserData({ medicines: updatedList }); // Update user data after deletion
      }
    },
    [medicineList]
  );

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
        <AddCard
          cardStyle={{ marginBottom: 54 }}
          text="Adicionar Medicamento"
          onPress={handleAddCardPress}
        />
      </ScrollView>
      {isFabVisible && (
        <FAB
          icon="arrow-right"
          style={FormStyles.fab}
          onPress={() => router.push("/register/form_surgery_neurostimulator")}
        />
      )}

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
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
