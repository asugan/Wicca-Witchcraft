export type { LibraryEntrySeed } from "@/db/library-seed-data";
export { LIBRARY_ENTRY_SEEDS } from "@/db/library-seed-data";

export {
  MATERIAL_SEEDS,
  RITUAL_SEEDS,
  RITUAL_STEP_SEEDS,
  RITUAL_MATERIAL_SEEDS,
  ENTITY_LINK_SEEDS,
} from "@/db/ritual-seed-data";

export const DAILY_CARD_SEEDS = [
  {
    id: "daily-card-default",
    cardName: "The Star",
    arcana: "major",
    uprightMeaning: "Hope, renewal, and trust in your next chapter.",
    drawDate: "default",
  },
];

export const MOON_EVENT_SEEDS: never[] = [];

export const DEFAULT_USER_SEED = {
  id: "local-user",
  displayName: "Mystic Seeker",
  createdAt: Date.now(),
};

export const DEFAULT_SETTINGS_SEED = {
  id: "local-user-settings",
  userId: "local-user",
  themeMode: "dark",
  notificationsEnabled: false,
  premiumActive: false,
  language: "",
  onboardingCompleted: false,
  cdnVersion: 0,
};
