import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

import { runMigrations } from "@/db/migrations";
import {
  DAILY_CARD_SEEDS,
  DEFAULT_SETTINGS_SEED,
  DEFAULT_USER_SEED,
  ENTITY_LINK_SEEDS,
  LIBRARY_ENTRY_SEEDS,
  MATERIAL_SEEDS,
  RITUAL_MATERIAL_SEEDS,
  RITUAL_SEEDS,
  RITUAL_STEP_SEEDS,
} from "@/db/seed-data";
import {
  appSettings,
  dailyCards,
  entityLinks,
  libraryEntries,
  materials,
  ritualMaterials,
  rituals,
  ritualSteps,
  users,
} from "@/db/schema";

const sqlite = SQLite.openDatabaseSync("mystic.db");

export const db = drizzle(sqlite);

let initialized = false;

function seedIfNeeded() {
  const firstRitual = db.select({ id: rituals.id }).from(rituals).limit(1).get();

  if (firstRitual) {
    return;
  }

  db.insert(users).values(DEFAULT_USER_SEED).run();
  db.insert(appSettings).values(DEFAULT_SETTINGS_SEED).run();

  db.insert(libraryEntries).values(LIBRARY_ENTRY_SEEDS).run();
  db.insert(materials).values([...MATERIAL_SEEDS]).run();
  db.insert(rituals).values(RITUAL_SEEDS).run();
  db.insert(ritualSteps).values(RITUAL_STEP_SEEDS).run();
  db.insert(ritualMaterials).values(RITUAL_MATERIAL_SEEDS).run();
  db.insert(entityLinks).values(ENTITY_LINK_SEEDS).run();
  db.insert(dailyCards).values(DAILY_CARD_SEEDS).run();
}

export function ensureDatabaseInitialized() {
  if (initialized) {
    return;
  }

  runMigrations(sqlite);
  seedIfNeeded();

  initialized = true;
}
