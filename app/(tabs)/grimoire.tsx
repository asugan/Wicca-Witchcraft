import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

type Category = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const categories: Category[] = [
  {
    id: "love",
    title: "Love Spells",
    subtitle: "Attract romance, self-love, and strengthen bonds.",
    image:
      "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?q=80&w=1200&auto=format&fit=crop",
    icon: "heart",
  },
  {
    id: "protection",
    title: "Protection",
    subtitle: "Wards, shielding, and defensive magic.",
    image:
      "https://images.unsplash.com/photo-1565514020179-026b92b2d5f5?q=80&w=1200&auto=format&fit=crop",
    icon: "shield",
  },
  {
    id: "abundance",
    title: "Abundance",
    subtitle: "Wealth, prosperity, and career success.",
    image:
      "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=1200&auto=format&fit=crop",
    icon: "cash",
  },
  {
    id: "healing",
    title: "Healing",
    subtitle: "Physical, emotional, and spiritual balance.",
    image:
      "https://images.unsplash.com/photo-1593487568720-92097fb460fb?q=80&w=1200&auto=format&fit=crop",
    icon: "leaf",
  },
  {
    id: "divination",
    title: "Divination",
    subtitle: "Tarot, scrying, and hidden knowledge.",
    image:
      "https://images.unsplash.com/photo-1556702571-3e11dd2b1a92?q=80&w=1200&auto=format&fit=crop",
    icon: "eye",
  },
  {
    id: "rituals",
    title: "Rituals",
    subtitle: "Moon cycles and seasonal ceremonies.",
    image:
      "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1200&auto=format&fit=crop",
    icon: "moon-waning-gibbous",
  },
];

export default function GrimoireScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View pointerEvents="none" style={styles.texture} />

      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <MaterialCommunityIcons color={mysticTheme.colors.primary} name="book-open-page-variant" size={30} />
          <Text style={styles.headerTitle}>Book of Shadows</Text>
        </View>
        <Pressable style={styles.profileIcon}>
          <MaterialCommunityIcons color={mysticTheme.colors.textMuted} name="account-circle-outline" size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons
            color="rgba(242,193,78,0.7)"
            name="magnify"
            size={20}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search spells, crystals, herbs..."
            placeholderTextColor="rgba(184,177,157,0.7)"
            style={styles.searchInput}
          />
        </View>

        <View>
          <Text style={styles.overline}>Current Phase</Text>
          <ImageBackground
            imageStyle={styles.featuredImage}
            source={{
              uri: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1887&auto=format&fit=crop",
            }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredOverlay} />
            <Text style={styles.featuredTag}>Waxing Gibbous</Text>
            <Text style={styles.featuredTitle}>Moon Rituals</Text>
            <Text style={styles.featuredDescription}>
              Harness the growing energy for manifestation and attraction.
            </Text>
          </ImageBackground>
        </View>

        <View>
          <Text style={styles.overline}>Grimoire Chapters</Text>
          <View style={styles.grid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => router.push("/ritual/full-moon-release")}
                style={styles.card}
              >
                <ImageBackground imageStyle={styles.cardImage} source={{ uri: category.image }} style={styles.cardMedia}>
                  <View style={styles.cardOverlay} />
                  <View style={styles.cardIconWrap}>
                    <MaterialCommunityIcons color={mysticTheme.colors.primary} name={category.icon} size={24} />
                  </View>
                </ImageBackground>
                <Text style={styles.cardTitle}>{category.title}</Text>
                <Text numberOfLines={2} style={styles.cardSubtitle}>
                  {category.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mysticTheme.colors.background,
  },
  texture: {
    position: "absolute",
    top: -80,
    left: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(242,193,78,0.06)",
  },
  header: {
    borderBottomWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(24,22,17,0.9)",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 30,
    color: mysticTheme.colors.textMain,
    fontFamily: typefaces.display,
    fontWeight: "700",
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 20,
  },
  searchWrap: {
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    backgroundColor: mysticTheme.colors.surface,
    borderRadius: 12,
    paddingLeft: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: mysticTheme.colors.textMain,
    paddingVertical: 12,
    fontSize: 14,
  },
  overline: {
    color: "rgba(242,193,78,0.85)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 10,
    fontWeight: "700",
  },
  featuredCard: {
    height: 132,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  featuredImage: {
    resizeMode: "cover",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24,22,17,0.65)",
  },
  featuredTag: {
    color: mysticTheme.colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  featuredTitle: {
    marginTop: 2,
    color: "white",
    fontSize: 24,
    fontFamily: typefaces.display,
    fontWeight: "700",
  },
  featuredDescription: {
    marginTop: 3,
    color: "#D8D2C4",
    maxWidth: 220,
    lineHeight: 19,
    fontSize: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    backgroundColor: mysticTheme.colors.surface,
    padding: 10,
  },
  cardMedia: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardImage: {
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24,22,17,0.58)",
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: mysticTheme.colors.textMain,
    fontSize: 19,
    fontWeight: "700",
    fontFamily: typefaces.display,
  },
  cardSubtitle: {
    marginTop: 2,
    color: mysticTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
