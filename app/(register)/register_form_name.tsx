import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput, TouchableOpacity } from "react-native";

export default function RegisterFormName() {
  return (
    <ThemedView>
      <ThemedText type="title">Title</ThemedText>
      <ThemedText type="subtitle">Subtitle</ThemedText>
      <TextInput style={styles.input} placeholder="Full Name" />
      {/* <TouchableOpacity style={styles.fab}>
       <Text style={styles.fabText}>→</Text>
      </TouchableOpacity> */}
    </ThemedView>
  );
}

const styles = {
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  fab: {
    backgroundColor: "blue",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
};
