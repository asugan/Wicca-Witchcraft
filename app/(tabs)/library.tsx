import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

const entries = ["Crystals", "Herbs & Plants", "Candle Colors", "Symbols & Runes", "Deities"];

export default function LibraryScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Mystic Library</Text>
        <Text style={styles.subtitle}>Cross-linked knowledge entries will live here.</Text>

        <View style={styles.card}>
          {entries.map((entry) => (
            <View key={entry} style={styles.row}>
              <MaterialCommunityIcons color={mysticTheme.colors.primary} name="star-four-points-outline" size={16} />
              <Text style={styles.rowText}>{entry}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mysticTheme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    color: mysticTheme.colors.textMain,
    fontSize: 34,
    fontFamily: typefaces.display,
    fontWeight: "700",
  },
  subtitle: {
    color: mysticTheme.colors.textMuted,
    lineHeight: 20,
  },
  card: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.22)",
    backgroundColor: mysticTheme.colors.surface,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowText: {
    color: mysticTheme.colors.textMain,
    fontSize: 16,
  },
});
