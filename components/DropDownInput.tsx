import { isIOS } from "@/app/utils/Utils";
import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
} from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";

interface DropDownInputProps {
  label?: string;
  text: string;
  textInputProps?: TextInputProps;
  renderPopoverContent?: (
    selectItem: (item: string) => void
  ) => React.ReactNode;
  onItemSelect?: (item: string) => void;
  popoverPlacement?: Placement;
  containerStyle?: ViewStyle;
  customAction?: () => void;
}

const DropDownInput: React.FC<DropDownInputProps> = ({
  label = "Select an option",
  text = "",
  textInputProps = {},
  renderPopoverContent,
  onItemSelect,
  popoverPlacement = Placement.AUTO,
  containerStyle,
  customAction = () => {},
}) => {
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState<string>(text);

  const anchorRef = useRef<TouchableOpacity>(null);
  const isIOSPlatform = isIOS();

  // Memoized functions to prevent unnecessary re-renders
  const openMenu = useCallback(() => {
    if (renderPopoverContent) {
      setVisible(true);
    } else {
      customAction();
    }
  }, [renderPopoverContent, customAction]);

  const closeMenu = useCallback(() => setVisible(false), []);

  const handleItemSelect = useCallback(
    (item: string) => {
      setInputText(item);
      closeMenu();
      if (onItemSelect) {
        onItemSelect(item);
      }
    },
    [onItemSelect, closeMenu]
  );

  // Memoize popover content to optimize rendering
  const popoverContent = useMemo(
    () => renderPopoverContent && renderPopoverContent(handleItemSelect),
    [renderPopoverContent, handleItemSelect]
  );

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
          {...(isIOSPlatform && {
            onPress: openMenu,
          })}
          onPress={openMenu}
          onChangeText={setInputText}
          right={<TextInput.Icon icon="menu-down" onPress={openMenu} />}
          {...textInputProps}
        />
      </TouchableOpacity>

      {popoverContent && (
        <Popover
          isVisible={visible}
          from={anchorRef}
          onRequestClose={closeMenu}
          placement={popoverPlacement}
        >
          <ScrollView style={styles.popoverContent}>
            {popoverContent}
          </ScrollView>
        </Popover>
      )}
    </View>
  );
};

// Styles
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
});

export default DropDownInput;
