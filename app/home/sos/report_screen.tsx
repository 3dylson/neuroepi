import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { IconButton } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { sharePDF } from "@/app/utils/PdfUtils";
import * as IntentLauncher from "expo-intent-launcher";
import PdfViewer from "@/components/PdfViewer";
import { isIOS } from "@/app/utils/Utils";

const ReportScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const pdfPath = params.pdfPath as string;

  useEffect(() => {
    const loadPdfBase64 = async () => {
      try {
        if (pdfPath) {
          setHtmlContent(pdfPath);

          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading PDF as base64:", error);
        setError(true);
        setLoading(false);
      }
    };

    loadPdfBase64();

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
    }
  }, [navigation, pdfPath]);

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
      {!error && htmlContent && (
        <PdfViewer
          source={{ uri: htmlContent }}
          noLoader={true}
          onLoad={() => {
            console.log("PDF Loaded successfully");
          }}
          onError={() => {
            console.log("Error loading PDF");
            setError(true);
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
