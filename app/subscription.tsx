import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Icon, IconButton, Modal, Portal, Surface, Text } from "react-native-paper";

import { hasProAccess } from "@/db/repositories/subscription-repository";
import {
  getRevenueCatPaywallData,
  purchaseRevenueCatPlan,
  restoreRevenueCatPurchases,
  syncProEntitlementFromRevenueCat,
  type BillingCycle,
  type RevenueCatPaywallData,
} from "@/features/subscription/revenuecat";
import { useMysticTheme } from "@/theme/use-mystic-theme";
import { useToast } from "@/context/toast-context";

const proFeatureKeys = [
  "subscription.proFeatures.exclusiveRituals",
  "subscription.proFeatures.advancedTarot",
  "subscription.proFeatures.fullLibraryAccess",
  "subscription.proFeatures.unlimitedJournal",
] as const;

const freeFeatureKeys = [
  "subscription.freeFeatures.basicRituals",
  "subscription.freeFeatures.dailyTarot",
  "subscription.freeFeatures.advancedFeaturesLocked",
] as const;

const planCycleDisplayOrder: BillingCycle[] = ["yearly", "monthly", "oneTime"];

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL?.trim() ?? "";
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() ?? "";

type StatusModalType = "purchaseSuccess" | "restoreSuccess";

