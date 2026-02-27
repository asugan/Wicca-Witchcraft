import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { listLibraryEntries } from "@/db/repositories/library-repository";
import { useMysticTheme } from "@/theme/use-mystic-theme";

type LibraryEntry = ReturnType<typeof listLibraryEntries>[number];

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  crystal: "diamond-stone",
  herb: "leaf",
  candle: "candle",
  symbol: "star-four-points",
  deity: "account-star",
};

type LibraryEntryItemProps = {
  entry: LibraryEntry;
  isLocked: boolean;
  displaySummary: string;
  onPress: () => void;
};

function LibraryEntryItemComponent({ entry, isLocked, displaySummary, onPress }: LibraryEntryItemProps) {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <MaterialCommunityIcons
        color={theme.colors.primary}
        name={categoryIcons[entry.entityType] ?? "star-four-points"}
        size={16}
      />
      <View style={styles.rowTextWrap}>
        <View style={styles.rowTitleWrap}>
          <Text style={styles.rowText}>{entry.title}</Text>
          {entry.isPremium ? (
            <View style={[styles.premiumTag, isLocked && styles.premiumTagLocked]}>
              <MaterialCommunityIcons
                color={isLocked ? theme.colors.onSurfaceMuted : theme.colors.primary}
                name={isLocked ? "lock" : "star-four-points"}
                size={10}
              />
            </View>
          ) : null}
        </View>
        <Text style={[styles.rowSubtext, isLocked && styles.rowSubtextLocked]}>{displaySummary}</Text>
      </View>
      <MaterialCommunityIcons
        color={isLocked ? theme.colors.onSurfaceMuted : `${theme.colors.primary}99`}
        name="chevron-right"
        size={18}
      />
    </Pressable>
  );
}

export const LibraryEntryItem = memo(
  LibraryEntryItemComponent,
  (prev, next) =>
    prev.entry.id === next.entry.id &&
    prev.isLocked === next.isLocked &&
    prev.displaySummary === next.displaySummary
);

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
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
