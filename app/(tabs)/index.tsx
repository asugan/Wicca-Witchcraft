import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { MoonPhaseBadge } from "@/components/mystic/MoonPhaseBadge";
import { getHomeDailySnapshot } from "@/db/repositories/home-repository";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export default function HomeScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const dailySnapshot = useMemo(() => getHomeDailySnapshot(), []);
  const recommendation = dailySnapshot.recommendation;
  const [cardRevealed, setCardRevealed] = useState(false);
  const card = dailySnapshot.card;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const heroSpin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const actions = useMemo(
    () => [
      { id: "log", icon: "notebook-edit-outline" as keyof typeof MaterialCommunityIcons.glyphMap, label: t("home.logRitual") },
      { id: "horoscope", icon: "star-four-points-outline" as keyof typeof MaterialCommunityIcons.glyphMap, label: t("home.dailyHoroscope") },
      { id: "cleanse", icon: "leaf-circle-outline" as keyof typeof MaterialCommunityIcons.glyphMap, label: t("home.cleanseSpace") },
    ],
    [t]
  );

  useEffect(() => {
    trackEvent("home_viewed", {
      user_id: "local-user",
      tab_name: "home",
      entity_id: recommendation?.id,
      source: "tab_mount",
    });
  }, [recommendation?.id]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.blueHalo} />
        <View pointerEvents="none" style={styles.greenHalo} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>{t("home.astrologicalDate")}</Text>
            <Text style={styles.headerTitle}>
              {dailySnapshot.dateLabel} • {dailySnapshot.cosmicLabel}
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons color={theme.colors.primary} name="bell-outline" size={22} />
            <View style={styles.notifyDot} />
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.zodiacRingOuter}>
            <Animated.View
              style={[
                styles.zodiacRingInner,
                { transform: [{ rotate: heroSpin }] },
              ]}
            />
            <Animated.View
              style={[
                styles.zodiacRingPulse,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
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
            description={dailySnapshot.moon.summary}
            illumination={dailySnapshot.moon.illumination}
            phase={dailySnapshot.moon.phase}
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

        <Surface style={styles.intentionCard}>
          <View style={styles.intentionHeader}>
            <MaterialCommunityIcons color={theme.colors.primary} name="meditation" size={16} />
            <Text style={styles.intentionLabel}>{t("home.dailyIntention")}</Text>
          </View>
          <Text style={styles.intentionText}>{dailySnapshot.intention}</Text>
        </Surface>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.dailyTarot")}</Text>
          <Text style={styles.sectionLink}>{t("home.viewAll")}</Text>
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
              <Text style={styles.mediaBadgeText}>{t("home.cardOfTheDay")}</Text>
            </View>
          </ImageBackground>

          <View style={styles.insightBody}>
            <View style={styles.categoryLine}>
              <MaterialCommunityIcons color={theme.colors.primary} name="star-four-points" size={16} />
              <Text style={styles.categoryText}>
                {card ? `${card.arcana} arcana${card.isReversed ? " • reversed" : ""}` : t("home.dailyDraw")}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{card?.cardName ?? t("home.defaultCardTitle")}</Text>

            {cardRevealed && card ? (
              <View style={styles.revealedCardBody}>
                <Text style={styles.quote}>
                  {`"${card.isReversed ? card.reversedMeaning : card.uprightMeaning}"`}
                </Text>
                <View style={styles.keywordsRow}>
                  {card.keywords.split(", ").map((kw) => (
                    <View key={kw} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.quote}>{`"${card?.uprightMeaning ?? t("home.defaultCardQuote")}"`}</Text>
            )}

            <Button
              contentStyle={styles.primaryButtonContent}
              mode="contained"
              onPress={() => {
                setCardRevealed(true);
                trackEvent("daily_card_drawn", {
                  user_id: "local-user",
                  tab_name: "home",
                  entity_id: card?.id ?? "daily-card-default",
                  source: "home_card",
                });
              }}
              style={styles.primaryButton}
              textColor={theme.colors.onPrimary}
            >
              {cardRevealed ? t("home.cardRevealed") : t("home.revealGuidance")}
            </Button>
          </View>
        </Surface>

        {recommendation ? (
          <Surface style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationLabel}>{t("home.recommendedRitual")}</Text>
              <Text style={styles.recommendationMeta}>{t("home.duration", { durationMinutes: recommendation.durationMinutes })}</Text>
            </View>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationSummary}>{recommendation.summary}</Text>
            <Button
              mode="outlined"
              onPress={() => {
                trackEvent("ritual_opened", {
                  user_id: "local-user",
                  tab_name: "home",
                  entity_id: recommendation.id,
                  source: "home_recommendation",
                });

                router.push(`/ritual/${recommendation.slug}` as never);
              }}
              style={styles.recommendationButton}
              textColor={theme.colors.primary}
            >
              {t("home.openRitual")}
            </Button>
          </Surface>
        ) : null}
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
      backgroundColor: theme.colors.surface2,
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
    zodiacRingPulse: {
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: 130,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: `${theme.colors.primary}09`,
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
      backgroundColor: theme.colors.surface2,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    actionLabel: {
      color: theme.colors.onSurface,
      fontWeight: "500",
    },
    intentionCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}2E`,
      backgroundColor: theme.colors.surface2,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8,
    },
    intentionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    intentionLabel: {
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.9,
      fontSize: 11,
      fontWeight: "700",
    },
    intentionText: {
      color: theme.colors.onSurface,
      lineHeight: 21,
      fontSize: 14,
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
      color: theme.colors.onSurfaceMuted,
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
    recommendationCard: {
      marginTop: 2,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
      backgroundColor: theme.colors.surface2,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 8,
    },
    recommendationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    recommendationLabel: {
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.9,
      fontSize: 11,
      fontWeight: "700",
    },
    recommendationMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.9,
    },
    recommendationTitle: {
      color: theme.colors.onSurface,
      fontSize: 24,
      fontWeight: "700",
      fontFamily: typefaces.display,
    },
    recommendationSummary: {
      color: theme.colors.onSurfaceMuted,
      lineHeight: 20,
    },
    recommendationButton: {
      marginTop: 2,
      alignSelf: "flex-start",
      borderColor: `${theme.colors.primary}80`,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}14`,
    },
    revealedCardBody: {
      gap: 10,
    },
    keywordsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    keywordChip: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
      backgroundColor: `${theme.colors.primary}14`,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    keywordText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "capitalize",
    },
  });
