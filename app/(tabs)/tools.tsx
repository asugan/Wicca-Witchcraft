import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, InteractionManager, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import type { SpreadType } from "@/config/premium";
import { getMoonData } from "@/db/repositories/tools-repository";
import {
  drawSpread,
  drawThreeCardSpread,
  getAvailableSpreads,
  isSpreadPremium,
  type TarotReadingResult,
} from "@/db/repositories/tarot-repository";
import { usePremiumGate } from "@/hooks/use-premium-gate";
import { trackEvent } from "@/lib/analytics";
import { toLocalIsoDate } from "@/lib/date-utils";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const cardSymbols: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
  "infinity",
  "white-balance-sunny",
  "auto-fix",
];

function useFloating(delay: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const start = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: -9, duration: 1900, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 1900, useNativeDriver: true }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(start);
  }, [delay, value]);

  return value;
}

const SPREAD_LABELS: Record<SpreadType, string> = {
  daily: "tools.spreadDaily",
  three_card: "tools.tarotSpread",
  celtic_cross: "tools.spreadCelticCross",
  relationship: "tools.spreadRelationship",
  career: "tools.spreadCareer",
};

export default function ToolsScreen() {
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);
  const { isPremium, requirePremium } = usePremiumGate();

  const [selectedSpread, setSelectedSpread] = useState<SpreadType>("three_card");
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [currentReading, setCurrentReading] = useState<TarotReadingResult | null>(null);
  const [moonData, setMoonData] = useState<ReturnType<typeof getMoonData> | null>(null);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setMoonData(getMoonData());
    });
    return () => task.cancel();
  }, []);

  const availableSpreads = useMemo(() => getAvailableSpreads(), []);

  const handleSelectSpread = useCallback(
    (spreadType: SpreadType) => {
      if (isSpreadPremium(spreadType) && !isPremium) {
        const featureKey = `tarot_${spreadType}` as const;
        requirePremium(featureKey as "tarot_celtic_cross" | "tarot_relationship" | "tarot_career");
        return;
      }
      setSelectedSpread(spreadType);
    },
    [isPremium, requirePremium]
  );

  const handleDrawSpread = useCallback(() => {
    if (isSpreadPremium(selectedSpread) && !isPremium) {
      const featureKey = `tarot_${selectedSpread}` as const;
      requirePremium(featureKey as "tarot_celtic_cross" | "tarot_relationship" | "tarot_career");
      return;
    }

    const reading = selectedSpread === "three_card"
      ? drawThreeCardSpread("local-user")
      : drawSpread("local-user", selectedSpread);
    setCurrentReading(reading);
    setRevealed(new Array(reading.cards.length).fill(false));
    trackEvent("tarot_spread_drawn", {
      user_id: "local-user",
      tab_name: "tools",
      entity_id: reading.id,
      source: selectedSpread,
    });
  }, [selectedSpread, isPremium, requirePremium]);

  const handleReset = useCallback(() => {
    setCurrentReading(null);
    setRevealed([]);
  }, []);

  const floatOne = useFloating(0);
  const floatTwo = useFloating(320);
  const floatThree = useFloating(620);

  const allRevealed = useMemo(() => revealed.every(Boolean), [revealed]);
  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);

  const visibleTimeline = useMemo(() => {
    if (!moonData) return null;
    const upcoming = moonData.timeline.filter((entry) => entry.rawDate >= todayIso);
    return upcoming.length ? upcoming.slice(0, 8) : moonData.timeline.slice(0, 8);
  }, [moonData, todayIso]);

  const toggleOne = (index: number) => {
    setRevealed((prev) => prev.map((item, cardIndex) => (cardIndex === index ? !item : item)));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.bgGradient} />
      <View style={styles.starOne} />
      <View style={styles.starTwo} />
      <View style={styles.starThree} />
      <View style={styles.starFour} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerOverline}>{t("tools.overline")}</Text>
          <Text style={styles.headerTitle}>{t("tools.title")}</Text>
          <Text style={styles.headerSubtext}>{t("tools.subtitle")}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t(SPREAD_LABELS[selectedSpread] as string)}</Text>
            <MaterialCommunityIcons color={theme.colors.primary} name="cards-playing" size={18} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spreadChipsRow}>
            {availableSpreads.map((spread) => {
              const isSelected = selectedSpread === spread.type;
              const isLocked = spread.isPremium && !isPremium;

              return (
                <Pressable
                  key={spread.type}
                  onPress={() => handleSelectSpread(spread.type)}
                  style={[styles.spreadChip, isSelected && styles.spreadChipSelected]}
                >
                  {isLocked && (
                    <MaterialCommunityIcons
                      color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
                      name="lock"
                      size={12}
                    />
                  )}
                  <Text style={[styles.spreadChipText, isSelected && styles.spreadChipTextSelected]}>
                    {t(SPREAD_LABELS[spread.type] as string)}
                  </Text>
                  <Text style={[styles.spreadChipCount, isSelected && styles.spreadChipCountSelected]}>
                    {spread.cardCount}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!currentReading ? (
            <>
              <Text style={styles.promptText}>{t("tools.tarotPrompt")}</Text>
              <View style={styles.cardsRow}>
                {[floatOne, floatTwo, floatThree].map((floating, index) => (
                  <Animated.View key={cardSymbols[index]} style={[styles.cardAnimatedWrap, { transform: [{ translateY: floating }] }]}>
                    <Pressable onPress={handleDrawSpread} style={styles.cardBack}>
                      <View style={styles.cardInnerBorder} />
                      <MaterialCommunityIcons
                        color={`${theme.colors.primary}B5`}
                        name={cardSymbols[index]}
                        size={36}
                      />
                      <Text style={styles.cardLabel}>{index === 0 ? t("tools.cardPast") : index === 1 ? t("tools.cardPresent") : t("tools.cardFuture")}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
              <Button
                mode="outlined"
                onPress={handleDrawSpread}
                style={styles.secondaryButton}
                textColor={theme.colors.primary}
              >
                {t("tools.drawCards")}
              </Button>
            </>
          ) : (
            <>
              <View style={styles.cardsRow}>
                {currentReading.cards.map((card, index) => {
                  const floating = [floatOne, floatTwo, floatThree][index];
                  const isRevealed = revealed[index];
                  const positionLabel = index === 0 ? t("tools.cardPast") : index === 1 ? t("tools.cardPresent") : t("tools.cardFuture");

                  return (
                    <Animated.View key={card.id} style={[styles.cardAnimatedWrap, { transform: [{ translateY: floating }] }]}>
                      <Pressable onPress={() => toggleOne(index)} style={[styles.cardBack, isRevealed && styles.cardRevealed]}>
                        <View style={styles.cardInnerBorder} />
                        {isRevealed ? (
                          <>
                            <Text style={styles.revealedCardName}>{card.name}</Text>
                            {card.isReversed ? <Text style={styles.reversedBadge}>{t("tools.reversed")}</Text> : null}
                          </>
                        ) : (
                          <MaterialCommunityIcons
                            color={`${theme.colors.primary}B5`}
                            name={cardSymbols[index]}
                            size={36}
                          />
                        )}
                        <Text style={styles.cardLabel}>{positionLabel}</Text>
                        {isRevealed ? <Text style={styles.revealedText}>{t("tools.cardRevealed")}</Text> : null}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {allRevealed ? (
                <View style={styles.readingDetails}>
                  {currentReading.cards.map((card, index) => {
                    const positionLabel = index === 0 ? t("tools.cardPast") : index === 1 ? t("tools.cardPresent") : t("tools.cardFuture");
                    return (
                      <View key={card.id} style={styles.readingCardDetail}>
                        <View style={styles.readingCardHeader}>
                          <Text style={styles.readingPosition}>{positionLabel}</Text>
                          <Text style={styles.readingCardName}>
                            {card.name}{card.isReversed ? ` (${t("tools.reversed")})` : ""}
                          </Text>
                        </View>
                        <Text style={styles.readingMeaning}>
                          {card.isReversed ? card.reversedMeaning : card.uprightMeaning}
                        </Text>
                        <View style={styles.readingKeywords}>
                          {card.keywords.split(", ").map((kw) => (
                            <View key={kw} style={styles.readingKeywordChip}>
                              <Text style={styles.readingKeywordText}>{kw}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.promptText}>{t("tools.tapToReveal")}</Text>
              )}

              <View style={styles.buttonColumn}>
                <View style={styles.buttonPrimaryRow}>
                  <Button
                    mode="outlined"
                    onPress={() => setRevealed([true, true, true])}
                    style={[styles.secondaryButton, styles.buttonFlex, allRevealed && styles.secondaryButtonDone]}
                    textColor={theme.colors.primary}
                  >
                    {allRevealed ? t("tools.allRevealed") : t("tools.revealAll")}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleDrawSpread}
                    style={[styles.secondaryButton, styles.buttonFlex]}
                    textColor={theme.colors.primary}
                  >
                    {t("tools.newReading")}
                  </Button>
                </View>
                <Button mode="text" onPress={handleReset} textColor={theme.colors.onSurfaceMuted}>
                  {t("tools.reset")}
                </Button>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("tools.moonCalendar")}</Text>
            <MaterialCommunityIcons color={theme.colors.primary} name="moon-waning-gibbous" size={18} />
          </View>

          {!moonData ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.sectionLoader} />
          ) : moonData.sections.map((section) => (
            <View key={section.key} style={styles.monthBlock}>
              <Text style={styles.monthLabel}>{section.label}</Text>
              {section.events.map((event) => (
                <View key={event.id} style={styles.calendarEventRow}>
                  <View style={styles.calendarDateBadge}>
                    <Text style={styles.calendarDay}>{new Date(`${event.eventDate}T00:00:00`).getDate()}</Text>
                  </View>
                  <View style={styles.calendarEventBody}>
                    <Text style={styles.calendarEventTitle}>{event.phase}</Text>
                    <Text style={styles.calendarEventMeta}>{event.zodiacSign}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("tools.astroTimeline")}</Text>
            <MaterialCommunityIcons color={theme.colors.primary} name="timeline-clock-outline" size={18} />
          </View>

          {!visibleTimeline ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.sectionLoader} />
          ) : visibleTimeline.map((entry) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  entry.kind === "peak"
                    ? styles.timelineDotPeak
                    : entry.kind === "preparation"
                      ? styles.timelineDotPrep
                      : styles.timelineDotIntegration,
                ]}
              />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineDate}>{entry.dateLabel}</Text>
                <Text style={styles.timelineTitle}>{entry.title}</Text>
                <Text style={styles.timelineSummary}>{entry.summary}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.mysticPurple,
    },
    bgGradient: {
      position: "absolute",
      top: -180,
      left: -120,
      width: 540,
      height: 540,
      borderRadius: 270,
      backgroundColor: `${theme.colors.mysticPurpleSoft}E6`,
    },
    starOne: {
      position: "absolute",
      top: 80,
      left: 36,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: `${theme.colors.primary}CC`,
    },
    starTwo: {
      position: "absolute",
      top: 160,
      right: 64,
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: `${theme.colors.primary}99`,
    },
    starThree: {
      position: "absolute",
      bottom: 260,
      left: 54,
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: "rgba(255,255,255,0.5)",
    },
    starFour: {
      position: "absolute",
      bottom: 200,
      right: 38,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: `${theme.colors.primary}66`,
    },
    header: {
      marginTop: 8,
      gap: 4,
    },
    headerOverline: {
      color: `${theme.colors.primary}D9`,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "700",
    },
    headerTitle: {
      color: theme.mode === "light" ? "#F5EFE2" : theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
    },
    headerSubtext: {
      color: theme.mode === "light" ? "#DFD6C3" : "#CFC6B0",
      lineHeight: 20,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 120,
      gap: 14,
    },
    sectionCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
      backgroundColor: `${theme.colors.surface1}D9`,
      padding: 14,
      gap: 12,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 19,
      fontWeight: "700",
    },
    cardsRow: {
      width: "100%",
      flexDirection: "row",
      gap: 8,
    },
    cardAnimatedWrap: {
      flex: 1,
    },
    cardBack: {
      borderRadius: 12,
      backgroundColor: "#171717",
      borderWidth: 1,
      borderColor: `${theme.colors.primary}73`,
      height: 176,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    cardInnerBorder: {
      position: "absolute",
      inset: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
    },
    cardLabel: {
      color: `${theme.colors.onSurfaceMuted}D9`,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    revealedText: {
      color: theme.colors.primary,
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "700",
    },
    promptText: {
      color: `${theme.colors.primary}E5`,
      fontFamily: typefaces.display,
      fontSize: 18,
      fontStyle: "italic",
      lineHeight: 26,
      textAlign: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    buttonColumn: {
      gap: 8,
      alignItems: "center",
    },
    buttonPrimaryRow: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
    buttonFlex: {
      flex: 1,
    },
    secondaryButton: {
      borderColor: `${theme.colors.primary}59`,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}1A`,
    },
    secondaryButtonDone: {
      backgroundColor: `${theme.colors.primary}2E`,
    },
    monthBlock: {
      gap: 8,
      marginBottom: 4,
    },
    monthLabel: {
      color: theme.colors.primary,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "700",
    },
    calendarEventRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}26`,
      backgroundColor: `${theme.colors.surface2}8C`,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    calendarDateBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${theme.colors.primary}66`,
      backgroundColor: `${theme.colors.primary}2B`,
    },
    calendarDay: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 14,
    },
    calendarEventBody: {
      flex: 1,
    },
    calendarEventTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "700",
    },
    calendarEventMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      marginTop: 2,
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 6,
    },
    timelineDotPrep: {
      backgroundColor: theme.colors.info,
    },
    timelineDotPeak: {
      backgroundColor: theme.colors.primary,
    },
    timelineDotIntegration: {
      backgroundColor: theme.colors.success,
    },
    timelineBody: {
      flex: 1,
      borderLeftWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      paddingLeft: 10,
      paddingBottom: 10,
    },
    timelineDate: {
      color: theme.colors.primary,
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 0.9,
      fontWeight: "700",
      marginBottom: 2,
    },
    timelineTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 2,
    },
    timelineSummary: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    cardRevealed: {
      backgroundColor: `${theme.colors.primary}1A`,
      borderColor: theme.colors.primary,
    },
    revealedCardName: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
      paddingHorizontal: 4,
    },
    reversedBadge: {
      color: theme.colors.danger ?? "#E57373",
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: "700",
    },
    readingDetails: {
      gap: 12,
    },
    readingCardDetail: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: `${theme.colors.surface2}8C`,
      padding: 12,
      gap: 8,
    },
    readingCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    readingPosition: {
      color: theme.colors.primary,
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "700",
    },
    readingCardName: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 15,
      fontWeight: "700",
    },
    readingMeaning: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 13,
      lineHeight: 20,
      fontStyle: "italic",
    },
    readingKeywords: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    readingKeywordChip: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
      backgroundColor: `${theme.colors.primary}14`,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    readingKeywordText: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    spreadChipsRow: {
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
    },
    spreadChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: `${theme.colors.primary}14`,
    },
    spreadChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    spreadChipText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    spreadChipTextSelected: {
      color: theme.colors.onPrimary,
    },
    spreadChipCount: {
      color: `${theme.colors.primary}99`,
      fontSize: 10,
      fontWeight: "700",
    },
    spreadChipCountSelected: {
      color: `${theme.colors.onPrimary}CC`,
    },
    sectionLoader: {
      paddingVertical: 24,
    },
  });
