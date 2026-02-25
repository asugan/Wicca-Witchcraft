import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { setNotificationsEnabled } from "@/db/repositories/settings-repository";
import { enableMysticNotifications } from "@/lib/notifications";
import { typefaces } from "@/theme/tokens";

const LOCAL_USER_ID = "local-user";
const PRIMARY_GOLD = "#f2b90d";
const DARK_BG = "#0c0b16";

type NotificationPermissionModalProps = {
  visible: boolean;
  onEnabled: () => void;
  onSkipped: () => void;
};

export function NotificationPermissionModal({
  visible,
  onEnabled,
  onSkipped,
}: NotificationPermissionModalProps) {
  const { t } = useTranslation();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    if (isEnabling) return;
    setIsEnabling(true);
    const result = await enableMysticNotifications();
    setNotificationsEnabled(LOCAL_USER_ID, result.enabled);
    setIsEnabling(false);
    onEnabled();
  };

  const handleSkip = () => {
    onSkipped();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleSkip}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Bell Icon */}
          <View style={modalStyles.iconWrapper}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={36}
              color={PRIMARY_GOLD}
            />
          </View>

          {/* Title & Subtitle */}
          <Text style={modalStyles.title}>
            {t("onboarding.notificationTitle" as string)}
          </Text>
          <Text style={modalStyles.subtitle}>
            {t("onboarding.notificationSubtitle" as string)}
          </Text>

          {/* Feature Rows */}
          <View style={modalStyles.featuresContainer}>
            <View style={modalStyles.featureRow}>
              <View style={modalStyles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={20}
                  color={PRIMARY_GOLD}
                />
              </View>
              <View style={modalStyles.featureTextWrapper}>
                <Text style={modalStyles.featureTitle}>
                  {t("onboarding.notificationMoonTitle" as string)}
                </Text>
                <Text style={modalStyles.featureDescription}>
                  {t("onboarding.notificationMoonDescription" as string)}
                </Text>
              </View>
            </View>

            <View style={modalStyles.featureRow}>
              <View style={modalStyles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color={PRIMARY_GOLD}
                />
              </View>
              <View style={modalStyles.featureTextWrapper}>
                <Text style={modalStyles.featureTitle}>
                  {t("onboarding.notificationDailyTitle" as string)}
                </Text>
                <Text style={modalStyles.featureDescription}>
                  {t("onboarding.notificationDailyDescription" as string)}
                </Text>
              </View>
            </View>

            <View style={modalStyles.featureRow}>
              <View style={modalStyles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="star-four-points-outline"
                  size={20}
                  color={PRIMARY_GOLD}
                />
              </View>
              <View style={modalStyles.featureTextWrapper}>
                <Text style={modalStyles.featureTitle}>
                  {t("onboarding.notificationCelestialTitle" as string)}
                </Text>
                <Text style={modalStyles.featureDescription}>
                  {t("onboarding.notificationCelestialDescription" as string)}
                </Text>
              </View>
            </View>
          </View>

          {/* Enable Button */}
          <Pressable
            style={[modalStyles.enableButton, isEnabling && modalStyles.enableButtonDisabled]}
            onPress={handleEnable}
            disabled={isEnabling}
          >
            {isEnabling ? (
              <ActivityIndicator size="small" color={DARK_BG} />
            ) : (
              <Text style={modalStyles.enableButtonText}>
                {t("onboarding.notificationEnable" as string)}
              </Text>
            )}
          </Pressable>

          {/* Skip Button */}
          <Pressable
            style={modalStyles.skipButton}
            onPress={handleSkip}
            disabled={isEnabling}
          >
            <Text style={modalStyles.skipButtonText}>
              {t("onboarding.notificationSkip" as string)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(12,11,22,0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#14132a",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${PRIMARY_GOLD}30`,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${PRIMARY_GOLD}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${PRIMARY_GOLD}40`,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: PRIMARY_GOLD,
    fontFamily: typefaces.display,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${PRIMARY_GOLD}15`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f0f0f0",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 17,
  },
  enableButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: PRIMARY_GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  enableButtonDisabled: {
    opacity: 0.7,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_BG,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skipButton: {
    width: "100%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
  },
});
