/**
 * Default cover images per ritual category.
 * Replace these placeholder URLs with proper spiritual imagery.
 *
 * Suggested sources:
 *   Cleansing: https://unsplash.com/s/photos/sage-smudge
 *   Protection: https://unsplash.com/s/photos/crystal-protection
 */
const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  // https://unsplash.com/photos/a-group-of-metal-objects-pNZJUV7cNl8
  cleansing:
    "https://images.unsplash.com/photo-1651841607023-9bc357ea63a2?auto=format&fit=crop&w=800&q=80",
  // https://unsplash.com/photos/white-angel-figurine-with-various-decorative-objects-H1bBFDc9oLo
  protection:
    "https://images.unsplash.com/photo-1768569445957-684618b193d2?auto=format&fit=crop&w=800&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1651841607023-9bc357ea63a2?auto=format&fit=crop&w=800&q=80";

/**
 * Returns the ritual's cover image URL, or a category-based default if empty.
 */
export function getCoverImage(coverImage: string, category: string): string {
  if (coverImage) return coverImage;
  return CATEGORY_DEFAULT_IMAGES[category] ?? FALLBACK_IMAGE;
}
