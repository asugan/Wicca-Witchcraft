import { eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { appSettings } from "@/db/schema";
import { type AppLanguage, getDeviceAppLanguage } from "@/i18n/config";

const DEFAULT_THEME_MODE = "system";

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
