import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

type IncantationBlockProps = {
  text: string;
};

export function IncantationBlock({ text }: IncantationBlockProps) {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Incantation</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    wrap: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}42`,
      backgroundColor: `${theme.colors.surface2}C7`,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      marginHorizontal: 20,
      marginTop: 8,
    },
    label: {
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 10,
      fontWeight: "700",
    },
    body: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontStyle: "italic",
      lineHeight: 24,
      fontSize: 17,
    },
  });
