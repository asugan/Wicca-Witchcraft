import { eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { appSettings } from "@/db/schema";
import { type AppLanguage, getDeviceAppLanguage } from "@/i18n/config";

export type ThemeMode = "system" | "light" | "dark";

const DEFAULT_THEME_MODE: ThemeMode = "dark";

function createSettingsId(userId: string) {
  return `${userId}-settings`;
}

export function getNotificationsEnabled(userId: string) {
  ensureDatabaseInitialized();

  const row = db
    .select({ notificationsEnabled: appSettings.notificationsEnabled })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (row) {
    return row.notificationsEnabled;
  }

  return false;
}

export function getLanguagePreference(userId: string): AppLanguage {
  ensureDatabaseInitialized();

  const row = db
    .select({ language: appSettings.language })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (row && row.language) {
    return row.language as AppLanguage;
  }

  return getDeviceAppLanguage();
}

export function getProfileSettings(userId: string): {
  notificationsEnabled: boolean;
  language: AppLanguage;
} {
  ensureDatabaseInitialized();

  const row = db
    .select({
      notificationsEnabled: appSettings.notificationsEnabled,
      language: appSettings.language,
    })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  return {
    notificationsEnabled: row?.notificationsEnabled ?? false,
    language: (row?.language as AppLanguage) || getDeviceAppLanguage(),
  };
}

export function setLanguagePreference(userId: string, language: AppLanguage): void {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: appSettings.id })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (existing) {
    db.update(appSettings).set({ language }).where(eq(appSettings.id, existing.id)).run();

    return;
  }

  db.insert(appSettings)
    .values({
      id: createSettingsId(userId),
      userId,
      themeMode: DEFAULT_THEME_MODE,
      notificationsEnabled: false,
      premiumActive: false,
      language,
    })
    .run();
}

export function setNotificationsEnabled(userId: string, notificationsEnabled: boolean) {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: appSettings.id })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (existing) {
    db.update(appSettings).set({ notificationsEnabled }).where(eq(appSettings.id, existing.id)).run();

    return;
  }

  db.insert(appSettings)
    .values({
      id: createSettingsId(userId),
      userId,
      themeMode: DEFAULT_THEME_MODE,
      notificationsEnabled,
      premiumActive: false,
    })
    .run();
}

export function getThemeMode(userId: string): ThemeMode {
  ensureDatabaseInitialized();

  const row = db
    .select({ themeMode: appSettings.themeMode })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (row && row.themeMode) {
    return row.themeMode as ThemeMode;
  }

  return DEFAULT_THEME_MODE;
}

export function setThemeMode(userId: string, themeMode: ThemeMode): void {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: appSettings.id })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (existing) {
    db.update(appSettings).set({ themeMode }).where(eq(appSettings.id, existing.id)).run();

    return;
  }

  db.insert(appSettings)
    .values({
      id: createSettingsId(userId),
      userId,
      themeMode,
      notificationsEnabled: false,
      premiumActive: false,
    })
    .run();
}

export function getOnboardingCompleted(userId: string): boolean {
  ensureDatabaseInitialized();

  const row = db
    .select({ onboardingCompleted: appSettings.onboardingCompleted })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (row) {
    return row.onboardingCompleted;
  }

  return false;
}

export function setOnboardingCompleted(userId: string, completed: boolean): void {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: appSettings.id })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1)
    .get();

  if (existing) {
    db.update(appSettings).set({ onboardingCompleted: completed }).where(eq(appSettings.id, existing.id)).run();

    return;
  }

  db.insert(appSettings)
    .values({
      id: createSettingsId(userId),
      userId,
      themeMode: DEFAULT_THEME_MODE,
      notificationsEnabled: false,
      premiumActive: false,
      onboardingCompleted: completed,
    })
    .run();
}
