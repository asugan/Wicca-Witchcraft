import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, InteractionManager, LayoutAnimation, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { LibraryChip } from "@/components/mystic/LibraryChip";
import { LibraryEntryItem } from "@/components/mystic/LibraryEntryItem";
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

type LibraryEntry = ReturnType<typeof listLibraryEntries>[number];

type LibraryData = {
  entries: ReturnType<typeof listLibraryEntries>;
  categoryCounts: ReturnType<typeof listLibraryCategoryCounts>;
};

function getLibrarySearchScore(entry: LibraryEntry, tokens: string[]): number {
  let score = 0;
  const title = entry.title.toLowerCase();
  const summary = (entry.summary ?? "").toLowerCase();
  const type = entry.entityType.toLowerCase();

  for (const token of tokens) {
    if (title.startsWith(token)) score += 8;
    else if (title.includes(token)) score += 5;
    if (summary.includes(token)) score += 3;
    if (type.includes(token)) score += 2;
  }
  return score;
}

function LibraryItemSeparator() {
  return <View style={librarySeparatorStyle} />;
}

const librarySeparatorStyle = { height: 12 };

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const { isPremium, showUpgradePrompt } = usePremiumGate();

  const [selectedType, setSelectedType] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const [libraryData, setLibraryData] = useState<LibraryData | null>(null);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setLibraryData({
        entries: listLibraryEntries(),
        categoryCounts: listLibraryCategoryCounts(),
      });
    });
    return () => task.cancel();
  }, []);

  const activeFilterCount = selectedType !== "all" ? 1 : 0;

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersExpanded((prev) => !prev);
  };

  const filteredEntries = useMemo(() => {
    if (!libraryData) return [];

    const tokens = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);

    let results = libraryData.entries;

    if (selectedType !== "all") {
      results = results.filter((e) => e.entityType === selectedType);
    }

    if (tokens.length > 0) {
      results = results
        .map((e) => ({ entry: e, score: getLibrarySearchScore(e, tokens) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
        .map(({ entry }) => entry);
    }

    return results;
  }, [libraryData, selectedType, deferredQuery]);

  const keyExtractor = useCallback((item: LibraryEntry) => item.id, []);

  const renderEntryItem = useCallback(
    ({ item: entry }: { item: LibraryEntry }) => {
      const isLocked = !!(entry.isPremium && !isPremium);
      const displaySummary = isLocked
        ? entry.summary.slice(0, 60) + (entry.summary.length > 60 ? "..." : "")
        : entry.summary;

      return (
        <LibraryEntryItem
          entry={entry}
          isLocked={isLocked}
          displaySummary={displaySummary}
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
        />
      );
    },
    [isPremium, showUpgradePrompt, selectedType, router]
  );

  const filtersCard = useMemo(
    () => (
      <View style={styles.filtersCard}>
        <Pressable onPress={toggleFilters} style={styles.filtersHeader}>
          <View style={styles.filtersHeaderLeft}>
            <MaterialCommunityIcons color={theme.colors.primary} name="filter-variant" size={20} />
            <Text style={styles.filtersHeaderTitle}>{t("library.filters")}</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
          <MaterialCommunityIcons
            color={theme.colors.onSurfaceMuted}
            name={filtersExpanded ? "chevron-up" : "chevron-down"}
            size={24}
          />
        </Pressable>

        {filtersExpanded && (
          <View style={styles.filtersContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>{t("library.filterCategory")}</Text>
              <ScrollView contentContainerStyle={styles.chipsContent} horizontal showsHorizontalScrollIndicator={false}>
                <LibraryChip active={selectedType === "all"} icon="shape-outline" label={t("library.filterAll")} onPress={() => setSelectedType("all")} />
                {(libraryData?.categoryCounts ?? []).map((category) => {
                  const typeKey = ENTITY_TYPE_KEYS[category.entityType];
                  const typeLabel = typeKey ? t(typeKey as string) : category.entityType;
                  return (
                    <LibraryChip
                      active={selectedType === category.entityType}
                      icon={categoryIcons[category.entityType] ?? "book-open-page-variant"}
                      key={category.entityType}
                      label={`${typeLabel} (${category.count})`}
                      onPress={() => setSelectedType(category.entityType)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {libraryData && (
          <Text style={[styles.resultMeta, filtersExpanded && styles.resultMetaExpanded]}>
            {t("library.entriesFound", { count: filteredEntries.length })}
          </Text>
        )}
      </View>
    ),
    [activeFilterCount, filtersExpanded, libraryData, selectedType, filteredEntries.length, t, theme, styles]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.topSection}>
        <Text style={styles.title}>{t("library.title")}</Text>
        <Text style={styles.subtitle}>{t("library.subtitle")}</Text>
        <Searchbar
          placeholder={t("library.searchPlaceholder")}
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
        />
        {filtersCard}
      </View>
      {!libraryData ? (
        <ActivityIndicator color={theme.colors.primary} style={{ paddingVertical: 48 }} />
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntryItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={LibraryItemSeparator}
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
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
    searchBar: {
      borderRadius: 14,
      elevation: 0,
      backgroundColor: theme.colors.surface1,
    },
    filtersCard: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}2E`,
      borderRadius: 14,
      backgroundColor: theme.colors.surface1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      overflow: "hidden",
    },
    filtersHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    filtersHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    filtersHeaderTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "600",
    },
    filterBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    filterBadgeText: {
      color: theme.colors.onPrimary,
      fontSize: 11,
      fontWeight: "700",
    },
    filtersContent: {
      marginTop: 12,
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
    chipsContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingRight: 8,
    },
    resultMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 8,
    },
    resultMetaExpanded: {
      marginTop: 12,
    },
    card: {
      marginTop: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}38`,
      backgroundColor: theme.colors.surface1,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    cardContent: {
      padding: 16,
      paddingBottom: 124,
    },
  });
