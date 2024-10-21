import { isIOS } from "@/app/utils/Utils";
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  ScrollView,
} from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";

// Define props types for the component
interface DropDownInputProps {
  label?: string; // Label for TextInput
  text: string; // Text value for the input
  textInputProps?: TextInputProps; // Props for customizing the TextInput
  renderPopoverContent?: (
    selectItem: (item: string) => void
  ) => React.ReactNode; // Function to render custom popover content
  onItemSelect?: (item: string) => void; // Callback when an item is selected
  popoverPlacement?: Placement; // Popover placement
  containerStyle?: ViewStyle; // Optional style for the container
  customAction?: () => void; // Custom action to be executed
}

const DropDownInput: React.FC<DropDownInputProps> = ({
  label = "Select an option",
  text = "",
  textInputProps = {},
  renderPopoverContent = null,
  onItemSelect,
  popoverPlacement = Placement.AUTO,
  containerStyle,
  customAction = () => {},
}) => {
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState<string>(text);

  const anchorRef = useRef<TouchableOpacity>(null); // Ref for positioning popover

  const openMenu = () => {
    if (renderPopoverContent) {
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
      <TouchableOpacity
        ref={anchorRef}
        style={styles.anchorContainer}
        onPress={openMenu}
      >
        <TextInput
          label={label}
          value={text}
          {...(isIOS() && {
            onPress: openMenu,
          })}
          onPress={openMenu}
          onChangeText={setInputText}
          right={<TextInput.Icon icon="menu-down" onPress={openMenu} />}
          {...textInputProps} // Pass custom TextInput props
        />
      </TouchableOpacity>

      {renderPopoverContent && (
        <Popover
          isVisible={visible}
          from={anchorRef}
          onRequestClose={closeMenu}
          placement={popoverPlacement} // Allow dynamic placement
        >
          <ScrollView style={styles.popoverContent}>
            {renderPopoverContent(handleItemSelect)}
          </ScrollView>
        </Popover>
      )}
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
  popoverContent: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  menu: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  menuItem: {
    padding: 12,
  },
});

export default DropDownInput;
