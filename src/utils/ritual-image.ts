import { ImageSourcePropType } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CATEGORY_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  love: "heart",
  protection: "shield",
  abundance: "cash",
  healing: "leaf",
  moon: "moon-waning-gibbous",
  ritual: "book-open-page-variant",
  beginner: "star-four-points",
};

const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  protection: require('../../assets/images/protection_bg.jpg'),
  cleansing: require('../../assets/images/cleansing_bg.jpg'),
  healing: require('../../assets/images/healing_bg.jpg'),
  love: require('../../assets/images/love_bg.jpg'),
  moon: require('../../assets/images/moon_bg.jpg'),
  beginner: require('../../assets/images/beginner_bg.jpg'),
  abundance: require('../../assets/images/abundance_bg.jpg'),
};

const FALLBACK_IMAGE: ImageSourcePropType = require('../../assets/images/moon_bg.jpg');

export function getCategoryImage(category: string): ImageSourcePropType {
  return CATEGORY_IMAGES[category] ?? FALLBACK_IMAGE;
}
