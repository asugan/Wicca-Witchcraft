import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export default function ProfileScreen() {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>My Space</Text>
        <Text style={styles.subtitle}>Saved rituals, journal entries, and settings.</Text>

        <View style={styles.panel}>
          <View style={styles.item}>
            <MaterialCommunityIcons color={theme.colors.primary} name="bookmark-multiple-outline" size={20} />
            <Text style={styles.itemText}>Favorites</Text>
          </View>
          <View style={styles.item}>
            <MaterialCommunityIcons color={theme.colors.primary} name="notebook-outline" size={20} />
            <Text style={styles.itemText}>Book of Shadows</Text>
          </View>
          <View style={styles.item}>
            <MaterialCommunityIcons color={theme.colors.primary} name="cog-outline" size={20} />
            <Text style={styles.itemText}>Settings</Text>
          </View>
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
    panel: {
      marginTop: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: theme.colors.surface1,
      overflow: "hidden",
    },
    item: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.06)",
    },
    itemText: {
      color: theme.colors.onSurface,
      fontSize: 15,
      fontWeight: "500",
    },
  });
