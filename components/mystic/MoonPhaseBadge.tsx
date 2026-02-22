import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";

import { useMysticTheme } from "@/theme/use-mystic-theme";

type MoonPhaseBadgeProps = {
  phase: string;
  illumination: string;
  description: string;
};

export function MoonPhaseBadge({ phase, illumination, description }: MoonPhaseBadgeProps) {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>{phase}</Text>
      <Chip
        compact
        icon={() => (
          <MaterialCommunityIcons color={theme.colors.primary} name="weather-night" size={16} style={styles.chipIcon} />
        )}
        style={styles.chip}
        textStyle={styles.chipText}
      >
        Illumination: {illumination}
      </Chip>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 10,
      marginTop: 14,
    },
    phaseTitle: {
      color: theme.colors.onSurface,
      fontSize: theme.typeScale.heading,
      lineHeight: 38,
      fontWeight: "700",
    },
    chip: {
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}50`,
      backgroundColor: `${theme.colors.primary}12`,
    },
    chipIcon: {
      marginLeft: 2,
    },
    chipText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    description: {
      color: theme.colors.onSurfaceMuted,
      maxWidth: 290,
      textAlign: "center",
      lineHeight: 22,
    },
  });
