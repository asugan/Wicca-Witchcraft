import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { IncantationBlock } from "@/components/mystic/IncantationBlock";
import { isRitualFavorited, toggleRitualFavorite } from "@/db/repositories/my-space-repository";
import { getRitualDetailBySlug } from "@/db/repositories/ritual-repository";
import { getCoverImage } from "@/utils/ritual-image";
import { usePremiumGate } from "@/hooks/use-premium-gate";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const LOCAL_USER_ID = "local-user";

export default function RitualDetailScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const { isPremium, showUpgradePrompt } = usePremiumGate();

  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : (slug ?? "full-moon-release");

  const detail = useMemo(() => getRitualDetailBySlug(normalizedSlug), [normalizedSlug]);
  const isRitualPremium = detail?.ritual.isPremium ?? false;
  const showPremiumGate = isRitualPremium && !isPremium;

  const [bookmarked, setBookmarked] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!detail) {
      return;
    }

    trackEvent("ritual_opened", {
      user_id: "local-user",
      tab_name: "grimoire",
      entity_id: detail.ritual.id,
      source: "ritual_detail",
    });
  }, [detail]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setBookmarked(isRitualFavorited(LOCAL_USER_ID, detail.ritual.id));
  }, [detail]);

  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  if (!detail) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>{t("ritual.notFound")}</Text>
          <Button mode="outlined" onPress={() => router.back()} textColor={theme.colors.primary}>
            {t("ritual.goBack")}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.texture} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialCommunityIcons color={theme.colors.primary} name="arrow-left" size={24} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              const nextValue = toggleRitualFavorite(LOCAL_USER_ID, detail.ritual.id);
              setBookmarked(nextValue);

              if (nextValue) {
                trackEvent("ritual_favorited", {
                  user_id: "local-user",
                  tab_name: "grimoire",
                  entity_id: detail.ritual.id,
                  source: "ritual_detail",
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
        <ImageBackground imageStyle={styles.heroImage} source={getCoverImage(detail.ritual.coverImage, detail.ritual.category)} style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTag}>{detail.ritual.category}</Text>
          <Text style={styles.heroTitle}>{detail.ritual.title}</Text>
        </ImageBackground>

        <Text style={styles.description}>{detail.ritual.summary}</Text>

        <View style={styles.metadataWrap}>
          <View style={styles.metadataBadge}>
            <Text style={styles.metadataText}>{t("ritual.difficulty", { value: detail.ritual.difficulty })}</Text>
          </View>
          <View style={styles.metadataBadge}>
            <Text style={styles.metadataText}>{t("ritual.moon", { value: detail.ritual.moonPhase.replaceAll("-", " ") })}</Text>
          </View>
          <View style={styles.metadataBadge}>
            <Text style={styles.metadataText}>{t("home.duration", { durationMinutes: detail.ritual.durationMinutes })}</Text>
          </View>
        </View>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>{t("ritual.materials")}</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.ingredientsCard}>
          {detail.materials.map((material) => {
            const selected = Boolean(checked[material.id]);
            const isLinked = Boolean(material.linkedEntryId);

            return (
              <View key={material.id} style={styles.ingredientRow}>
                <Pressable
                  onPress={() => setChecked((prev) => ({ ...prev, [material.id]: !prev[material.id] }))}
                  style={[styles.checkbox, selected && styles.checkboxChecked]}
                >
                  {selected ? <MaterialCommunityIcons color={theme.colors.onPrimary} name="check" size={14} /> : null}
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!isLinked || !material.linkedEntrySlug) {
                      return;
                    }

                    trackEvent("material_link_clicked", {
                      user_id: "local-user",
                      tab_name: "grimoire",
                      entity_id: material.id,
                      source: detail.ritual.id,
                    });
                    router.push(`/library/${material.linkedEntrySlug}`);
                  }}
                  style={styles.materialLabelWrap}
                >
                  <Text style={[styles.ingredientText, selected && styles.ingredientTextSelected]}>{material.name}</Text>
                  {material.quantityLabel ? <Text style={styles.quantityText}>{material.quantityLabel}</Text> : null}
                  {isLinked ? (
                    <View style={styles.linkHintWrap}>
                      <MaterialCommunityIcons color={theme.colors.primary} name="open-in-new" size={12} />
                      <Text style={styles.linkHintText}>Library</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
          <Text style={styles.countLabel}>
            {t("ritual.preparedCount", { checked: checkedCount, total: detail.materials.length })}
          </Text>
        </View>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>{t("ritual.theRitual")}</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.stepsWrap}>
          {detail.steps.slice(0, showPremiumGate ? 2 : detail.steps.length).map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepMarker}>
                <Text style={styles.stepMarkerText}>{roman[index] ?? `${step.stepOrder}`}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepContent}>{step.content}</Text>
              </View>
              {index !== (showPremiumGate ? 1 : detail.steps.length - 1) ? <View style={styles.stepDivider} /> : null}
            </View>
          ))}

          {showPremiumGate && (
            <View style={styles.premiumGateWrap}>
              <View style={styles.premiumGateBlur} />
              <View style={styles.premiumGateContent}>
                <MaterialCommunityIcons color={theme.colors.primary} name="lock" size={32} />
                <Text style={styles.premiumGateTitle}>{t("ritual.premiumContent" as string)}</Text>
                <Text style={styles.premiumGateSubtitle}>{t("ritual.premiumContentHint" as string)}</Text>
                <Button
                  mode="contained"
                  onPress={() => showUpgradePrompt("ritual_premium")}
                  style={styles.premiumGateButton}
                  textColor={theme.colors.onPrimary}
                  icon="star-four-points"
                >
                  {t("ritual.unlockWithPremium" as string)}
                </Button>
              </View>
            </View>
          )}
        </View>

        <IncantationBlock text={detail.ritual.incantation} />

        <Text style={styles.quote}>{detail.ritual.safetyNote}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        {showPremiumGate ? (
          <Button
            contentStyle={styles.beginButtonContent}
            icon="star-four-points"
            mode="contained"
            onPress={() => showUpgradePrompt("ritual_premium")}
            style={styles.beginButton}
            textColor={theme.colors.onPrimary}
          >
            {t("ritual.unlockWithPremium" as string)}
          </Button>
        ) : (
          <Button
            contentStyle={styles.beginButtonContent}
            icon="play-circle-outline"
            mode="contained"
            onPress={() => {
              trackEvent("ritual_mode_started", {
                user_id: LOCAL_USER_ID,
                tab_name: "grimoire",
                entity_id: detail.ritual.id,
                source: "ritual_detail",
              });
              router.push({ pathname: "/ritual/active", params: { slug: normalizedSlug } });
            }}
            style={styles.beginButton}
            textColor={theme.colors.onPrimary}
          >
            {t("ritual.beginRitualMode")}
          </Button>
        )}
      </View>

    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundElevated,
    },
    texture: {
      position: "absolute",
      top: -140,
      right: -120,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: `${theme.colors.primary}12`,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      backgroundColor: `${theme.colors.backgroundElevated}D9`,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.04)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingBottom: 120,
    },
    hero: {
      height: 262,
      justifyContent: "flex-end",
      padding: 20,
    },
    heroImage: {
      resizeMode: "cover",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(13,10,6,0.45)",
    },
    heroTag: {
      color: `${theme.colors.primary}E0`,
      textTransform: "uppercase",
      letterSpacing: 2,
      fontSize: 12,
      marginBottom: 6,
    },
    heroTitle: {
      color: theme.colors.primary,
      fontFamily: typefaces.display,
      fontSize: 44,
      lineHeight: 50,
      fontStyle: "italic",
      fontWeight: "700",
    },
    description: {
      marginTop: 16,
      color: theme.colors.onSurfaceMuted,
      fontSize: 18,
      lineHeight: 28,
      textAlign: "center",
      paddingHorizontal: 22,
    },
    metadataWrap: {
      marginTop: 10,
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    metadataBadge: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      minWidth: 65,
      alignItems: "center",
    },
    metadataText: {
      color: theme.colors.primary,
      textTransform: "capitalize",
      fontSize: 11,
    },
    sectionTitleWrap: {
      marginTop: 26,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: `${theme.colors.primary}57`,
    },
    sectionTitle: {
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 20,
      fontWeight: "700",
    },
    ingredientsCard: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      backgroundColor: `${theme.colors.surface2}B3`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}29`,
      padding: 16,
      gap: 12,
    },
    ingredientRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    materialLabelWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}85`,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    ingredientText: {
      color: theme.colors.onSurface,
      fontSize: 17,
    },
    ingredientTextSelected: {
      color: theme.colors.primary,
    },
    quantityText: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
    },
    linkHintWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    linkHintText: {
      color: theme.colors.primary,
      fontSize: 11,
    },
    countLabel: {
      marginTop: 2,
      color: `${theme.colors.primary}B8`,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 11,
      fontWeight: "600",
    },
    stepsWrap: {
      marginTop: 8,
      paddingHorizontal: 20,
      gap: 16,
    },
    stepRow: {
      paddingLeft: 10,
    },
    stepMarker: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.backgroundElevated,
      marginBottom: 8,
    },
    stepMarkerText: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 10,
    },
    stepBody: {
      borderLeftWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      marginLeft: 11,
      paddingLeft: 14,
    },
    stepTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontStyle: "italic",
      fontSize: 30,
      fontWeight: "700",
      lineHeight: 34,
    },
    stepContent: {
      marginTop: 6,
      color: theme.colors.onSurfaceMuted,
      fontSize: 17,
      lineHeight: 27,
    },
    stepDivider: {
      marginTop: 16,
      marginBottom: 2,
      height: 1,
      backgroundColor: `${theme.colors.primary}40`,
      marginLeft: 25,
    },
    quote: {
      marginTop: 16,
      marginBottom: 18,
      textAlign: "center",
      color: `${theme.colors.primary}B3`,
      fontStyle: "italic",
      fontSize: 14,
      marginHorizontal: 20,
      lineHeight: 21,
    },
    bottomBar: {
      position: "absolute",
      bottom: 16,
      left: 20,
      right: 20,
    },
    beginButton: {
      borderRadius: 999,
      backgroundColor: theme.colors.primaryBright,
    },
    beginButtonContent: {
      height: 54,
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
      fontSize: 28,
      textAlign: "center",
    },
    premiumGateWrap: {
      marginTop: 20,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
    },
    premiumGateBlur: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: `${theme.colors.backgroundElevated}F2`,
    },
    premiumGateContent: {
      alignItems: "center",
      padding: 24,
      gap: 8,
    },
    premiumGateTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 8,
    },
    premiumGateSubtitle: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 8,
    },
    premiumGateButton: {
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },
  });
