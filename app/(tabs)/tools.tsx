import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { listAstroTimeline, listMoonCalendarSections } from "@/db/repositories/tools-repository";
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

export default function ToolsScreen() {
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);

  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const moonCalendarSections = useMemo(() => listMoonCalendarSections(), []);
  const astroTimeline = useMemo(() => listAstroTimeline(), []);

  const floatOne = useFloating(0);
  const floatTwo = useFloating(320);
  const floatThree = useFloating(620);

  const allRevealed = useMemo(() => revealed.every(Boolean), [revealed]);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const visibleTimeline = useMemo(() => {
    const upcoming = astroTimeline.filter((entry) => entry.rawDate >= todayIso);

    if (upcoming.length) {
      return upcoming.slice(0, 8);
    }

    return astroTimeline.slice(0, 8);
  }, [astroTimeline, todayIso]);

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
            <Text style={styles.sectionTitle}>{t("tools.tarotSpread")}</Text>
            <MaterialCommunityIcons color={theme.colors.primary} name="cards-playing" size={18} />
          </View>

          <View style={styles.cardsRow}>
            {[floatOne, floatTwo, floatThree].map((floating, index) => (
              <Animated.View key={cardSymbols[index]} style={[styles.cardAnimatedWrap, { transform: [{ translateY: floating }] }]}> 
                <Pressable onPress={() => toggleOne(index)} style={styles.cardBack}>
                  <View style={styles.cardInnerBorder} />
                  <MaterialCommunityIcons
                    color={`${theme.colors.primary}B5`}
                    name={revealed[index] ? "cards-playing-heart-multiple" : cardSymbols[index]}
                    size={36}
                  />
                  <Text style={styles.cardLabel}>{index === 0 ? t("tools.cardPast") : index === 1 ? t("tools.cardPresent") : t("tools.cardFuture")}</Text>
                  {revealed[index] ? <Text style={styles.revealedText}>{t("tools.cardRevealed")}</Text> : null}
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.promptText}>{t("tools.tarotPrompt")}</Text>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => setRevealed([true, true, true])}
              style={[styles.secondaryButton, allRevealed && styles.secondaryButtonDone]}
              textColor={theme.colors.primary}
            >
              {allRevealed ? t("tools.allRevealed") : t("tools.revealAll")}
            </Button>
            <Button mode="text" onPress={() => setRevealed([false, false, false])} textColor={theme.colors.onSurfaceMuted}>
              {t("tools.reset")}
            </Button>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("tools.moonCalendar")}</Text>
            <MaterialCommunityIcons color={theme.colors.primary} name="moon-waning-gibbous" size={18} />
          </View>

          {moonCalendarSections.map((section) => (
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

          {visibleTimeline.map((entry) => (
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
  });
