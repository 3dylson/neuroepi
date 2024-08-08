import {
  Text,
  StyleSheet,
  Pressable,
  type ViewProps,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

type ButtonStyle = "filled" | "outlined" | "text";
type ButtonState = "enabled" | "disabled";

export type ThemedButtonProps = ViewProps & {
  title: string;
  onPress: () => void;
  icon?: ImageSourcePropType;
  lightColor?: string;
  darkColor?: string;
  styleType?: ButtonStyle;
  state?: ButtonState;
};

export function ThemedButton({
  title,
  onPress,
  icon,
  lightColor,
  darkColor,
  styleType = "filled",
  state = "enabled",
  ...props
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primary"
  );
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "onPrimary"
  );

  const buttonStyle = [
    styles.button,
    styleType === "outlined" && {
      borderWidth: 1,
      borderColor: backgroundColor,
      backgroundColor: "transparent",
    },
    styleType === "text" && { backgroundColor: "transparent" },
    {
      backgroundColor: styleType === "filled" ? backgroundColor : "transparent",
      width: 250,
    },
    props.style,
  ];

  const textStyle = [
    styles.text,
    { color: textColor },
    state === "disabled" && { color: "gray" },
  ];

  return (
    <Pressable
      style={({ pressed }) => [buttonStyle, { opacity: pressed ? 0.8 : 1.0 }]}
      onPress={state === "enabled" ? onPress : undefined}
      disabled={state === "disabled"}
      {...props}
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={textStyle}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    elevation: 3,
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  icon: {
    marginRight: 8,
  },
});
