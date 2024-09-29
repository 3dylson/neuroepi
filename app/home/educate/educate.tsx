import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { BlogTopic } from "./BlogTopic";
import { router } from "expo-router";
import { blogTopics } from "./Data";

const EducateScreen: React.FC = () => {
  const { colors } = useTheme();

  // Function to handle navigating to a detailed screen
  const handlePress = (topic: BlogTopic) => {
    // Navigate to a detailed screen, passing the selected blog topic
    router.push({
      pathname: "/home/educate/details",
      params: { topic: JSON.stringify(topic) },
    });
  };

  // Render each blog topic item
  const renderBlogItem = ({ item }: { item: BlogTopic }) => (
    <TouchableOpacity style={styles.blogItem} onPress={() => handlePress(item)}>
      <Image
        source={
          typeof item.thumbnail === "string"
            ? { uri: item.thumbnail }
            : item.thumbnail
        }
        style={styles.thumbnail}
      />
      <View style={styles.blogContent}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {item.title}
        </Text>
        <Text>
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tópicos Educacionais</Text>
      <FlatList
        data={blogTopics}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Background color for the screen
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  contentContainer: {
    paddingBottom: 40, // Padding at the bottom for scroll
  },
  blogItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Shadow for Android
    padding: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  blogContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default EducateScreen;
