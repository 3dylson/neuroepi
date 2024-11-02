import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
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
  const params = useLocalSearchParams(); // Get the params from router
  const navigation = useNavigation();

  const pdfPath = params.pdfPath as string;

  useEffect(() => {
    if (pdfPath) {
      navigation.setOptions({
        headerRight: () => (
          <IconButton icon="share" onPress={() => sharePDF(pdfPath)} />
        ),
      });
    }
  }, [navigation, pdfPath]);

  const source = { uri: pdfPath, cache: true };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && (
        <View style={styles.error}>
          <Text>Erro ao carregar PDF</Text>
        </View>
      )}
      {!error && pdfPath && (
        <PdfViewer
          source={source}
          onLoad={() => setLoading(false)}
          onError={() => {
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
