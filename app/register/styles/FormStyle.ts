import { StyleSheet } from "react-native";

export const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    color: "#6B6B6B",
  },
  input: {
    marginBottom: 20,
  },
  fab: {
    margin: 20,
    marginBottom: 40,
    alignSelf: "flex-end",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
