import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { isLibraryEntryFavorited, toggleLibraryEntryFavorite } from "@/db/repositories/my-space-repository";
import { getLibraryEntryBySlug } from "@/db/repositories/library-repository";
import { usePremiumGate } from "@/hooks/use-premium-gate";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const LOCAL_USER_ID = "local-user";

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  crystal: "diamond-stone",
  herb: "leaf",
  candle: "candle",
  symbol: "star-four-points",
  deity: "account-star",
};

export default function LibraryDetailScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const { isPremium, showUpgradePrompt } = usePremiumGate();

  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : (slug ?? "");

  const entry = useMemo(() => getLibraryEntryBySlug(normalizedSlug), [normalizedSlug]);
  const isEntryPremium = entry?.isPremium ?? false;
  const showPremiumGate = isEntryPremium && !isPremium;

  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!entry) {
      return;
    }

    trackEvent("library_entry_opened", {
      user_id: LOCAL_USER_ID,
      tab_name: "library",
      entity_id: entry.id,
      source: "library_detail",
    });
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    setBookmarked(isLibraryEntryFavorited(LOCAL_USER_ID, entry.id));
  }, [entry]);

  const associatedTags = useMemo(() => {
    if (!entry) return [];
    return entry.spiritualProperties.split(",").map((tag) => tag.trim()).filter(Boolean);
  }, [entry]);

  const usageSteps = useMemo(() => {
    if (!entry) return [];

    const entityUsage: Record<string, { title: string; content: string }[]> = {
      crystal: [
        { title: t("libraryDetail.usageCleanse" as string), content: entry.cleansingMethod },
        { title: t("libraryDetail.usageProgram" as string), content: t("libraryDetail.usageProgramContent" as string) },
        { title: t("libraryDetail.usageCarry" as string), content: entry.careNote },
      ],
      herb: [
        { title: t("libraryDetail.usagePrepare" as string), content: t("libraryDetail.usagePrepareHerbContent" as string) },
        { title: t("libraryDetail.usageBurn" as string), content: entry.cleansingMethod },
        { title: t("libraryDetail.usageStore" as string), content: entry.careNote },
      ],
      candle: [
        { title: t("libraryDetail.usageCleanse" as string), content: entry.cleansingMethod },
        { title: t("libraryDetail.usageSetAltar" as string), content: t("libraryDetail.usageSetAltarContent" as string) },
        { title: t("libraryDetail.usageIgnite" as string), content: t("libraryDetail.usageIgniteContent" as string) },
      ],
      symbol: [
        { title: t("libraryDetail.usageStudy" as string), content: t("libraryDetail.usageStudyContent" as string) },
        { title: t("libraryDetail.usageDraw" as string), content: t("libraryDetail.usageDrawContent" as string) },
        { title: t("libraryDetail.usageMeditate" as string), content: t("libraryDetail.usageMeditateContent" as string) },
      ],
      deity: [
        { title: t("libraryDetail.usageResearch" as string), content: t("libraryDetail.usageResearchContent" as string) },
        { title: t("libraryDetail.usageOffering" as string), content: t("libraryDetail.usageOfferingContent" as string) },
        { title: t("libraryDetail.usageInvoke" as string), content: t("libraryDetail.usageInvokeContent" as string) },
      ],
    };

    return entityUsage[entry.entityType] ?? [];
  }, [entry, t]);

  if (!entry) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>{t("libraryDetail.notFound" as string)}</Text>
          <Pressable onPress={() => router.back()} style={styles.goBackButton}>
            <Text style={styles.goBackText}>{t("libraryDetail.goBack" as string)}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.backgroundGlow1} />
      <View style={styles.backgroundGlow2} />
      <View style={styles.backgroundGlow3} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialCommunityIcons color={theme.colors.primary} name="arrow-left" size={24} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              const nextValue = toggleLibraryEntryFavorite(LOCAL_USER_ID, entry.id);
              setBookmarked(nextValue);

              if (nextValue) {
                trackEvent("library_entry_favorited", {
                  user_id: LOCAL_USER_ID,
                  tab_name: "library",
                  entity_id: entry.id,
                  source: "library_detail",
                });
              }
            }}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
            />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <MaterialCommunityIcons color={theme.colors.primary} name="share-variant-outline" size={22} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.parchmentCard}>
          <View style={styles.tatteredEdgeTop} />

          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View style={styles.iconWrap}>
            <View style={styles.iconGlow} />
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                color={theme.colors.primary}
                name={categoryIcons[entry.entityType] ?? "star-four-points"}
                size={40}
              />
            </View>
          </View>

          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.subtitle}>{entry.spiritualProperties.split(",")[0]?.trim()}</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerStar}>&#10022;</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons color={theme.colors.primary} name="atom" size={24} />
              <Text style={styles.infoCardLabel}>{t("libraryDetail.energy" as string)}</Text>
              <Text style={styles.infoCardValue}>{entry.correspondences.split("|")[0]?.trim()}</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons color={theme.colors.primary} name="moon-waning-crescent" size={24} />
              <Text style={styles.infoCardLabel}>{t("libraryDetail.timing" as string)}</Text>
              <Text style={styles.infoCardValue}>{entry.correspondences.split("|").slice(1).join(", ").trim() || entry.careNote.slice(0, 30)}</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {showPremiumGate ? entry.summary.slice(0, 100) + "..." : entry.summary}
          </Text>

          {showPremiumGate ? (
            <View style={styles.premiumGateWrap}>
              <MaterialCommunityIcons color={theme.colors.primary} name="lock" size={28} />
              <Text style={styles.premiumGateTitle}>{t("libraryDetail.premiumContent" as string)}</Text>
              <Pressable onPress={() => showUpgradePrompt("library_premium")} style={styles.premiumButton}>
                <MaterialCommunityIcons color={theme.colors.onPrimary} name="star-four-points" size={16} />
                <Text style={styles.premiumButtonText}>{t("libraryDetail.unlockWithPremium" as string)}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons color={theme.colors.primary} name="auto-fix" size={18} />
                <Text style={styles.sectionTitle}>{t("libraryDetail.ritualUsage" as string)}</Text>
              </View>
              <View style={styles.sectionDivider} />

              <View style={styles.stepsWrap}>
                {usageSteps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepText}>{step.content}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.tagsSection}>
                <Text style={styles.tagsLabel}>{t("libraryDetail.associatedWith" as string)}</Text>
                <View style={styles.tagsWrap}>
                  {associatedTags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.tatteredEdgeBottom} />
        </View>
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
    backgroundGlow1: {
      position: "absolute",
      top: -80,
      right: -80,
      width: 256,
      height: 256,
      borderRadius: 128,
      backgroundColor: theme.colors.primary,
      opacity: 0.1,
    },
    backgroundGlow2: {
      position: "absolute",
      top: 160,
      left: -80,
      width: 192,
      height: 192,
      borderRadius: 96,
      backgroundColor: theme.colors.primary,
      opacity: 0.05,
    },
    backgroundGlow3: {
      position: "absolute",
      bottom: 80,
      right: 0,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: theme.colors.primary,
      opacity: 0.05,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      zIndex: 10,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.surface1}80`,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    parchmentCard: {
      backgroundColor: theme.mode === "dark" ? "#2D241E" : "#F3EAD3",
      borderRadius: 0,
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingTop: 32,
      marginTop: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
      position: "relative",
      overflow: "hidden",
    },
    tatteredEdgeTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 12,
      backgroundColor: theme.mode === "dark" ? "#2D241E" : "#F3EAD3",
    },
    tatteredEdgeBottom: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 12,
      backgroundColor: theme.mode === "dark" ? "#2D241E" : "#F3EAD3",
    },
    cornerTL: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 32,
      height: 32,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: `${theme.colors.primary}4D`,
      borderTopLeftRadius: 8,
    },
    cornerTR: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: `${theme.colors.primary}4D`,
      borderTopRightRadius: 8,
    },
    cornerBL: {
      position: "absolute",
      bottom: 16,
      left: 16,
      width: 32,
      height: 32,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: `${theme.colors.primary}4D`,
      borderBottomLeftRadius: 8,
    },
    cornerBR: {
      position: "absolute",
      bottom: 16,
      right: 16,
      width: 32,
      height: 32,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: `${theme.colors.primary}4D`,
      borderBottomRightRadius: 8,
    },
    iconWrap: {
      alignItems: "center",
      marginBottom: 16,
    },
    iconGlow: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: `${theme.colors.primary}33`,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.mode === "dark" ? "#3D342E" : "#EDE4CC",
    },
    title: {
      color: theme.colors.primary,
      fontFamily: typefaces.display,
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      color: theme.mode === "dark" ? "#A89B8C" : "#6D614C",
      fontStyle: "italic",
      fontSize: 14,
      textAlign: "center",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20,
      opacity: 0.6,
    },
    dividerLine: {
      width: 48,
      height: 1,
      backgroundColor: theme.colors.primary,
    },
    dividerStar: {
      color: theme.colors.primary,
      fontSize: 12,
      marginHorizontal: 8,
    },
    infoCards: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 24,
    },
    infoCard: {
      flex: 1,
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}1A`,
      backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)",
    },
    infoCardLabel: {
      fontFamily: typefaces.display,
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: theme.colors.primary,
      marginTop: 4,
      marginBottom: 4,
    },
    infoCardValue: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      color: theme.mode === "dark" ? "#E5DCCA" : "#2D241E",
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: "justify",
      color: theme.mode === "dark" ? "#C9BCA8" : "#4A4035",
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: typefaces.display,
      fontSize: 16,
      color: theme.colors.primary,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: `${theme.colors.primary}33`,
      marginBottom: 16,
    },
    stepsWrap: {
      gap: 16,
      marginBottom: 24,
    },
    stepRow: {
      flexDirection: "row",
      gap: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: `${theme.colors.primary}1A`,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.mode === "dark" ? "#F4F0E5" : "#2D241E",
      marginBottom: 4,
    },
    stepText: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.mode === "dark" ? "#A89B8C" : "#6D614C",
    },
    tagsSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: `${theme.colors.primary}1A`,
    },
    tagsLabel: {
      fontFamily: typefaces.display,
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: theme.mode === "dark" ? "#A89B8C" : "#6D614C",
      textAlign: "center",
      marginBottom: 12,
    },
    tagsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
      backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)",
    },
    tagText: {
      fontSize: 12,
      color: theme.mode === "dark" ? "#C9BCA8" : "#4A4035",
    },
    premiumGateWrap: {
      alignItems: "center",
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
      gap: 12,
    },
    premiumGateTitle: {
      color: theme.mode === "dark" ? "#F4F0E5" : "#2D241E",
      fontFamily: typefaces.display,
      fontSize: 16,
      fontWeight: "700",
    },
    premiumButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
    },
    premiumButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    notFoundWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 24,
    },
    notFoundTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 24,
      textAlign: "center",
    },
    goBackButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    goBackText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
