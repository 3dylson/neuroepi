import { Button, ButtonProps } from "react-native-paper";
import { StyleSheet } from "react-native";
import { debounce } from "lodash";

export function CustomButton({ style, ...props }: ButtonProps) {
  const defaultStyles = [styles.button];

  const handlePress = debounce(() => {
    props.onPress;
  }, 500);

  return (
    <Button style={[defaultStyles, style]} onPress={handlePress} {...props} />
  );
}

const styles = StyleSheet.create({
  button: {
    width: 250,
    height: 50,
    justifyContent: "center",
    borderRadius: 25,
  },
});
