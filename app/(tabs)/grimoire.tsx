import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
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

const difficultyOptions = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const moonPhaseOrder: Record<string, number> = {
  any: 0,
  new: 1,
  "waxing-crescent": 2,
  "first-quarter": 3,
  "waxing-gibbous": 4,
  full: 5,
  "waning-gibbous": 6,
  "waning-moon": 7,
  "waning-crescent": 8,
};

function formatPhaseLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRitualSearchScore(
  ritual: ReturnType<typeof listRituals>[number],
  tokens: string[]
) {
  let score = 0;
  const searchableTitle = ritual.title.toLowerCase();
  const searchableSummary = ritual.summary.toLowerCase();
  const searchableCategory = ritual.category.toLowerCase();
  const searchableDifficulty = ritual.difficulty.toLowerCase();
  const searchableMoonPhase = ritual.moonPhase.toLowerCase();
  const searchableMoonPhaseLabel = searchableMoonPhase.replaceAll("-", " ");
  const searchableMaterials = ritual.materials.map((material) => material.toLowerCase());

  for (const token of tokens) {
    let tokenScore = 0;

    if (searchableTitle.startsWith(token)) {
      tokenScore += 8;
    } else if (searchableTitle.includes(token)) {
      tokenScore += 5;
    }

    if (searchableSummary.includes(token)) {
      tokenScore += 3;
    }

    if (searchableCategory.includes(token)) {
      tokenScore += 2;
    }

    if (searchableDifficulty.includes(token)) {
      tokenScore += 2;
    }

    if (searchableMoonPhase.includes(token) || searchableMoonPhaseLabel.includes(token)) {
      tokenScore += 2;
    }

    if (searchableMaterials.some((material) => material.includes(token))) {
      tokenScore += 4;
    }

    score += tokenScore;
  }

  return score;
}

export default function GrimoireScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const styles = makeStyles(theme);
  const [query, setQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const deferredQuery = useDeferredValue(query);

  const rituals = useMemo(() => listRituals(), []);

  const moonPhaseOptions = useMemo(() => {
    const uniquePhases = Array.from(new Set(rituals.map((ritual) => ritual.moonPhase)));

    return uniquePhases.sort((first, second) => {
      const firstOrder = moonPhaseOrder[first] ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = moonPhaseOrder[second] ?? Number.MAX_SAFE_INTEGER;

      if (firstOrder === secondOrder) {
        return first.localeCompare(second);
      }

      return firstOrder - secondOrder;
    });
  }, [rituals]);

  const materialOptions = useMemo(() => {
    return Array.from(new Set(rituals.flatMap((ritual) => ritual.materials))).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [rituals]);

  const filteredRituals = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const baseFilteredRituals = rituals.filter((ritual) => {
      if (selectedDifficulty !== "all" && ritual.difficulty !== selectedDifficulty) {
        return false;
      }

      if (selectedMoonPhase !== "all" && ritual.moonPhase !== selectedMoonPhase) {
        return false;
      }

      if (selectedMaterial !== "all" && !ritual.materials.includes(selectedMaterial)) {
        return false;
      }

      return true;
    });

    if (!queryTokens.length) {
      return baseFilteredRituals;
    }

    return baseFilteredRituals
      .map((ritual) => ({
        ritual,
        score: getRitualSearchScore(ritual, queryTokens),
      }))
      .filter((result) => result.score > 0)
      .sort((first, second) => {
        if (first.score === second.score) {
          return first.ritual.title.localeCompare(second.ritual.title);
        }

        return second.score - first.score;
      })
      .map((result) => result.ritual);
  }, [deferredQuery, rituals, selectedDifficulty, selectedMoonPhase, selectedMaterial]);

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

      <ScrollView contentContainerStyle={styles.content} removeClippedSubviews showsVerticalScrollIndicator={false}>
        <Searchbar
          onChangeText={setQuery}
          iconColor={`${theme.colors.primary}BF`}
          inputStyle={styles.searchInputStyle}
          placeholder="Search spells, crystals, herbs..."
          placeholderTextColor={`${theme.colors.onSurfaceMuted}B3`}
          style={styles.searchWrap}
          value={query}
        />

        <View style={styles.filtersCard}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Difficulty</Text>
            <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
              {difficultyOptions.map((option) => {
                const isSelected = selectedDifficulty === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedDifficulty(option.value)}
                    style={[styles.filterChip, isSelected ? styles.filterChipActive : null]}
                  >
                    <Text style={[styles.filterChipLabel, isSelected ? styles.filterChipLabelActive : null]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Moon Phase</Text>
            <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setSelectedMoonPhase("all")}
                style={[styles.filterChip, selectedMoonPhase === "all" ? styles.filterChipActive : null]}
              >
                <Text style={[styles.filterChipLabel, selectedMoonPhase === "all" ? styles.filterChipLabelActive : null]}>All Phases</Text>
              </Pressable>
              {moonPhaseOptions.map((phase) => {
                const isSelected = selectedMoonPhase === phase;

                return (
                  <Pressable
                    key={phase}
                    onPress={() => setSelectedMoonPhase(phase)}
                    style={[styles.filterChip, isSelected ? styles.filterChipActive : null]}
                  >
                    <Text style={[styles.filterChipLabel, isSelected ? styles.filterChipLabelActive : null]}>
                      {formatPhaseLabel(phase)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Material</Text>
            <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setSelectedMaterial("all")}
                style={[styles.filterChip, selectedMaterial === "all" ? styles.filterChipActive : null]}
              >
                <Text style={[styles.filterChipLabel, selectedMaterial === "all" ? styles.filterChipLabelActive : null]}>All Materials</Text>
              </Pressable>
              {materialOptions.map((material) => {
                const isSelected = selectedMaterial === material;

                return (
                  <Pressable
                    key={material}
                    onPress={() => setSelectedMaterial(material)}
                    style={[styles.filterChip, isSelected ? styles.filterChipActive : null]}
                  >
                    <Text style={[styles.filterChipLabel, isSelected ? styles.filterChipLabelActive : null]}>{material}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.resultMeta}>{filteredRituals.length} rituals found</Text>
        </View>

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
            {!filteredRituals.length ? <Text style={styles.emptyLabel}>No rituals match your current filters.</Text> : null}
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
    filtersCard: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}2E`,
      borderRadius: 14,
      backgroundColor: theme.colors.surface1,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 10,
      gap: 10,
    },
    filterGroup: {
      gap: 8,
    },
    filterTitle: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    filterRow: {
      gap: 8,
      paddingRight: 8,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}3B`,
      backgroundColor: `${theme.colors.primary}12`,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipLabel: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: "600",
    },
    filterChipLabelActive: {
      color: theme.colors.onPrimary,
    },
    resultMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
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
