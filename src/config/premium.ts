/**
 * Premium feature configuration constants
 */

// Journal entry limit for free users
export const FREE_JOURNAL_LIMIT = 5;

// Premium ritual slugs
export const PREMIUM_RITUAL_SLUGS = [
  "cord-cutting-boundary",
  "career-path-divination",
  "ancestor-gratitude",
  "hearth-protection-circle",
  "relationship-harmony",
] as const;

// Premium library entry slugs
export const PREMIUM_LIBRARY_SLUGS = [
  "labradorite",
  "black-tourmaline",
  "citrine",
  "brigid",
  "hekate",
  "freya",
  "thoth",
  "ankh",
  "triquetra",
] as const;

// Tarot spread types
export type SpreadType = "daily" | "three_card" | "celtic_cross" | "relationship" | "career";

// Premium spread types (require subscription)
export const PREMIUM_SPREAD_TYPES: SpreadType[] = ["celtic_cross", "relationship", "career"];

// Free spread types
export const FREE_SPREAD_TYPES: SpreadType[] = ["daily", "three_card"];

// Spread configurations
export const SPREAD_CONFIGS: Record<SpreadType, { cardCount: number; positions: string[] }> = {
  daily: {
    cardCount: 1,
    positions: ["daily"],
  },
  three_card: {
    cardCount: 3,
    positions: ["past", "present", "future"],
  },
  celtic_cross: {
    cardCount: 10,
    positions: [
      "present",
      "challenge",
      "past",
      "future",
      "above",
      "below",
      "advice",
      "external",
      "hopes",
      "outcome",
    ],
  },
  relationship: {
    cardCount: 7,
    positions: ["you", "partner", "connection", "challenge", "advice", "near_future", "outcome"],
  },
  career: {
    cardCount: 5,
    positions: ["current", "obstacles", "hidden", "advice", "outcome"],
  },
};

// Premium feature identifiers for analytics and gating
export type PremiumFeature =
  | "journal_unlimited"
  | "tarot_celtic_cross"
  | "tarot_relationship"
  | "tarot_career"
  | "ritual_premium"
  | "library_premium";
