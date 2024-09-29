import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHTML from "react-native-render-html";
import { Divider } from "react-native-paper";
import { YouTubeVideoInterface } from "./YouTubeVideoInterface";

const BlogDetailScreen: React.FC = () => {
  const { width: contentWidth } = useWindowDimensions();
  const { topic } = useLocalSearchParams();

  // Parse the topic parameter
  const blogTopic = JSON.parse(topic as string);

  const renderContent = (htmlContent: string) => {
    return (
      <RenderHTML source={{ html: htmlContent }} contentWidth={contentWidth} />
    );
  };

  const renderYouTubeItem = ({ item }: { item: YouTubeVideoInterface }) => (
    <TouchableOpacity
      style={styles.youtubeItem}
      onPress={() => Linking.openURL(item.url)}
    >
      {item.thumbnail && (
        <Image
          source={
            typeof item.thumbnail === "string"
              ? { uri: item.thumbnail }
              : item.thumbnail
          }
          style={styles.youtubeThumbnail}
        />
      )}
      <Text style={styles.youtubeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Blog Image */}
      <Image
        source={
          typeof blogTopic.thumbnail === "string"
            ? { uri: blogTopic.thumbnail }
            : blogTopic.thumbnail
        }
        style={styles.image}
        onError={() => console.log("Error loading image")}
      />

      {/* Blog Title */}
      <Text style={styles.title}>{blogTopic.title}</Text>

      <Divider style={styles.divider} />

      {/* Blog Content */}
      <View style={styles.contentContainer}>
        {renderContent(blogTopic.description)}
      </View>

      <Divider style={styles.divider} />

      {/* YouTube Videos Section */}
      <View style={styles.youtubeSection}>
        <Text style={styles.sectionTitle}>Links relacionados</Text>
        <FlatList
          data={blogTopic.videos}
          renderItem={renderYouTubeItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.youtubeList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: "#ddd",
  },
  contentContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  youtubeSection: {
    marginBottom: 54,
  },
  youtubeList: {
    paddingVertical: 10,
  },
  youtubeItem: {
    marginRight: 15,
    width: 180,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  youtubeThumbnail: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  youtubeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 10,
    color: "#333",
  },
});

export default BlogDetailScreen;
