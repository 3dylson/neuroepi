import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";

// Define props types for the component
interface ModalInputSelectorProps {
  label?: string; // Label for TextInput
  text: string; // Text value for the input
  textInputProps?: TextInputProps; // Props for customizing the TextInput
  renderModalContent?: (selectItem: (item: string) => void) => React.ReactNode; // Function to render custom modal content
  onItemSelect?: (item: string) => void; // Callback when an item is selected
  containerStyle?: ViewStyle; // Optional style for the container
  customAction?: () => void; // Custom action to be executed
}

const ModalInputSelector: React.FC<ModalInputSelectorProps> = ({
  label = "Select an option",
  text = "",
  textInputProps = {},
  renderModalContent = null,
  onItemSelect,
  containerStyle,
  customAction = () => {},
}) => {
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState<string>(text);

  const openMenu = () => {
    if (renderModalContent) {
      setVisible(true);
    } else {
      customAction();
    }
  };
  const closeMenu = () => setVisible(false);

  // Internal function to handle item selection
  const handleItemSelect = (item: string) => {
    setInputText(item);
    closeMenu();
    if (onItemSelect) {
      onItemSelect(item); // Trigger callback if provided
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity style={styles.anchorContainer} onPress={openMenu}>
        <TextInput
          label={label}
          value={inputText}
          onPress={openMenu}
          onChangeText={setInputText}
          right={<TextInput.Icon icon="menu-down" onPress={openMenu} />}
          {...textInputProps} // Pass custom TextInput props
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType={Platform.OS === "ios" ? "slide" : "fade"} // iOS has slide animation, Android uses fade
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <SafeAreaView style={styles.safeArea}>
                  <ScrollView style={styles.modalContent}>
                    {renderModalContent && renderModalContent(handleItemSelect)}
                  </ScrollView>
                </SafeAreaView>
                <TouchableOpacity
                  onPress={closeMenu}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
  },
  anchorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent black for backdrop
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Shadow for Android
  },
  modalContent: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  closeText: {
    color: "blue",
    fontSize: 16,
  },
});

export default ModalInputSelector;
