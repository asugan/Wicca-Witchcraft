import {
  dispose as disposeAptabase,
  init as initAptabase,
  trackEvent as aptabaseTrackEvent,
} from "@aptabase/react-native";
import Constants from "expo-constants";

export type AnalyticsEventName =
  | "app_started"
  | "home_viewed"
  | "daily_card_drawn"
  | "ritual_opened"
  | "material_link_clicked"
  | "library_entry_viewed"
  | "library_entry_opened"
  | "library_entry_favorited"
  | "ritual_favorited"
  | "journal_entry_created"
  | "premium_paywall_viewed"
  | "premium_started"
  | "premium_gate_shown"
  | "ritual_mode_started"
  | "ritual_mode_completed"
  | "ritual_journal_saved"
  | "tarot_spread_drawn";

type AnalyticsPropertyValue = string | number;

export type AnalyticsTabName = "home" | "grimoire" | "library" | "tools" | "profile" | "system";

export type AnalyticsProperties = {
  user_id?: string;
  tab_name?: AnalyticsTabName;
  entity_id?: string;
  source?: string;
} & Record<string, AnalyticsPropertyValue | undefined>;

const fallbackAppVersion = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "development";

let analyticsInitialized = false;
let hasWarnedMissingKey = false;
let appStartedTracked = false;

function getAptabaseAppKey() {
  const key = process.env.EXPO_PUBLIC_APTABASE_APP_KEY;
  return typeof key === "string" ? key.trim() : "";
}

function getAptabaseHost() {
  const host = process.env.EXPO_PUBLIC_APTABASE_HOST;
  return typeof host === "string" ? host.trim() : "";
}

function sanitizeProperties(properties: AnalyticsProperties): Record<string, AnalyticsPropertyValue> {
  const sanitized: Record<string, AnalyticsPropertyValue> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string" || typeof value === "number") {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function initAnalytics() {
  if (analyticsInitialized) {
    return;
  }

  const aptabaseAppKey = getAptabaseAppKey();
  const aptabaseHost = getAptabaseHost();

  if (!aptabaseAppKey) {
    if (__DEV__ && !hasWarnedMissingKey) {
      console.warn("[analytics] EXPO_PUBLIC_APTABASE_APP_KEY is missing. Events are disabled.");
      hasWarnedMissingKey = true;
    }

    return;
  }

  const [, region] = aptabaseAppKey.split("-");
  if (__DEV__ && region === "SH" && !aptabaseHost) {
    console.warn("[analytics] Self-hosted Aptabase key detected. Set EXPO_PUBLIC_APTABASE_HOST.");
  }

  initAptabase(aptabaseAppKey, {
    appVersion: fallbackAppVersion,
    ...(aptabaseHost ? { host: aptabaseHost } : {}),
  });

  if (__DEV__) {
    console.log("[analytics] Aptabase initialized");
  }

  analyticsInitialized = true;
}

export function disposeAnalytics() {
  if (!analyticsInitialized) {
    return;
  }

  disposeAptabase();
  analyticsInitialized = false;
}

export function trackEvent(eventName: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  const payload = sanitizeProperties({
    timestamp: Date.now(),
    ...properties,
  });

  if (!analyticsInitialized) {
    initAnalytics();
  }

  if (!analyticsInitialized) {
    if (__DEV__) {
      console.log(`[analytics:noop] ${eventName}`, payload);
    }

    return;
  }

  aptabaseTrackEvent(eventName, payload);
}

export function trackAppStarted(userId?: string) {
  if (appStartedTracked) {
    return;
  }

  trackEvent("app_started", {
    user_id: userId,
    tab_name: "system",
    source: "app_boot",
  });

  if (analyticsInitialized) {
    appStartedTracked = true;
  }
}
