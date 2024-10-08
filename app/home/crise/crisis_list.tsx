import React, { useEffect, useState } from "react";
import { View, SectionList, StyleSheet, Text } from "react-native";
import { FAB, Card, Paragraph, Caption, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { format, compareDesc } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Crise } from "@/app/model/Crise";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

// Utility function to group and sort crises by date
const groupCrisesByDate = (crises: Crise[]) => {
  const grouped = crises.reduce((acc, crise) => {
    const dateKey = format(new Date(crise.dateTime!), "PPPP", { locale: ptBR });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(crise);
    return acc;
  }, {} as Record<string, Crise[]>);

  // Sort the dates in descending order
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const dateA = new Date(grouped[a][0].dateTime!);
    const dateB = new Date(grouped[b][0].dateTime!);
    return compareDesc(dateA, dateB);
  });

  // Sort crises within each date in descending order (if needed)
  sortedDates.forEach((date) => {
    grouped[date].sort((a, b) =>
      compareDesc(new Date(a.dateTime!), new Date(b.dateTime!))
    );
  });

  // Return the grouped and sorted data
  return sortedDates.map((date) => ({
    title: date,
    data: grouped[date],
  }));
};

const CrisisListScreen: React.FC = () => {
  const [sections, setSections] = useState<{ title: string; data: Crise[] }[]>(
    []
  );
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Crises",
    });
  }, [navigation]);

  useEffect(() => {
    // Fetch crises when the screen loads
    const fetchCrises = async () => {
      const retrievedCrises = await Crise.getCrises();
      if (retrievedCrises) {
        const groupedCrises = groupCrisesByDate(retrievedCrises);
        setSections(groupedCrises);
      }
    };

    fetchCrises();
  }, []);

  const renderCrisisItem = ({ item }: { item: Crise }) => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.type}>
            Tipo: {item.type || "Desconhecido"}
          </Paragraph>
          <View style={styles.detailsContainer}>
            <Caption style={styles.detailItem}>
              Duração: {item.duration || "N/A"}
            </Caption>
            <Caption style={styles.detailItem}>
              Intensidade: {item.intensity || "N/A"}
            </Caption>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            onPress={() => console.log("View Details")}
            mode="outlined"
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            Ver Detalhes
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderCrisisItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Paragraph style={styles.emptyMessage}>
            Nenhuma crise registrada
          </Paragraph>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Registrar Crise"
        onPress={() => router.push("/home/crise/crise_form")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa", // Subtle off-white background
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: Colors.light.onTertiaryFixedVariant,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    color: "#fff", // White text for contrast
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12, // Smooth rounded corners
    borderColor: "#ddd", // Subtle border color for the outline
    borderWidth: 1, // Defining the border width manually
    backgroundColor: "#fff", // Clean white card background
    elevation: 2, // Subtle shadow for card depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 120, // Prevent overlap with FAB
  },
  type: {
    fontSize: 16,
    color: "#555", // Subtle color contrast
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  detailItem: {
    fontSize: 14,
    color: "#777", // Lighter gray for less important details
  },
  cardActions: {
    marginTop: 16,
    justifyContent: "flex-end", // Align button to the right
  },
  button: {
    borderRadius: 20, // Rounded button for modern touch
  },
  buttonContent: {
    paddingHorizontal: 20, // Padding inside the button for better look
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 40, // More space for empty state
    fontSize: 18,
    color: "#888", // Light gray color for empty message
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    elevation: 6, // Higher elevation for floating effect
    borderRadius: 50, // Fully rounded FAB
  },
});

export default CrisisListScreen;
