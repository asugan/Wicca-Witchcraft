import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";

import { LibraryChip } from "@/components/mystic/LibraryChip";
import { listLibraryCategoryCounts, listLibraryEntries } from "@/db/repositories/library-repository";
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

export default function LibraryScreen() {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

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
        <Text style={styles.title}>Mystic Library</Text>
        <Text style={styles.subtitle}>Explore cross-linked entries to deepen your ritual practice.</Text>

        <View style={styles.chipsWrap}>
          <LibraryChip icon="shape-outline" label="All" onPress={() => setSelectedType("all")} />
          {categoryCounts.map((category) => (
            <LibraryChip
              icon={categoryIcons[category.entityType] ?? "book-open-page-variant"}
              key={category.entityType}
              label={`${category.entityType} (${category.count})`}
              onPress={() => setSelectedType(category.entityType)}
            />
          ))}
        </View>

        <View style={styles.card}>
          {filteredEntries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => {
                trackEvent("library_entry_viewed", {
                  user_id: "local-user",
                  tab_name: "library",
                  entity_id: entry.id,
                  source: selectedType,
                });
              }}
              style={styles.row}
            >
              <MaterialCommunityIcons color={theme.colors.primary} name={categoryIcons[entry.entityType] ?? "star-four-points"} size={16} />
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowText}>{entry.title}</Text>
                <Text style={styles.rowSubtext}>{entry.summary}</Text>
              </View>
            </Pressable>
          ))}
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
      flex: 1,
      padding: 20,
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
  });