export default function SubscriptionScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isProActive, setIsProActive] = useState(false);
  const [isLoadingPaywall, setIsLoadingPaywall] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [paywallPlans, setPaywallPlans] = useState<RevenueCatPaywallData | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle | null>(null);
  const [statusModalType, setStatusModalType] = useState<StatusModalType | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const load = async () => {
        setIsLoadingPaywall(true);

        try {
          const [cachedProStatus, paywallData] = await Promise.all([
            Promise.resolve(hasProAccess()),
            getRevenueCatPaywallData(),
          ]);

          if (!isMounted) {
            return;
          }

          setIsProActive(cachedProStatus);
          setPaywallPlans(paywallData);

          if (paywallData.isConfigured) {
            try {
              const syncedProStatus = await syncProEntitlementFromRevenueCat();
              if (isMounted) {
                setIsProActive(syncedProStatus);
              }
            } catch {
              showToast(t("subscription.alerts.tryAgainBody"), "error");
            }
          }
        } finally {
          if (isMounted) {
            setIsLoadingPaywall(false);
          }
        }
      };

      void load();

      return () => {
        isMounted = false;
      };
    }, [t, showToast]),
  );

  const availablePlans = useMemo(
    () =>
      planCycleDisplayOrder.flatMap((cycle) => {
        const plan = paywallPlans?.plans[cycle];
        return plan ? [{ cycle, plan }] : [];
      }),
    [paywallPlans],
  );
  const hasLifetimePlan = Boolean(paywallPlans?.plans.oneTime);
  const preferredDefaultCycle = hasLifetimePlan ? "oneTime" : (availablePlans[0]?.cycle ?? null);

  useEffect(() => {
    if (availablePlans.length === 0) {
      setSelectedCycle(null);
      return;
    }

    if (selectedCycle && availablePlans.some((entry) => entry.cycle === selectedCycle)) {
      return;
    }

    setSelectedCycle(preferredDefaultCycle);
  }, [availablePlans, preferredDefaultCycle, selectedCycle]);

  const selectedPlan = useMemo(() => {
    if (selectedCycle) {
      const cyclePlan = paywallPlans?.plans[selectedCycle];
      if (cyclePlan) {
        return cyclePlan;
      }
    }

    return availablePlans[0]?.plan ?? null;
  }, [availablePlans, paywallPlans, selectedCycle]);

  const selectedPlanCycle = selectedPlan?.cycle ?? null;
  const isPurchasingAvailable = Boolean(paywallPlans?.isConfigured && selectedPlan);
  const isIOS = Platform.OS === "ios";

  const displayPrice = selectedPlan?.price ?? (isLoadingPaywall ? t("subscription.loadingPlans") : "--");
  const displayPeriodLabel =
    selectedPlan?.cycle === "yearly"
      ? t("subscription.billedYearly")
      : selectedPlan?.cycle === "monthly"
        ? t("subscription.billedMonthly")
        : selectedPlan
          ? t("subscription.oneTimePayment")
          : null;
  const proFeatures = useMemo(() => proFeatureKeys.map((key) => t(key as string)), [t]);
  const freeFeatures = useMemo(() => freeFeatureKeys.map((key) => t(key as string)), [t]);
  const subscriptionNote = isIOS
    ? t("subscription.noteIos", t("subscription.note"))
    : t("subscription.noteAndroid", t("subscription.note"));
  const trustPoints = isIOS
    ? [
        t("subscription.trust.cancelAnytimeIos", t("subscription.trust.cancelAnytime")),
        t("subscription.trust.billedByStoreIos", t("subscription.trust.billedByStore")),
        t("subscription.trust.secureCheckoutIos", t("subscription.trust.secureCheckout")),
      ]
    : [
        t("subscription.trust.cancelAnytimeAndroid", t("subscription.trust.cancelAnytime")),
        t("subscription.trust.billedByStoreAndroid", t("subscription.trust.billedByStore")),
        t("subscription.trust.secureCheckoutAndroid", t("subscription.trust.secureCheckout")),
      ];
  const closeStatusModal = useCallback(() => {
    setStatusModalType(null);
  }, []);
  const statusModalTitle =
    statusModalType === "purchaseSuccess"
      ? t("subscription.alerts.purchaseSuccessTitle")
      : statusModalType === "restoreSuccess"
        ? t("subscription.alerts.restoreSuccessTitle")
        : "";
  const statusModalBody =
    statusModalType === "purchaseSuccess"
      ? t("subscription.alerts.purchaseSuccessBody")
      : statusModalType === "restoreSuccess"
        ? t("subscription.alerts.restoreSuccessBody")
        : "";
  const statusModalIcon = statusModalType === "purchaseSuccess" ? "party-popper" : "backup-restore";

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.09,
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
        duration: 22000,
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

  useEffect(() => {
    if (!statusModalType) {
      return;
    }

    modalAnim.setValue(0);
    Animated.parallel([
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalAnim, statusModalType]);

  const modalAnimatedStyle = {
    opacity: modalAnim,
    transform: [
      {
        scale: modalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        translateY: modalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  const handleActivatePremium = async () => {
    if (isProActive || isActivating) {
      return;
    }

    try {
      setIsActivating(true);
      const purchaseOutcome = await purchaseRevenueCatPlan(selectedPlanCycle ?? undefined);

      if (purchaseOutcome.cancelled) {
        return;
      }

      if (!purchaseOutcome.isActive) {
        return;
      }

      setIsProActive(true);
      setStatusModalType("purchaseSuccess");
    } catch {
      if (!paywallPlans?.isConfigured) {
        showToast(t("subscription.alerts.purchasesUnavailableBody"), "error");
      } else {
        showToast(t("subscription.alerts.tryAgainBody"), "error");
      }
    } finally {
      setIsActivating(false);
    }
  };

  const handleRestorePurchase = async () => {
    if (isRestoring) {
      return;
    }

    try {
      setIsRestoring(true);
      const restored = await restoreRevenueCatPurchases();
      setIsProActive(restored);
      if (restored) {
        setStatusModalType("restoreSuccess");
      } else {
        Alert.alert(t("subscription.alerts.noSubscriptionTitle"), t("subscription.alerts.noSubscriptionBody"));
      }
    } catch {
      showToast(t("subscription.alerts.tryAgainBody"), "error");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOpenLegalLink = useCallback(
    async (label: "terms" | "privacy", url: string) => {
      if (!url) {
        const envKey = label === "terms" ? "EXPO_PUBLIC_TERMS_URL" : "EXPO_PUBLIC_PRIVACY_URL";
        Alert.alert(
          t(`subscription.alerts.${label}UnavailableTitle` as string),
          t("subscription.alerts.setEnvBody", { envKey }),
        );
        return;
      }

      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          Alert.alert(
            t(`subscription.alerts.${label}UnavailableTitle` as string),
            t("subscription.alerts.invalidUrlBody"),
          );
          return;
        }

        await Linking.openURL(url);
      } catch {
        showToast(t("subscription.alerts.linkOpenFailedBody"), "error");
      }
    },
    [t, showToast],
  );

  const heroSpin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={s.screen}>
        <View style={s.header}>
          <IconButton icon="close" iconColor={theme.colors.onSurfaceMuted} onPress={() => router.back()} />
          <Text variant="labelLarge" style={{ color: theme.colors.primary, letterSpacing: 1.4 }}>
            {t("subscription.header")}
          </Text>
          <View style={s.placeholder} />
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <View style={s.orbContainer}>
              {/* Yavaş dönen dashed dış halka */}
              <Animated.View
                style={[
                  s.orbOuterRing,
                  { borderColor: `${theme.colors.primary}52` },
                  { transform: [{ rotate: heroSpin }] },
                ]}
              />
              {/* Nabız atan orta halka */}
              <Animated.View
                style={[
                  s.orbPulseRing,
                  {
                    borderColor: `${theme.colors.primary}33`,
                    backgroundColor: `${theme.colors.primary}09`,
                  },
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              {/* Ana daire */}
              <Surface
                style={[
                  s.heroIconCircle,
                  {
                    borderColor: `${theme.colors.primary}9E`,
                    backgroundColor: `${theme.colors.primary}2B`,
                  },
                ]}
                elevation={0}
              >
                <View
                  style={[
                    s.heroIconInner,
                    { backgroundColor: `${theme.colors.primary}57` },
                  ]}
                >
                  <Icon source="star-four-points" size={44} color={theme.colors.primary} />
                </View>
              </Surface>
              {/* Dekoratif küçük yıldızlar — 4 yön */}
              <View style={[s.cardinalStar, { top: 4, left: 103 }]}>
                <Icon source="star-four-points" size={14} color={`${theme.colors.primary}CC`} />
              </View>
              <View style={[s.cardinalStar, { top: 105, right: 4 }]}>
                <Icon source="star-four-points" size={9} color={`${theme.colors.primary}88`} />
              </View>
              <View style={[s.cardinalStar, { bottom: 4, left: 105 }]}>
                <Icon source="star-four-points" size={11} color={`${theme.colors.primary}AA`} />
              </View>
              <View style={[s.cardinalStar, { top: 105, left: 4 }]}>
                <Icon source="star-four-points" size={9} color={`${theme.colors.primary}88`} />
              </View>
            </View>

            <Text variant="displaySmall" style={[s.heroTitleTop, { color: theme.colors.onSurface }]}>
              {t("subscription.heroTitleTop")}
            </Text>
            <Text variant="displaySmall" style={[s.heroTitleBottom, { color: theme.colors.primary }]}>
              {t("subscription.heroTitleBottom")}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceMuted, textAlign: "center", lineHeight: 21 }}
            >
              {t("subscription.heroBody")}
            </Text>
          </View>

          <Card
            style={[
              s.proCard,
              {
                backgroundColor: theme.colors.surface1,
                borderColor: `${theme.colors.primary}80`,
              },
            ]}
          >
            <Card.Content style={s.cardContent}>
              <View style={s.priceRow}>
                <View>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                    {t("subscription.proPlanTitle")}
                  </Text>
                  <View style={s.priceInline}>
                    <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
                      {displayPrice}
                    </Text>
                    {displayPeriodLabel ? (
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceMuted }}>
                        {displayPeriodLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Surface
                  style={[s.sparkWrap, { backgroundColor: `${theme.colors.primary}60` }]}
                  elevation={0}
                >
                  <Icon source="star-four-points" size={20} color={theme.colors.primary} />
                  <View style={s.sparkSmall}>
                    <Icon source="star-four-points" size={10} color={theme.colors.primary} />
                  </View>
                </Surface>
              </View>

              <View style={s.featureList}>
                {availablePlans.length > 1 ? (
                  <View style={s.planSelector}>
                    {availablePlans.map(({ cycle, plan }) => {
                      const isSelected = cycle === selectedPlanCycle;
                      const isRecommended = cycle === "oneTime" && hasLifetimePlan;
                      const cycleLabel =
                        cycle === "yearly"
                          ? t("subscription.planYearly")
                          : cycle === "monthly"
                            ? t("subscription.planMonthly")
                            : t("subscription.planOneTime");

                      return (
                        <TouchableOpacity
                          key={cycle}
                          onPress={() => setSelectedCycle(cycle)}
                          style={[
                            s.planOption,
                            {
                              borderColor: isSelected ? theme.colors.primary : theme.colors.outlineSoft,
                              backgroundColor: isSelected ? `${theme.colors.primary}28` : `${theme.colors.surface2}44`,
                            },
                          ]}
                          activeOpacity={0.9}
                        >
                          <View style={s.planOptionTopRow}>
                            <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                              {cycleLabel}
                            </Text>
                            {isRecommended ? (
                              <View
                                style={[
                                  s.recommendedBadge,
                                  {
                                    backgroundColor: `${theme.colors.primary}55`,
                                    borderColor: `${theme.colors.primary}A3`,
                                  },
                                ]}
                              >
                                <Text variant="labelSmall" style={[s.recommendedBadgeLabel, { color: theme.colors.primary }]}>
                                  {t("subscription.recommended")}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceMuted }}>
                            {plan.price}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}

                {proFeatures.map((feature) => (
                  <View key={feature} style={s.featureRow}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                      ✓
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card
            style={[
              s.freeCard,
              {
                backgroundColor: theme.colors.surface2,
                borderColor: theme.colors.outlineSoft,
              },
            ]}
          >
            <Card.Content style={s.cardContent}>
              <View style={s.priceRow}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurfaceMuted }}>
                  {t("subscription.basicPlan")}
                </Text>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceMuted }}>
                  {t("subscription.free")}
                </Text>
              </View>
              <View style={s.featureList}>
                {freeFeatures.map((feature, index) => (
                  <View key={feature} style={[s.featureRow, { opacity: index === 2 ? 0.5 : 0.8 }]}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceMuted }}>
                      {index === 2 ? "🔒" : "✓"}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceMuted }}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <View style={s.ctaArea}>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              contentStyle={s.ctaContent}
              labelStyle={s.ctaLabel}
              icon={isProActive ? "check-circle" : "arrow-right"}
              onPress={() => void handleActivatePremium()}
              disabled={isProActive || !isPurchasingAvailable}
              loading={isActivating}
            >
              {isProActive ? t("subscription.premiumActive") : t("subscription.unlockAllFeatures")}
            </Button>

            {!paywallPlans?.isConfigured ? (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceMuted, textAlign: "center" }}>
                {t("subscription.purchasesNotConfigured")}
              </Text>
            ) : null}

            <View style={s.legalRow}>
              <TouchableOpacity
                onPress={() => void handleRestorePurchase()}
                disabled={isRestoring || !paywallPlans?.isConfigured}
                style={s.legalButton}
              >
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceMuted }}>
                  {isRestoring ? t("subscription.restoring") : t("subscription.restorePurchase")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.legalButton}
                onPress={() => void handleOpenLegalLink("terms", TERMS_URL)}
              >
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceMuted }}>
                  {t("subscription.terms")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.legalButton}
                onPress={() => void handleOpenLegalLink("privacy", PRIVACY_URL)}
              >
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceMuted }}>
                  {t("subscription.privacy")}
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              variant="bodySmall"
              style={[s.subscriptionNote, { color: theme.colors.onSurfaceMuted }]}
            >
              {subscriptionNote}
            </Text>

            <View style={s.trustList}>
              {trustPoints.map((point) => (
                <View key={point} style={s.trustItem}>
                  <Icon source="check-circle-outline" size={16} color={theme.colors.primary} />
                  <Text
                    variant="bodySmall"
                    style={[s.trustItemText, { color: theme.colors.onSurfaceMuted }]}
                  >
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <Portal>
        <Modal
          visible={statusModalType !== null}
          onDismiss={closeStatusModal}
          contentContainerStyle={[
            s.statusModal,
            {
              backgroundColor: theme.colors.surface1,
              borderColor: theme.colors.outlineSoft,
            },
          ]}
        >
          <Animated.View style={modalAnimatedStyle}>
            <View style={s.statusModalTop}>
              <Surface
                style={[
                  s.statusModalIconWrap,
                  {
                    backgroundColor: `${theme.colors.primary}3D`,
                    borderColor: `${theme.colors.primary}73`,
                  },
                ]}
                elevation={0}
              >
                <Icon source={statusModalIcon} size={28} color={theme.colors.primary} />
              </Surface>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface, textAlign: "center" }}>
                {statusModalTitle}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceMuted, textAlign: "center", lineHeight: 21 }}
              >
                {statusModalBody}
              </Text>
            </View>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              contentStyle={s.statusModalButtonContent}
              onPress={closeStatusModal}
            >
              {t("common.close")}
            </Button>
          </Animated.View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    screen: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    placeholder: {
      width: 48,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 40,
      gap: 14,
    },
    hero: {
      alignItems: "center",
      gap: 8,
    },
    orbContainer: {
      width: 220,
      height: 220,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    orbOuterRing: {
      position: "absolute",
      width: 212,
      height: 212,
      borderRadius: 106,
      borderWidth: 1,
      borderStyle: "dashed",
    },
    orbPulseRing: {
      position: "absolute",
      width: 192,
      height: 192,
      borderRadius: 96,
      borderWidth: 1,
    },
    heroIconCircle: {
      width: 170,
      height: 170,
      borderRadius: 85,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    heroIconInner: {
      width: 86,
      height: 86,
      borderRadius: 43,
      justifyContent: "center",
      alignItems: "center",
    },
    cardinalStar: {
      position: "absolute",
    },
    heroTitleTop: {
      textAlign: "center",
      fontWeight: "300",
      lineHeight: 52,
    },
    heroTitleBottom: {
      textAlign: "center",
      fontWeight: "700",
      marginTop: -6,
      marginBottom: 2,
    },
    proCard: {
      borderRadius: 24,
      borderWidth: 1,
      overflow: "hidden",
    },
    freeCard: {
      borderRadius: 24,
      borderWidth: 1,
    },
    cardContent: {
      gap: 14,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    priceInline: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
    },
    planSelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    planOption: {
      flexGrow: 1,
      flexBasis: 110,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 2,
    },
    planOptionTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    recommendedBadge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
    },
    recommendedBadgeLabel: {
      fontSize: 10,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    sparkWrap: {
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: "center",
      alignItems: "center",
    },
    sparkSmall: {
      position: "absolute",
      right: 14,
      top: 14,
    },
    featureList: {
      gap: 10,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    ctaArea: {
      marginTop: 6,
      gap: 10,
    },
    ctaContent: {
      height: 52,
    },
    ctaLabel: {
      fontSize: 17,
      fontWeight: "600",
    },
    legalRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 20,
    },
    legalButton: {
      paddingHorizontal: 2,
    },
    subscriptionNote: {
      textAlign: "center",
      lineHeight: 18,
    },
    trustList: {
      gap: 8,
    },
    trustItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    trustItemText: {
      flex: 1,
      lineHeight: 18,
    },
    statusModal: {
      marginHorizontal: 20,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingVertical: 20,
    },
    statusModalTop: {
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },
    statusModalIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    statusModalButtonContent: {
      height: 46,
    },
  });
