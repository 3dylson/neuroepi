import { Platform } from "react-native";

export const isAndroid = (): boolean => {
  return Platform.OS === "android";
};

export const isIOS = (): boolean => {
  return Platform.OS === "ios";
};

/**
 * generates a ID intended for local, non-global use cases.
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
