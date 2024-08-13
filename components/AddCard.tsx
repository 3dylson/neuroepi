import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Card, IconButton, useTheme, Text } from "react-native-paper";

// Define the props interface
interface AddCardProps {
  onPress: () => void;
  text?: string;
  icon?: string;
  backgroundColor?: string;
  cardStyle?: ViewStyle;
}

const AddCard: React.FC<AddCardProps> = ({
  onPress,
  text = "Adicionar",
  icon = "plus",
  backgroundColor,
  cardStyle,
}) => {
  const { colors } = useTheme(); // This allows the component to adapt to the current theme colors

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card
        style={[
          styles.card,
          { backgroundColor: backgroundColor || colors.secondaryContainer },
          cardStyle,
        ]}
      >
        <View style={styles.content}>
          <IconButton icon={icon} size={24} />
          <Text style={[styles.text, { color: colors.onSurface }]}>{text}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  card: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc", // Adjust the color as needed
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
  },
});

export default AddCard;
