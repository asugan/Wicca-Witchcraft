import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { useMysticTheme } from "@/theme/use-mystic-theme";

type LibraryChipProps = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
};

export function LibraryChip({ label, icon, onPress }: LibraryChipProps) {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <MaterialCommunityIcons color={theme.colors.primary} name={icon} size={14} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      backgroundColor: `${theme.colors.primary}1C`,
      paddingHorizontal: 11,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    label: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
  });
