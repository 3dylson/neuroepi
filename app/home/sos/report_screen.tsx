import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { IconButton } from "react-native-paper";
import { sharePDF } from "@/app/utils/PdfUtils";
import { useState, useEffect } from "react";
import PdfViewer from "@/components/PdfViewer";

const ReportScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const pdfPath = params.pdfPath as string;

  useEffect(() => {
    console.log("PDF Path:", pdfPath); // Debugging statement

    if (pdfPath) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => sharePDF(pdfPath)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
            activeOpacity={0.6}
            accessibilityLabel="Share PDF"
            accessibilityRole="button"
          >
            <IconButton icon="share" />
            <Text style={{ marginLeft: 8 }}>Partilhar</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      setError(true); // Set error if pdfPath is missing or invalid
      setLoading(false); // Stop loading if pdfPath is invalid
    }
  }, [navigation, pdfPath]);

  const source = { uri: pdfPath };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {error && (
        <View style={styles.error}>
          <Text>Erro ao carregar PDF</Text>
        </View>
      )}
      {!error && pdfPath && (
        <PdfViewer
          source={source}
          noLoader={true}
          onLoad={() => {
            console.log("PDF Loaded successfully"); // Debugging statement
            setLoading(false);
          }}
          onError={() => {
            console.log("Error loading PDF"); // Debugging statement
            setError(true);
            setLoading(false);
          }}
          style={styles.pdf}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: Dimensions.get("window").height,
  },
  error: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default ReportScreen;
