import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { LibraryChip } from "@/components/mystic/LibraryChip";
import { listLibraryCategoryCounts, listLibraryEntries } from "@/db/repositories/library-repository";
import { usePremiumGate } from "@/hooks/use-premium-gate";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  crystal: "diamond-stone",
  herb: "leaf",
  candle: "candle",
  symbol: "star-four-points",
  deity: "account-star",
};

const ENTITY_TYPE_KEYS: Record<string, string> = {
  crystal: "library.typeCrystal",
  herb: "library.typeHerb",
  candle: "library.typeCandle",
  symbol: "library.typeSymbol",
  deity: "library.typeDeity",
};

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const { isPremium, showUpgradePrompt } = usePremiumGate();

  const [selectedType, setSelectedType] = useState<string>("all");
  const entries = useMemo(() => listLibraryEntries(), []);
  const categoryCounts = useMemo(() => listLibraryCategoryCounts(), []);

  const filteredEntries = useMemo(() => {
    if (selectedType === "all") {
      return entries;
    }

    return entries.filter((entry) => entry.entityType === selectedType);
  }, [entries, selectedType]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("library.title")}</Text>
        <Text style={styles.subtitle}>{t("library.subtitle")}</Text>

        <View style={styles.chipsWrap}>
          <LibraryChip icon="shape-outline" label={t("library.filterAll")} onPress={() => setSelectedType("all")} />
          {categoryCounts.map((category) => {
            const typeKey = ENTITY_TYPE_KEYS[category.entityType];
            const typeLabel = typeKey ? t(typeKey as string) : category.entityType;
            return (
            <LibraryChip
              icon={categoryIcons[category.entityType] ?? "book-open-page-variant"}
              key={category.entityType}
              label={`${typeLabel} (${category.count})`}
              onPress={() => setSelectedType(category.entityType)}
            />
          );
          })}
        </View>

        <View style={styles.card}>
          {filteredEntries.map((entry) => {
            const isLocked = entry.isPremium && !isPremium;
            const displaySummary = isLocked
              ? entry.summary.slice(0, 60) + (entry.summary.length > 60 ? "..." : "")
              : entry.summary;

            return (
              <Pressable
                key={entry.id}
                onPress={() => {
                  if (isLocked) {
                    showUpgradePrompt("library_premium");
                    return;
                  }
                  trackEvent("library_entry_viewed", {
                    user_id: "local-user",
                    tab_name: "library",
                    entity_id: entry.id,
                    source: selectedType,
                  });
                  router.push({ pathname: "/library/[slug]", params: { slug: entry.slug } });
                }}
                style={styles.row}
              >
                <MaterialCommunityIcons color={theme.colors.primary} name={categoryIcons[entry.entityType] ?? "star-four-points"} size={16} />
                <View style={styles.rowTextWrap}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={styles.rowText}>{entry.title}</Text>
                    {entry.isPremium && (
                      <View style={[styles.premiumTag, isLocked && styles.premiumTagLocked]}>
                        <MaterialCommunityIcons
                          color={isLocked ? theme.colors.onSurfaceMuted : theme.colors.primary}
                          name={isLocked ? "lock" : "star-four-points"}
                          size={10}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.rowSubtext, isLocked && styles.rowSubtextLocked]}>{displaySummary}</Text>
                </View>
              </Pressable>
            );
          })}
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
    container: {
      padding: 20,
      paddingBottom: 124,
      gap: 12,
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 34,
      fontFamily: typefaces.display,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.onSurfaceMuted,
      lineHeight: 20,
    },
    chipsWrap: {
      marginTop: 6,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    card: {
      marginTop: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}38`,
      backgroundColor: theme.colors.surface1,
      padding: 16,
      gap: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    rowTextWrap: {
      flex: 1,
      gap: 2,
    },
    rowText: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: "600",
    },
    rowSubtext: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    rowTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    premiumTag: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.colors.primary}26`,
    },
    premiumTagLocked: {
      backgroundColor: `${theme.colors.onSurfaceMuted}26`,
    },
    rowSubtextLocked: {
      fontStyle: "italic",
    },
  });
