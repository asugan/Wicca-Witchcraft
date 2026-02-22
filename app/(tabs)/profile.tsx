import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

export default function ProfileScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>My Space</Text>
        <Text style={styles.subtitle}>Saved rituals, journal entries, and settings.</Text>

        <View style={styles.panel}>
          <View style={styles.item}>
            <MaterialCommunityIcons color={mysticTheme.colors.primary} name="bookmark-multiple-outline" size={20} />
            <Text style={styles.itemText}>Favorites</Text>
          </View>
          <View style={styles.item}>
            <MaterialCommunityIcons color={mysticTheme.colors.primary} name="notebook-outline" size={20} />
            <Text style={styles.itemText}>Book of Shadows</Text>
          </View>
          <View style={styles.item}>
            <MaterialCommunityIcons color={mysticTheme.colors.primary} name="cog-outline" size={20} />
            <Text style={styles.itemText}>Settings</Text>
          </View>
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
  panel: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    backgroundColor: mysticTheme.colors.surface,
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
    color: mysticTheme.colors.textMain,
    fontSize: 15,
    fontWeight: "500",
  },
});
