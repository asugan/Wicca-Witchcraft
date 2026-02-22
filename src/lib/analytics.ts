export type AnalyticsEventName =
  | "home_viewed"
  | "daily_card_drawn"
  | "ritual_opened"
  | "material_link_clicked"
  | "library_entry_viewed"
  | "ritual_favorited"
  | "journal_entry_created"
  | "premium_paywall_viewed"
  | "premium_started";

export type AnalyticsProperties = {
  user_id?: string;
  tab_name?: string;
  entity_id?: string;
  source?: string;
} & Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...properties,
  };

  console.log(`[analytics] ${eventName}`, payload);
}
