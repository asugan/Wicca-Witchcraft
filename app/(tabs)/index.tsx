import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface, Text } from "react-native-paper";

import { MoonPhaseBadge } from "@/components/mystic/MoonPhaseBadge";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const actions: { id: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { id: "log", icon: "notebook-edit-outline", label: "Log Ritual" },
  { id: "horoscope", icon: "star-four-points-outline", label: "Daily Horoscope" },
  { id: "cleanse", icon: "leaf-circle-outline", label: "Cleanse Space" },
];

export default function HomeScreen() {
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  useEffect(() => {
    trackEvent("home_viewed", {
      user_id: "local-user",
      tab_name: "home",
      source: "tab_mount",
    });
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.blueHalo} />
        <View pointerEvents="none" style={styles.greenHalo} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Astrological Date</Text>
            <Text style={styles.headerTitle}>October 24 • Scorpio Season</Text>
          </View>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons color={theme.colors.primary} name="bell-outline" size={22} />
            <View style={styles.notifyDot} />
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.zodiacRingOuter}>
            <View style={styles.zodiacRingInner} />
            <View style={styles.moonOrb}>
              <ImageBackground
                imageStyle={styles.moonImage}
                source={{
                  uri: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=1932&auto=format&fit=crop",
                }}
                style={styles.moonSurface}
              >
                <View style={styles.moonShade} />
              </ImageBackground>
            </View>
          </View>

          <MoonPhaseBadge
            description="A powerful time for release, banishing bad habits, and turning inward."
            illumination="85%"
            phase="Waning Gibbous"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
          {actions.map((action) => (
            <Surface key={action.id} style={styles.actionChip}>
              <MaterialCommunityIcons color={theme.colors.primary} name={action.icon} size={18} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Surface>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Insight</Text>
          <Text style={styles.sectionLink}>View All</Text>
        </View>

        <Surface style={styles.insightCard}>
          <ImageBackground
            imageStyle={styles.insightImage}
            source={{
              uri: "https://images.unsplash.com/photo-1575035229855-0f7f828f4116?q=80&w=1964&auto=format&fit=crop",
            }}
            style={styles.insightMedia}
          >
            <View style={styles.mediaOverlay} />
            <View style={styles.mediaBadge}>
              <Text style={styles.mediaBadgeText}>Card of the Day</Text>
            </View>
          </ImageBackground>

          <View style={styles.insightBody}>
            <View style={styles.categoryLine}>
              <MaterialCommunityIcons color={theme.colors.primary} name="star-four-points" size={16} />
              <Text style={styles.categoryText}>Major Arcana</Text>
            </View>
            <Text style={styles.cardTitle}>The Star</Text>
            <Text style={styles.quote}>{'"Hope is the light that guides you through the darkness."'}</Text>
            <Button
              contentStyle={styles.primaryButtonContent}
              mode="contained"
              onPress={() => {
                trackEvent("daily_card_drawn", {
                  user_id: "local-user",
                  tab_name: "home",
                  entity_id: "daily-card-default",
                  source: "home_card",
                });
              }}
              style={styles.primaryButton}
              textColor={theme.colors.onPrimary}
            >
              View Interpretation
            </Button>
          </View>
        </Surface>
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
    content: {
      paddingBottom: 124,
      paddingHorizontal: 16,
      gap: 18,
    },
    blueHalo: {
      position: "absolute",
      top: 54,
      right: -84,
      width: 250,
      height: 250,
      borderRadius: 128,
      backgroundColor: `${theme.colors.mysticBlue}A6`,
    },
    greenHalo: {
      position: "absolute",
      top: 212,
      left: -90,
      width: 220,
      height: 220,
      borderRadius: 120,
      backgroundColor: `${theme.colors.mysticGreen}4A`,
    },
    header: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLabel: {
      color: `${theme.colors.primary}E0`,
      fontSize: theme.typeScale.overline,
      letterSpacing: 1.25,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    headerTitle: {
      color: theme.colors.onSurface,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 2,
      fontFamily: typefaces.display,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.surface2}CC`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    notifyDot: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
    heroWrap: {
      alignItems: "center",
      marginTop: 8,
    },
    zodiacRingOuter: {
      width: 312,
      height: 312,
      borderRadius: 156,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}38`,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.colors.primary}0D`,
    },
    zodiacRingInner: {
      position: "absolute",
      width: 288,
      height: 288,
      borderRadius: 144,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: `${theme.colors.primary}40`,
    },
    moonOrb: {
      width: 198,
      height: 198,
      borderRadius: 99,
      backgroundColor: theme.colors.surface1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },
    moonSurface: {
      width: 164,
      height: 164,
      borderRadius: 82,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    moonImage: {
      borderRadius: 82,
    },
    moonShade: {
      width: 146,
      height: 146,
      borderRadius: 73,
      backgroundColor: "rgba(0,0,0,0.48)",
      transform: [{ translateX: 21 }],
    },
    actionScroll: {
      marginTop: 2,
    },
    actionChip: {
      marginRight: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: `${theme.colors.surface2}B3`,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    actionLabel: {
      color: theme.colors.onSurface,
      fontWeight: "500",
    },
    sectionHeader: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontSize: 22,
      fontWeight: "700",
      fontFamily: typefaces.display,
    },
    sectionLink: {
      color: theme.colors.primary,
      fontSize: theme.typeScale.label,
      fontWeight: "600",
    },
    insightCard: {
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: theme.colors.surface1,
    },
    insightMedia: {
      height: 214,
      justifyContent: "flex-end",
    },
    insightImage: {
      resizeMode: "cover",
    },
    mediaOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(18,12,6,0.45)",
    },
    mediaBadge: {
      margin: 12,
      alignSelf: "flex-start",
      backgroundColor: "rgba(0,0,0,0.45)",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    mediaBadgeText: {
      color: "#FFF",
      fontWeight: "700",
      fontSize: 10,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    insightBody: {
      paddingHorizontal: 18,
      paddingVertical: 18,
      gap: 10,
    },
    categoryLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    categoryText: {
      color: theme.colors.primary,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: "700",
    },
    cardTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 34,
      fontWeight: "700",
      lineHeight: 38,
    },
    quote: {
      color: "#D0CABD",
      borderLeftWidth: 2,
      borderColor: `${theme.colors.primary}59`,
      paddingLeft: 10,
      fontStyle: "italic",
      lineHeight: 21,
    },
    primaryButton: {
      marginTop: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
    },
    primaryButtonContent: {
      height: 46,
    },
  });
