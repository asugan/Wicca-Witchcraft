import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Modal, Portal, RadioButton, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";

import {
  createJournalEntry,
  deleteJournalEntry,
  listFavoriteRituals,
  listJournalEntries,
  removeRitualFavorite,
  updateJournalEntry,
} from "@/db/repositories/my-space-repository";
import { hasProAccess } from "@/db/repositories/subscription-repository";
import {
  getLanguagePreference,
  getNotificationsEnabled,
  setLanguagePreference,
  setNotificationsEnabled,
} from "@/db/repositories/settings-repository";
import i18n from "@/i18n";
import type { AppLanguage } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";
import { disableMysticNotifications, enableMysticNotifications } from "@/lib/notifications";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";
import { useToast } from "@/context/toast-context";

const LOCAL_USER_ID = "local-user";

type LanguageOption = { code: AppLanguage; labelKey: string };

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", labelKey: "settings.languageEnglish" },
  { code: "tr", labelKey: "settings.languageTurkish" },
  { code: "de", labelKey: "settings.languageGerman" },
  { code: "es", labelKey: "settings.languageSpanish" },
  { code: "fr", labelKey: "settings.languageFrench" },
  { code: "it", labelKey: "settings.languageItalian" },
  { code: "pt", labelKey: "settings.languagePortuguese" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const styles = makeStyles(theme);

  const [favorites, setFavorites] = useState<ReturnType<typeof listFavoriteRituals>>([]);
  const [journalEntries, setJournalEntries] = useState<ReturnType<typeof listJournalEntries>>([]);

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isProActive, setIsProActive] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationStatusText, setNotificationStatusText] = useState<string>("");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("en");

  const refreshData = useCallback(() => {
    setFavorites(listFavoriteRituals(LOCAL_USER_ID));
    setJournalEntries(listJournalEntries(LOCAL_USER_ID));
    setIsProActive(hasProAccess());
    setNotificationsEnabledState(getNotificationsEnabled(LOCAL_USER_ID));
    setSelectedLanguage(getLanguagePreference(LOCAL_USER_ID));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    refreshData();
  }, [isFocused, refreshData]);

  const isEditing = useMemo(() => Boolean(editingEntryId), [editingEntryId]);

  const resetForm = () => {
    setEditingEntryId(null);
    setTitle("");
    setContent("");
    setMood("");
  };

  const submitEntry = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    if (editingEntryId) {
      updateJournalEntry(LOCAL_USER_ID, editingEntryId, trimmedTitle, trimmedContent, mood);
    } else {
      createJournalEntry(LOCAL_USER_ID, trimmedTitle, trimmedContent, mood);
      trackEvent("journal_entry_created", {
        user_id: LOCAL_USER_ID,
        tab_name: "profile",
        source: "my_space_form",
      });
    }

    resetForm();
    refreshData();
  };

  const onToggleNotifications = async () => {
    if (isUpdatingNotifications) {
      return;
    }

    const nextValue = !notificationsEnabled;

    setIsUpdatingNotifications(true);
    setNotificationStatusText("");

    try {
      if (nextValue) {
        const result = await enableMysticNotifications();

        setNotificationsEnabledState(result.enabled);
        setNotificationsEnabled(LOCAL_USER_ID, result.enabled);

        if (!result.enabled) {
          setNotificationStatusText(t("settings.permissionNotGranted"));
        } else {
          setNotificationStatusText(t("settings.remindersActive"));
        }
      } else {
        await disableMysticNotifications();
        setNotificationsEnabledState(false);
        setNotificationsEnabled(LOCAL_USER_ID, false);
        setNotificationStatusText(t("settings.remindersOff"));
      }
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleLanguageSelect = (language: AppLanguage) => {
    setSelectedLanguage(language);
    setLanguagePreference(LOCAL_USER_ID, language);
    void i18n.changeLanguage(language);
    setLanguageModalVisible(false);

    const fixedT = i18n.getFixedT(language);
    const langOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language);
    const languageName = langOption ? fixedT(langOption.labelKey as string) : language;
    showToast(fixedT("settings.languageSavedMessage" as string, { language: languageName }), "success");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("profile.title")}</Text>
        <Text style={styles.subtitle}>{t("profile.subtitle")}</Text>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t("settings.title")}</Text>
            <Text style={styles.panelMeta}>{t("settings.personal")}</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{t("settings.remindersTitle")}</Text>
              <Text style={styles.settingDescription}>{t("settings.remindersDescription")}</Text>
            </View>

            <Pressable disabled={isUpdatingNotifications} onPress={onToggleNotifications} style={styles.switchTapArea}>
              <View style={[styles.switchPill, notificationsEnabled && styles.switchPillOn, isUpdatingNotifications && styles.switchPillBusy]}>
                <View style={[styles.switchKnob, notificationsEnabled && styles.switchKnobOn]} />
              </View>
            </Pressable>
          </View>

          <Text style={styles.settingMetaLine}>
            {notificationStatusText ||
              (notificationsEnabled
                ? t("settings.activeReminder")
                : t("settings.inactiveReminder"))}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{t("settings.languageLabel")}</Text>
              <Text style={styles.settingDescription}>{t("settings.languageHint")}</Text>
            </View>

            <Pressable onPress={() => setLanguageModalVisible(true)} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>
                {LANGUAGE_OPTIONS.find((opt) => opt.code === selectedLanguage)
                  ? t(LANGUAGE_OPTIONS.find((opt) => opt.code === selectedLanguage)!.labelKey as string)
                  : selectedLanguage.toUpperCase()}
              </Text>
              <MaterialCommunityIcons color={theme.colors.primary} name="chevron-right" size={16} />
            </Pressable>
          </View>

          <View style={styles.premiumRow}>
            <View style={styles.settingTextWrap}>
              <View style={styles.premiumTitleRow}>
                <MaterialCommunityIcons color={theme.colors.primary} name="star-four-points" size={18} />
                <Text style={styles.settingTitle}>{t("settings.premiumTitle")}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {isProActive ? t("settings.premiumActiveHint") : t("settings.premiumHint")}
              </Text>
            </View>

            {isProActive ? (
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons color={theme.colors.primary} name="check-circle" size={14} />
                <Text style={styles.premiumBadgeText}>{t("settings.premiumActive")}</Text>
              </View>
            ) : (
              <Pressable onPress={() => router.push("/subscription")} style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>{t("settings.upgradeToPro")}</Text>
                <MaterialCommunityIcons color={theme.colors.onPrimary} name="arrow-right" size={14} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t("profile.favorites")}</Text>
            <Text style={styles.panelMeta}>{t("profile.savedCount", { count: favorites.length })}</Text>
          </View>

          {favorites.map((favorite) => (
            <View key={favorite.favoriteId} style={styles.favoriteRow}>
              <MaterialCommunityIcons color={theme.colors.primary} name="bookmark" size={18} />
              <View style={styles.favoriteTextWrap}>
                <Text style={styles.favoriteTitle}>{favorite.ritualTitle}</Text>
                <Text style={styles.favoriteMeta}>{favorite.ritualMoonPhase.replaceAll("-", " ")}</Text>
              </View>
              <Pressable
                onPress={() => {
                  trackEvent("ritual_opened", {
                    user_id: LOCAL_USER_ID,
                    tab_name: "profile",
                    entity_id: favorite.ritualId,
                    source: "favorites",
                  });

                  router.push(`/ritual/${favorite.ritualSlug}` as never);
                }}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons color={theme.colors.onSurfaceMuted} name="chevron-right" size={16} />
              </Pressable>
              <Pressable
                onPress={() => {
                  removeRitualFavorite(LOCAL_USER_ID, favorite.ritualId);
                  refreshData();
                }}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons color={theme.colors.danger} name="bookmark-remove-outline" size={16} />
              </Pressable>
            </View>
          ))}

          {!favorites.length ? (
            <View style={styles.emptyRow}>
              <MaterialCommunityIcons color={theme.colors.onSurfaceMuted} name="bookmark-outline" size={16} />
              <Text style={styles.emptyText}>{t("profile.noFavorites")}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t("profile.bookOfShadows")}</Text>
            <Text style={styles.panelMeta}>{t("profile.entriesCount", { count: journalEntries.length })}</Text>
          </View>

          <View style={styles.formWrap}>
            <TextInput
              mode="outlined"
              onChangeText={setTitle}
              outlineColor={`${theme.colors.primary}4D`}
              placeholder={t("profile.entryTitlePlaceholder")}
              placeholderTextColor={`${theme.colors.onSurfaceMuted}99`}
              style={styles.input}
              textColor={theme.colors.onSurface}
              value={title}
            />
            <TextInput
              mode="outlined"
              onChangeText={setMood}
              outlineColor={`${theme.colors.primary}4D`}
              placeholder={t("profile.moodPlaceholder")}
              placeholderTextColor={`${theme.colors.onSurfaceMuted}99`}
              style={styles.input}
              textColor={theme.colors.onSurface}
              value={mood}
            />
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              onChangeText={setContent}
              outlineColor={`${theme.colors.primary}4D`}
              placeholder={t("profile.contentPlaceholder")}
              placeholderTextColor={`${theme.colors.onSurfaceMuted}99`}
              style={styles.inputMultiline}
              textColor={theme.colors.onSurface}
              value={content}
            />

            <View style={styles.formActions}>
              <Button mode="contained" onPress={submitEntry} style={styles.primaryAction} textColor={theme.colors.onPrimary}>
                {isEditing ? t("profile.updateEntry") : t("profile.addEntry")}
              </Button>
              {isEditing ? (
                <Button mode="text" onPress={resetForm} textColor={theme.colors.onSurfaceMuted}>
                  {t("profile.cancelEdit")}
                </Button>
              ) : null}
            </View>
          </View>

          {journalEntries.map((entry) => (
            <View key={entry.id} style={styles.journalRow}>
              <View style={styles.journalHeader}>
                <Text style={styles.journalTitle}>{entry.title}</Text>
                <View style={styles.journalActions}>
                  <Pressable
                    onPress={() => {
                      setEditingEntryId(entry.id);
                      setTitle(entry.title);
                      setContent(entry.content);
                      setMood(entry.mood ?? "");
                    }}
                    style={styles.iconButton}
                  >
                    <MaterialCommunityIcons color={theme.colors.primary} name="pencil-outline" size={16} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      deleteJournalEntry(LOCAL_USER_ID, entry.id);
                      if (editingEntryId === entry.id) {
                        resetForm();
                      }
                      refreshData();
                    }}
                    style={styles.iconButton}
                  >
                    <MaterialCommunityIcons color={theme.colors.danger} name="trash-can-outline" size={16} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.journalMeta}>
                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {entry.mood ? ` • ${entry.mood}` : ""}
              </Text>
              <Text style={styles.journalContent}>{entry.content}</Text>
            </View>
          ))}

          {!journalEntries.length ? (
            <View style={styles.emptyRow}>
              <MaterialCommunityIcons color={theme.colors.onSurfaceMuted} name="notebook-outline" size={16} />
              <Text style={styles.emptyText}>{t("profile.emptyJournal")}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Portal>
        <Modal
          contentContainerStyle={styles.languageModal}
          onDismiss={() => setLanguageModalVisible(false)}
          visible={languageModalVisible}
        >
          <Text style={styles.languageModalTitle}>{t("settings.languageLabel")}</Text>
          <RadioButton.Group onValueChange={(val) => handleLanguageSelect(val as AppLanguage)} value={selectedLanguage}>
            {LANGUAGE_OPTIONS.map((option) => (
              <Pressable
                key={option.code}
                onPress={() => handleLanguageSelect(option.code)}
                style={styles.languageOption}
              >
                <RadioButton color={theme.colors.primary} value={option.code} />
                <Text style={styles.languageOptionText}>{t(option.labelKey as string)}</Text>
              </Pressable>
            ))}
          </RadioButton.Group>
          <Button mode="text" onPress={() => setLanguageModalVisible(false)} textColor={theme.colors.onSurfaceMuted}>
            {t("common.close")}
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 20,
      paddingBottom: 124,
      gap: 12,
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 34,
      fontFamily: typefaces.display,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.onSurfaceMuted,
      lineHeight: 20,
    },
    panel: {
      marginTop: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      backgroundColor: theme.colors.surface1,
      padding: 14,
      gap: 12,
    },
    panelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    panelTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 24,
      fontWeight: "700",
    },
    panelMeta: {
      color: theme.colors.primary,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: "700",
    },
    favoriteRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: `${theme.colors.primary}2E`,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: `${theme.colors.surface2}8C`,
    },
    favoriteTextWrap: {
      flex: 1,
      gap: 2,
    },
    favoriteTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "700",
    },
    favoriteMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      textTransform: "capitalize",
    },
    formWrap: {
      gap: 10,
    },
    input: {
      backgroundColor: `${theme.colors.surface2}66`,
    },
    inputMultiline: {
      backgroundColor: `${theme.colors.surface2}66`,
      minHeight: 120,
    },
    formActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    primaryAction: {
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
    },
    journalRow: {
      borderWidth: 1,
      borderColor: `${theme.colors.primary}26`,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: `${theme.colors.surface2}7A`,
      gap: 4,
    },
    journalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    journalTitle: {
      color: theme.colors.onSurface,
      fontWeight: "700",
      fontSize: 14,
      flex: 1,
    },
    journalActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
    },
    journalMeta: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 11,
    },
    journalContent: {
      color: theme.colors.onSurface,
      fontSize: 13,
      lineHeight: 20,
    },
    emptyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: `${theme.colors.outline}66`,
      backgroundColor: `${theme.colors.surface2}66`,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    emptyText: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      flex: 1,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    settingTextWrap: {
      flex: 1,
      gap: 2,
    },
    settingTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "700",
    },
    settingDescription: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    switchTapArea: {
      paddingVertical: 4,
      paddingHorizontal: 2,
    },
    switchPill: {
      width: 52,
      height: 30,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${theme.colors.outline}80`,
      backgroundColor: `${theme.colors.surface2}CC`,
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    switchPillOn: {
      borderColor: `${theme.colors.primary}99`,
      backgroundColor: `${theme.colors.primary}38`,
    },
    switchPillBusy: {
      opacity: 0.6,
    },
    switchKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.onSurfaceMuted,
    },
    switchKnobOn: {
      marginLeft: 23,
      backgroundColor: theme.colors.primary,
    },
    settingMetaLine: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 11,
      lineHeight: 18,
    },
    languageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: `${theme.colors.primary}14`,
    },
    languageButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    languageModal: {
      backgroundColor: theme.colors.surface1,
      borderRadius: 20,
      marginHorizontal: 24,
      padding: 20,
      gap: 8,
    },
    languageModalTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    languageOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      gap: 4,
    },
    languageOptionText: {
      color: theme.colors.onSurface,
      fontSize: 15,
    },
    premiumRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: `${theme.colors.primary}1A`,
      paddingTop: 12,
    },
    premiumTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}66`,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: `${theme.colors.primary}1A`,
    },
    premiumBadgeText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    upgradeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.primary,
    },
    upgradeButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
  });
