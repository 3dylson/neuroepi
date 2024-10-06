import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  IconButton,
} from "react-native-paper";

interface MedicineCardProps {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  icon?: any; // Replace with actual type for the icon (e.g., ImageSourcePropType)
  onDelete: (id: string) => void; // Callback for delete action
  onClickCallback?: (id: string) => void; // Optional click callback for the card
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  id,
  name,
  dosage,
  times,
  icon,
  onDelete,
  onClickCallback, // Optional callback for card click
}) => {
  const { colors } = useTheme(); // Access current theme colors

  // Function to handle card click
  const handleCardClick = () => {
    if (onClickCallback) {
      onClickCallback(id); // Call the callback with the medicine ID
    }
  };

  return (
    <TouchableOpacity onPress={handleCardClick} activeOpacity={0.8}>
      <Card style={[styles.card, { backgroundColor: colors.primaryContainer }]}>
        {/* Card Content with Name, Dosage, and Icon */}
        <Card.Content style={styles.row}>
          <View style={styles.leftContainer}>
            {/* Icon on the left */}
            {icon && <Image source={icon} style={styles.icon} />}
            <View style={styles.textContainer}>
              {/* Medicine Name and Dosage */}
              <Title
                style={[styles.nameText, { color: colors.onPrimaryContainer }]}
              >
                {name}
              </Title>
              <Paragraph
                style={[
                  styles.dosageText,
                  { color: colors.onPrimaryContainer },
                ]}
              >
                {dosage}
              </Paragraph>
            </View>
          </View>

          {/* Delete button aligned to the right */}
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(id)}
            style={styles.deleteButton}
            iconColor={colors.error}
          />
        </Card.Content>

        {/* Times */}
        <Card.Content>
          <Text style={[styles.timeText, { color: colors.onPrimaryContainer }]}>
            Horários: {times.join(", ")}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 10,
    padding: 12,
    elevation: 4, // Adds slight shadow for better UX
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between", // Spreads the content to the sides
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Ensures text container takes available space
  },
  icon: {
    width: 40, // Slightly larger for better visibility
    height: 40,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: "column",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dosageText: {
    fontSize: 14,
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    marginTop: 8,
  },
  deleteButton: {
    marginLeft: 10,
  },
});

export default MedicineCard;
