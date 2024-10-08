import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, Card, Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Crise } from "@/app/model/Crise";

const CrisisListScreen: React.FC = () => {
  const [crises, setCrises] = useState<Crise[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch crises when the screen loads
    const fetchCrises = async () => {
      const retrievedCrises = await Crise.getCrises();
      if (retrievedCrises) {
        setCrises(retrievedCrises);
      }
    };

    fetchCrises();
  }, []);

  const renderCrisisItem = ({ item }: { item: Crise }) => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.date}>
            {item.dateTime
              ? format(new Date(item.dateTime), "PPPP p", {
                  locale: ptBR, // Using the Portuguese locale
                })
              : "N/A"}
          </Text>
          <Text style={styles.type}>
            Tipo de Crise: {item.type || "Desconhecido"}
          </Text>
          <Text style={styles.details}>Duração: {item.duration || "N/A"}</Text>
          <Text style={styles.details}>
            Intensidade: {item.intensity || "N/A"}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() =>
              //navigation.navigate("CrisisDetailScreen", { id: item.id })
              console.log("View Details")
            }
          >
            Ver Detalhes
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={crises}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderCrisisItem}
        contentContainerStyle={{ paddingBottom: 100 }} // Added padding to ensure FAB doesn't overlap
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>Nenhuma crise registrada</Text>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Registrar Crise"
        onPress={() => console.log("Add Crisis")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
  },
  type: {
    fontSize: 14,
    marginVertical: 4,
  },
  details: {
    fontSize: 12,
    color: "#666",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  fab: {
    position: "absolute",
    right: 26,
    bottom: 36,
  },
});

export default CrisisListScreen;
