import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

type RitualCardProps = {
  title: string;
  subtitle: string;
  image: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
};

export function RitualCard({ title, subtitle, image, icon, onPress }: RitualCardProps) {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <ImageBackground imageStyle={styles.mediaImage} source={{ uri: image }} style={styles.media}>
        <View style={styles.mediaOverlay} />
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={theme.colors.primary} name={icon} size={24} />
        </View>
      </ImageBackground>
      <Text style={styles.title}>{title}</Text>
      <Text numberOfLines={2} style={styles.subtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    card: {
      width: "48%",
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.outline}80`,
      backgroundColor: theme.colors.surface1,
      padding: 10,
      gap: 4,
    },
    media: {
      aspectRatio: 1,
      borderRadius: 10,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    mediaImage: {
      resizeMode: "cover",
    },
    mediaOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(24,22,17,0.58)",
    },
    iconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 19,
      fontWeight: "700",
      fontFamily: typefaces.display,
    },
    subtitle: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  });
