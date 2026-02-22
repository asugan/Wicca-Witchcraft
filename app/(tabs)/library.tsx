import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const entries = ["Crystals", "Herbs & Plants", "Candle Colors", "Symbols & Runes", "Deities"];

export default function LibraryScreen() {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Mystic Library</Text>
        <Text style={styles.subtitle}>Cross-linked knowledge entries will live here.</Text>

        <View style={styles.card}>
          {entries.map((entry) => (
            <View key={entry} style={styles.row}>
              <MaterialCommunityIcons color={theme.colors.primary} name="star-four-points-outline" size={16} />
              <Text style={styles.rowText}>{entry}</Text>
            </View>
          ))}
        </View>
      </View>
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
      alignItems: "center",
      gap: 8,
    },
    rowText: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
  });
