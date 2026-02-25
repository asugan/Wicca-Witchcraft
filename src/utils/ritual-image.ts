import { ImageSourcePropType } from "react-native";

const CATEGORY_DEFAULT_IMAGES: Record<string, ImageSourcePropType> = {
  cleansing: require("../../assets/images/ritual_cleansing.jpg"),
  protection: require("../../assets/images/ritual_protection.jpg"),
};

const FALLBACK_IMAGE: ImageSourcePropType = require("../../assets/images/ritual_cleansing.jpg");

/**
 * Returns the ritual's cover image source, or a category-based default if empty.
 */
export function getCoverImage(coverImage: string, category: string): ImageSourcePropType {
  if (coverImage) return { uri: coverImage };
  return CATEGORY_DEFAULT_IMAGES[category] ?? FALLBACK_IMAGE;
}
