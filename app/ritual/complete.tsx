import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { createJournalEntry } from "@/db/repositories/my-space-repository";
import { getRitualDetailBySlug } from "@/db/repositories/ritual-repository";
import { useToast } from "@/context/toast-context";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const LOCAL_USER_ID = "local-user";

export default function RitualCompleteScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const styles = makeStyles(theme);

  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const normalizedSlug = slug ?? "full-moon-release";
  const detail = useMemo(() => getRitualDetailBySlug(normalizedSlug), [normalizedSlug]);

  // ---- Star twinkling animation ----
  const twinkle1 = useRef(new Animated.Value(0.3)).current;
  const twinkle2 = useRef(new Animated.Value(0.6)).current;
  const twinkle3 = useRef(new Animated.Value(0.4)).current;
  const sigilGlow = useRef(new Animated.Value(0.3)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(scaleIn, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    // Twinkling stars
    const createTwinkle = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: duration * 0.8, useNativeDriver: true }),
        ]),
      );

    const t1 = createTwinkle(twinkle1, 2000);
    const t2 = createTwinkle(twinkle2, 1500);
    const t3 = createTwinkle(twinkle3, 2500);
    t1.start();
    t2.start();
    t3.start();

    // Sigil glow
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(sigilGlow, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(sigilGlow, { toValue: 0.2, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    glow.start();

    return () => {
      t1.stop();
      t2.stop();
      t3.stop();
      glow.stop();
    };
  }, [fadeIn, scaleIn, twinkle1, twinkle2, twinkle3, sigilGlow]);

  useEffect(() => {
    if (!detail) return;
    trackEvent("ritual_mode_completed", {
      user_id: LOCAL_USER_ID,
      entity_id: detail.ritual.id,
      source: "ritual_complete",
    });
  }, [detail]);

  const handleBlessedBe = useCallback(() => {
    // Navigate back to the ritual detail or home
    if (router.canDismiss()) {
      router.dismissAll();
    } else {
      router.replace("/");
    }
  }, [router]);

  const handleSaveToJournal = useCallback(() => {
    if (!detail) return;

    const title = `${detail.ritual.title} - ${t("ritual.ritualComplete")}`;
    const content = detail.steps.map((step, i) => `${i + 1}. ${step.title}: ${step.content}`).join("\n\n");

    createJournalEntry(LOCAL_USER_ID, title, content);

    trackEvent("ritual_journal_saved", {
      user_id: LOCAL_USER_ID,
      entity_id: detail.ritual.id,
      source: "ritual_complete",
    });

    showToast(t("ritual.journalSaved"), "success");
  }, [detail, t, showToast]);

  return (
    <View style={styles.container}>
      {/* Celestial layered background */}
      <View pointerEvents="none" style={styles.bgBase} />
      <View pointerEvents="none" style={styles.bgCenterGlow} />

      {/* Star particles */}
      <Animated.View pointerEvents="none" style={[styles.star, styles.star1, { opacity: twinkle1 }]} />
      <Animated.View pointerEvents="none" style={[styles.star, styles.star2, { opacity: twinkle2 }]} />
      <Animated.View pointerEvents="none" style={[styles.star, styles.star3, { opacity: twinkle3 }]} />
      <Animated.View pointerEvents="none" style={[styles.starGold, styles.star4, { opacity: twinkle2 }]} />
      <Animated.View pointerEvents="none" style={[styles.star, styles.star5, { opacity: twinkle1 }]} />
      <Animated.View pointerEvents="none" style={[styles.starGold, styles.star6, { opacity: twinkle3 }]} />
      <Animated.View pointerEvents="none" style={[styles.star, styles.star7, { opacity: twinkle2 }]} />
      <Animated.View pointerEvents="none" style={[styles.star, styles.star8, { opacity: twinkle1 }]} />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBlessedBe} style={styles.headerButton}>
            <MaterialCommunityIcons color="rgba(255,255,255,0.5)" name="close" size={24} />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <MaterialCommunityIcons color="rgba(255,255,255,0.5)" name="dots-horizontal" size={24} />
          </Pressable>
        </View>

        {/* Center Content */}
        <Animated.View style={[styles.centerContent, { opacity: fadeIn, transform: [{ scale: scaleIn }] }]}>
          {/* Sigil */}
          <View style={styles.sigilWrap}>
            <Animated.View style={[styles.sigilGlow, { opacity: sigilGlow }]} />
            <View style={styles.sigilCircle}>
              <MaterialCommunityIcons color={theme.colors.primary} name="auto-fix" size={80} />
            </View>
          </View>

          {/* Title */}
          <View style={styles.textWrap}>
            <Text style={styles.completeTitle}>{t("ritual.ritualComplete")}</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.completeQuote}>{`"${t("ritual.ritualCompleteQuote")}"`}</Text>
          </View>
        </Animated.View>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          <Pressable onPress={handleBlessedBe} style={styles.blessedButton}>
            <MaterialCommunityIcons color={theme.colors.onPrimary} name="seal-variant" size={20} />
            <Text style={styles.blessedButtonText}>{t("ritual.blessedBe").toUpperCase()}</Text>
          </Pressable>

          <Pressable onPress={handleSaveToJournal} style={styles.journalButton}>
            <MaterialCommunityIcons color="rgba(255,255,255,0.7)" name="book-outline" size={20} />
            <Text style={styles.journalButtonText}>{t("ritual.saveToJournal")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0F0816",
    },
    bgBase: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#1A1025",
    },
    bgCenterGlow: {
      position: "absolute",
      top: "30%",
      left: "10%",
      width: "80%",
      height: "40%",
      borderRadius: 200,
      backgroundColor: "#2D1B3E",
      opacity: 0.6,
    },
    safe: {
      flex: 1,
    },

    // Stars
    star: {
      position: "absolute",
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: "#FFFFFF",
    },
    starGold: {
      position: "absolute",
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: theme.colors.primary,
    },
    star1: { top: "8%", left: "12%" },
    star2: { top: "15%", right: "18%" },
    star3: { top: "25%", left: "30%" },
    star4: { top: "12%", left: "55%" },
    star5: { top: "35%", right: "10%" },
    star6: { top: "70%", left: "8%" },
    star7: { top: "80%", right: "25%" },
    star8: { top: "60%", left: "45%" },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },

    // Center
    centerContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      marginTop: -40,
    },

    // Sigil
    sigilWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    sigilGlow: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: `${theme.colors.primary}33`,
    },
    sigilCircle: {
      width: 176,
      height: 176,
      borderRadius: 88,
      backgroundColor: "rgba(45, 27, 62, 0.8)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },

    // Text
    textWrap: {
      alignItems: "center",
      gap: 12,
      maxWidth: 300,
    },
    completeTitle: {
      fontFamily: typefaces.display,
      fontWeight: "700",
      fontSize: 38,
      color: theme.colors.primary,
      textAlign: "center",
    },
    dividerLine: {
      width: 48,
      height: 1,
      backgroundColor: `${theme.colors.primary}80`,
    },
    completeQuote: {
      color: "rgba(255,255,255,0.75)",
      fontSize: 18,
      fontStyle: "italic",
      lineHeight: 28,
      textAlign: "center",
      letterSpacing: 0.3,
    },

    // Footer
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 12,
    },
    blessedButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
    blessedButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: "700",
      fontSize: 17,
      letterSpacing: 1.5,
    },
    journalButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    journalButtonText: {
      color: "rgba(255,255,255,0.9)",
      fontWeight: "600",
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });
