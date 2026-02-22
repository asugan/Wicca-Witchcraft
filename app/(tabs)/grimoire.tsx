import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, Text } from "react-native-paper";

import { RitualCard } from "@/components/mystic/RitualCard";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

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
  const theme = useMysticTheme();
  const styles = makeStyles(theme);
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View pointerEvents="none" style={styles.texture} />

      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <MaterialCommunityIcons color={theme.colors.primary} name="book-open-page-variant" size={30} />
          <Text style={styles.headerTitle}>Book of Shadows</Text>
        </View>
        <MaterialCommunityIcons color={theme.colors.onSurfaceMuted} name="account-circle-outline" size={26} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Searchbar
          onChangeText={setQuery}
          iconColor={`${theme.colors.primary}BF`}
          inputStyle={styles.searchInputStyle}
          placeholder="Search spells, crystals, herbs..."
          placeholderTextColor={`${theme.colors.onSurfaceMuted}B3`}
          style={styles.searchWrap}
          value={query}
        />

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
              <RitualCard
                icon={category.icon}
                image={category.image}
                key={category.id}
                onPress={() => router.push("/ritual/full-moon-release")}
                subtitle={category.subtitle}
                title={category.title}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    texture: {
      position: "absolute",
      top: -80,
      left: -40,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: `${theme.colors.primary}12`,
    },
    header: {
      borderBottomWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: `${theme.colors.background}F2`,
    },
    headerTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerTitle: {
      fontSize: 32,
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontWeight: "700",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 124,
      gap: 20,
    },
    searchWrap: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: theme.colors.surface1,
      borderRadius: 12,
      elevation: 0,
    },
    searchInputStyle: {
      color: theme.colors.onSurface,
      minHeight: 40,
      fontSize: 14,
    },
    overline: {
      color: `${theme.colors.primary}E0`,
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
      borderColor: `${theme.colors.primary}40`,
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
      color: theme.colors.primary,
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
  });
