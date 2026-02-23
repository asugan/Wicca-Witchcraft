import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { getRitualDetailBySlug } from "@/db/repositories/ritual-repository";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export default function ActiveRitualScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);

  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const normalizedSlug = slug ?? "full-moon-release";

  const detail = useMemo(() => getRitualDetailBySlug(normalizedSlug), [normalizedSlug]);
  const steps = detail?.steps ?? [];
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);

  // ---- Candle flicker animation ----
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.85, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.92, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    flicker.start();
    return () => flicker.stop();
  }, [flickerAnim]);

  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.35, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [glowAnim]);

  // ---- Analytics ----
  useEffect(() => {
    if (!detail) return;
    trackEvent("ritual_mode_started", {
      user_id: "local-user",
      entity_id: detail.ritual.id,
      source: "active_ritual",
    });
  }, [detail]);

  const handleNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step -> navigate to complete screen
      router.replace({ pathname: "/ritual/complete", params: { slug: normalizedSlug } });
    }
  }, [currentStep, totalSteps, router, normalizedSlug]);

  const handleEndRitual = useCallback(() => {
    router.back();
  }, [router]);

  if (!detail || totalSteps === 0) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <View style={styles.centerWrap}>
          <Text style={styles.notFoundText}>{t("ritual.notFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlowTop, { opacity: glowAnim }]} />
      <Animated.View style={[styles.ambientGlowBottom, { opacity: glowAnim }]} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleEndRitual} style={styles.headerButton}>
          <MaterialCommunityIcons color={theme.colors.onSurface} name="close" size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>{detail.ritual.title.toUpperCase()}</Text>
        <Pressable style={styles.headerButton}>
          <MaterialCommunityIcons color={theme.colors.onSurface} name="information-outline" size={26} />
        </Pressable>
      </View>

      {/* Constellation Progress Tracker */}
      <View style={styles.progressWrap}>
        <View style={styles.progressLine} />
        {steps.map((_, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <View key={index} style={styles.progressDotWrap}>
              {isActive && <View style={styles.progressDotPing} />}
              <View
                style={[
                  styles.progressDot,
                  isDone && styles.progressDotDone,
                  isActive && styles.progressDotActive,
                  isPending && styles.progressDotPending,
                ]}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.stepLabel}>{t("ritual.activeStepLabel", { current: currentStep + 1 })}</Text>

      {/* Main Content */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Candle */}
        <View style={styles.candleWrap}>
          {/* Flame aura */}
          <Animated.View style={[styles.flameAura, { opacity: flickerAnim }]} />
          {/* Flame */}
          <Animated.View style={[styles.flame, { opacity: flickerAnim, transform: [{ scaleY: flickerAnim }] }]} />
          <Animated.View style={[styles.flameInner, { opacity: flickerAnim }]} />
          {/* Candle body */}
          <View style={styles.candleBody}>
            <View style={styles.wickLine} />
            <View style={styles.waxDripLeft} />
            <View style={styles.waxDripRight} />
          </View>
          {/* Candle shadow */}
          <View style={styles.candleShadow} />
        </View>

        {/* Instruction Text */}
        <View style={styles.instructionWrap}>
          <Text style={styles.instructionTitle}>{step.title}</Text>
          <Text style={styles.instructionContent}>{step.content}</Text>
        </View>

        {/* Take your time badge */}
        <View style={styles.timeBadge}>
          <MaterialCommunityIcons color={`${theme.colors.primary}CC`} name="timer-sand" size={18} />
          <Text style={styles.timeBadgeText}>{t("ritual.takeYourTime")}</Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Pressable onPress={handleNextStep} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>{isLastStep ? t("ritual.ritualComplete") : t("ritual.nextStep")}</Text>
          <MaterialCommunityIcons color={theme.colors.onPrimary} name="arrow-right" size={22} />
        </Pressable>
        <Pressable onPress={handleEndRitual} style={styles.endButton}>
          <Text style={styles.endButtonText}>{t("ritual.endRitual")}</Text>
        </Pressable>
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
    centerWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    notFoundText: {
      color: theme.colors.onSurface,
      fontSize: 18,
    },

    // Ambient glow
    ambientGlowTop: {
      position: "absolute",
      top: -60,
      left: -40,
      width: "100%",
      height: 280,
      borderRadius: 200,
      backgroundColor: `${theme.colors.primary}18`,
    },
    ambientGlowBottom: {
      position: "absolute",
      bottom: -40,
      right: -60,
      width: "66%",
      height: 200,
      borderRadius: 150,
      backgroundColor: `${theme.colors.primary}0D`,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      zIndex: 10,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: theme.colors.primary,
      fontWeight: "700",
      letterSpacing: 3,
      fontSize: 11,
      textTransform: "uppercase",
    },

    // Progress tracker
    progressWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 48,
      paddingTop: 12,
      zIndex: 10,
    },
    progressLine: {
      position: "absolute",
      top: "50%",
      left: 48,
      right: 48,
      height: 1,
      backgroundColor: `${theme.colors.primary}80`,
    },
    progressDotWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    progressDot: {
      borderRadius: 999,
    },
    progressDotDone: {
      width: 12,
      height: 12,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 6,
      elevation: 4,
    },
    progressDotActive: {
      width: 22,
      height: 22,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 6,
    },
    progressDotPending: {
      width: 8,
      height: 8,
      backgroundColor: `${theme.colors.onSurfaceMuted}50`,
    },
    progressDotPing: {
      position: "absolute",
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
    },
    stepLabel: {
      textAlign: "center",
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginTop: 8,
      zIndex: 10,
    },

    // Main content
    mainScroll: {
      flex: 1,
      zIndex: 10,
    },
    mainContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
    },

    // Candle
    candleWrap: {
      alignItems: "center",
      marginBottom: 32,
      width: 160,
      height: 200,
    },
    flameAura: {
      position: "absolute",
      top: 0,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: `${theme.colors.primary}33`,
    },
    flame: {
      width: 36,
      height: 60,
      backgroundColor: theme.colors.primary,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 20,
      elevation: 8,
      marginTop: 30,
      zIndex: 20,
    },
    flameInner: {
      position: "absolute",
      top: 42,
      width: 20,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.8)",
      zIndex: 30,
    },
    candleBody: {
      width: 72,
      height: 90,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      backgroundColor: theme.mode === "dark" ? "#2a261a" : "#e6dcc3",
      marginTop: -4,
      zIndex: 10,
      overflow: "hidden",
    },
    wickLine: {
      position: "absolute",
      top: -8,
      left: "50%",
      marginLeft: -1,
      width: 2,
      height: 10,
      backgroundColor: "rgba(0,0,0,0.8)",
    },
    waxDripLeft: {
      position: "absolute",
      top: 0,
      left: 8,
      width: 8,
      height: 32,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: theme.mode === "dark" ? "#3d3828" : "#f8f5e6",
      opacity: 0.8,
    },
    waxDripRight: {
      position: "absolute",
      top: 0,
      right: 12,
      width: 6,
      height: 22,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      backgroundColor: theme.mode === "dark" ? "#3d3828" : "#f8f5e6",
      opacity: 0.6,
    },
    candleShadow: {
      width: 100,
      height: 10,
      borderRadius: 50,
      backgroundColor: "rgba(0,0,0,0.2)",
      marginTop: 4,
    },

    // Instruction
    instructionWrap: {
      alignItems: "center",
      gap: 12,
      maxWidth: 340,
    },
    instructionTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontStyle: "italic",
      fontWeight: "700",
      fontSize: 30,
      lineHeight: 38,
      textAlign: "center",
    },
    instructionContent: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 17,
      lineHeight: 26,
      textAlign: "center",
    },

    // Time badge
    timeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}18`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
    },
    timeBadgeText: {
      color: `${theme.colors.primary}CC`,
      fontSize: 13,
      fontWeight: "500",
      letterSpacing: 0.5,
    },

    // Footer
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 12,
      zIndex: 10,
    },
    nextButton: {
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
      shadowRadius: 12,
      elevation: 6,
    },
    nextButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: "700",
      fontSize: 19,
    },
    endButton: {
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 14,
    },
    endButtonText: {
      color: theme.colors.onSurfaceMuted,
      fontWeight: "500",
      fontSize: 15,
    },
  });
