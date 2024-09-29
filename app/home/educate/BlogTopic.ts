import { YouTubeVideoInterface } from "./YouTubeVideoInterface";

export interface BlogTopic {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // Can be a URL or local image asset
  videos?: YouTubeVideoInterface[];
}
