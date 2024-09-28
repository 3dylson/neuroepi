import React from "react";
import { Platform } from "react-native";
import DateTimePicker, {
  AndroidNativeProps,
  DateTimePickerAndroid,
  DateTimePickerEvent,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";

type CommonProps = Omit<
  AndroidNativeProps & IOSNativeProps,
  "onChange" | "display"
>;

interface CustomDateTimePickerProps extends CommonProps {
  onChange?: (event: DateTimePickerEvent, date?: Date) => void;
  onDismiss?: () => void;
  display?: "default" | "spinner" | "clock" | "calendar";
}

const CustomDateTimePicker = React.forwardRef<any, CustomDateTimePickerProps>(
  (props, _) => {
    const { onChange, onDismiss, display, ...restProps } = props;

    // Set default display based on the platform if not provided
    const platformDisplay: CustomDateTimePickerProps["display"] =
      display || (Platform.OS === "ios" ? "spinner" : "default");

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      console.log("Selected date: ", selectedDate);

      if (onChange && event.type !== "dismissed") {
        onChange(event, selectedDate);
      } else if (onDismiss && event.type === "dismissed") {
        onDismiss();
      }
    };

    // Android-specific methods to show the picker
    const showAndroidMode = (currentMode: "date" | "time") => {
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          ...restProps,
          value: restProps.value ?? new Date(),
          onChange: handleChange,
          mode: currentMode,
          is24Hour: restProps.is24Hour ?? true,
        });
      }
    };

    if (Platform.OS === "ios") {
      return (
        <DateTimePicker
          {...restProps}
          onChange={handleChange}
          display={platformDisplay}
        />
      );
    } else {
      showAndroidMode(props.mode as "date" | "time");
    }
  }
);

export default CustomDateTimePicker;
