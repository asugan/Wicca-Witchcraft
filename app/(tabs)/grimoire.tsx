import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, Text } from "react-native-paper";

import { RitualCard } from "@/components/mystic/RitualCard";
import { listRituals } from "@/db/repositories/ritual-repository";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  love: "heart",
  protection: "shield",
  abundance: "cash",
  healing: "leaf",
  moon: "moon-waning-gibbous",
  ritual: "book-open-page-variant",
  beginner: "star-four-points",
};

export default function GrimoireScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const styles = makeStyles(theme);
  const [query, setQuery] = useState("");

  const rituals = useMemo(() => listRituals(20), []);

  const filteredRituals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rituals;
    }

    return rituals.filter((ritual) => {
      return (
        ritual.title.toLowerCase().includes(normalizedQuery) ||
        ritual.summary.toLowerCase().includes(normalizedQuery) ||
        ritual.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, rituals]);

  const featuredRitual = filteredRituals[0] ?? rituals[0];

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
          <Text style={styles.overline}>Current Focus</Text>
          {featuredRitual ? (
            <ImageBackground imageStyle={styles.featuredImage} source={{ uri: featuredRitual.coverImage }} style={styles.featuredCard}>
              <View style={styles.featuredOverlay} />
              <Text style={styles.featuredTag}>{featuredRitual.moonPhase.replaceAll("-", " ")}</Text>
              <Text style={styles.featuredTitle}>{featuredRitual.title}</Text>
              <Text style={styles.featuredDescription}>{featuredRitual.summary}</Text>
            </ImageBackground>
          ) : null}
        </View>

        <View>
          <Text style={styles.overline}>Grimoire Chapters</Text>
          <View style={styles.grid}>
            {filteredRituals.map((ritual) => (
              <RitualCard
                icon={categoryIcons[ritual.category] ?? "book-open-page-variant"}
                image={ritual.coverImage}
                key={ritual.id}
                onPress={() => {
                  trackEvent("ritual_opened", {
                    user_id: "local-user",
                    tab_name: "grimoire",
                    entity_id: ritual.id,
                    source: "ritual_grid",
                  });

                  router.push(`/ritual/${ritual.slug}` as never);
                }}
                subtitle={ritual.summary}
                title={ritual.title}
              />
            ))}
            {!filteredRituals.length ? <Text style={styles.emptyLabel}>No rituals match this search.</Text> : null}
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
    emptyLabel: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 14,
      marginTop: 10,
    },
  });
