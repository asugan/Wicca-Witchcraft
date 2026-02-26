import { relations } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const rituals = sqliteTable(
  "rituals",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    moonPhase: text("moon_phase").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    coverImage: text("cover_image").notNull(),
    incantation: text("incantation").notNull(),
    safetyNote: text("safety_note").notNull(),
    createdAt: integer("created_at").notNull(),
    isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    slugUnique: uniqueIndex("rituals_slug_unique").on(table.slug),
    categoryIndex: index("rituals_category_idx").on(table.category),
  })
);

export const ritualSteps = sqliteTable(
  "ritual_steps",
  {
    id: text("id").primaryKey(),
    ritualId: text("ritual_id")
      .notNull()
      .references(() => rituals.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
  },
  (table) => ({
    ritualOrderIndex: uniqueIndex("ritual_steps_ritual_order_unique").on(table.ritualId, table.stepOrder),
  })
);

export const libraryEntries = sqliteTable(
  "library_entries",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    entityType: text("entity_type").notNull(),
    summary: text("summary").notNull(),
    spiritualProperties: text("spiritual_properties").notNull(),
    correspondences: text("correspondences").notNull(),
    cleansingMethod: text("cleansing_method").notNull(),
    careNote: text("care_note").notNull(),
    isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    slugUnique: uniqueIndex("library_entries_slug_unique").on(table.slug),
    typeIndex: index("library_entries_type_idx").on(table.entityType),
  })
);

export const materials = sqliteTable(
  "materials",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    linkedEntryId: text("linked_entry_id").references(() => libraryEntries.id, { onDelete: "set null" }),
  },
  (table) => ({
    slugUnique: uniqueIndex("materials_slug_unique").on(table.slug),
    linkedEntryIndex: index("materials_linked_entry_id_idx").on(table.linkedEntryId),
  })
);

export const ritualMaterials = sqliteTable(
  "ritual_materials",
  {
    ritualId: text("ritual_id")
      .notNull()
      .references(() => rituals.id, { onDelete: "cascade" }),
    materialId: text("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    quantityLabel: text("quantity_label"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ritualId, table.materialId] }),
    ritualSortIndex: index("ritual_materials_ritual_sort_idx").on(table.ritualId, table.sortOrder),
    materialIdIndex: index("ritual_materials_material_id_idx").on(table.materialId),
  })
);

export const entityLinks = sqliteTable(
  "entity_links",
  {
    id: text("id").primaryKey(),
    sourceEntityType: text("source_entity_type").notNull(),
    sourceEntityId: text("source_entity_id").notNull(),
    targetEntityType: text("target_entity_type").notNull(),
    targetEntityId: text("target_entity_id").notNull(),
    relationType: text("relation_type").notNull(),
  },
  (table) => ({
    sourceIndex: index("entity_links_source_idx").on(table.sourceEntityType, table.sourceEntityId),
    targetIndex: index("entity_links_target_idx").on(table.targetEntityType, table.targetEntityId),
  })
);

export const dailyCards = sqliteTable(
  "daily_cards",
  {
    id: text("id").primaryKey(),
    cardName: text("card_name").notNull(),
    arcana: text("arcana").notNull(),
    uprightMeaning: text("upright_meaning").notNull(),
    drawDate: text("draw_date").notNull(),
  },
  (table) => ({
    drawDateIndex: uniqueIndex("daily_cards_draw_date_unique").on(table.drawDate),
  })
);

export const tarotCards = sqliteTable(
  "tarot_cards",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    arcana: text("arcana").notNull(),
    suit: text("suit"),
    rank: integer("rank").notNull(),
    uprightMeaning: text("upright_meaning").notNull(),
    reversedMeaning: text("reversed_meaning").notNull(),
    keywords: text("keywords").notNull(),
    description: text("description").notNull(),
  },
  (table) => ({
    arcanaIndex: index("tarot_cards_arcana_idx").on(table.arcana),
    suitIndex: index("tarot_cards_suit_idx").on(table.suit),
  })
);

export const tarotReadings = sqliteTable(
  "tarot_readings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spreadType: text("spread_type").notNull(),
    cardsJson: text("cards_json").notNull(),
    createdAt: integer("created_at").notNull(),
    readingDate: text("reading_date").notNull(),
  },
  (table) => ({
    userDateIndex: index("tarot_readings_user_date_idx").on(table.userId, table.readingDate),
    userCreatedAtIndex: index("tarot_readings_user_created_at_idx").on(table.userId, table.createdAt),
  })
);

export const moonEvents = sqliteTable(
  "moon_events",
  {
    id: text("id").primaryKey(),
    eventDate: text("event_date").notNull(),
    phase: text("phase").notNull(),
    zodiacSign: text("zodiac_sign").notNull(),
    summary: text("summary").notNull(),
  },
  (table) => ({
    eventDateIndex: index("moon_events_event_date_idx").on(table.eventDate),
  })
);

export const favorites = sqliteTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    uniqueFavoriteIndex: uniqueIndex("favorites_user_entity_unique").on(table.userId, table.entityType, table.entityId),
  })
);

export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    mood: text("mood"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    userCreatedAtIndex: index("journal_entries_user_created_at_idx").on(table.userId, table.createdAt),
  })
);

export const appSettings = sqliteTable(
  "app_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    themeMode: text("theme_mode").notNull(),
    notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).notNull(),
    premiumActive: integer("premium_active", { mode: "boolean" }).notNull(),
    language: text("language").notNull().default(""),
    onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
    cdnVersion: integer("cdn_version").notNull().default(0),
  },
  (table) => ({
    userSettingIndex: uniqueIndex("app_settings_user_unique").on(table.userId),
  })
);

export const ritualRelations = relations(rituals, ({ many }) => ({
  steps: many(ritualSteps),
  materialLinks: many(ritualMaterials),
}));

export const ritualStepsRelations = relations(ritualSteps, ({ one }) => ({
  ritual: one(rituals, {
    fields: [ritualSteps.ritualId],
    references: [rituals.id],
  }),
}));

export const materialRelations = relations(materials, ({ one, many }) => ({
  linkedEntry: one(libraryEntries, {
    fields: [materials.linkedEntryId],
    references: [libraryEntries.id],
  }),
  ritualLinks: many(ritualMaterials),
}));

export const ritualMaterialRelations = relations(ritualMaterials, ({ one }) => ({
  ritual: one(rituals, {
    fields: [ritualMaterials.ritualId],
    references: [rituals.id],
  }),
  material: one(materials, {
    fields: [ritualMaterials.materialId],
    references: [materials.id],
  }),
}));

export const libraryEntryRelations = relations(libraryEntries, ({ many }) => ({
  materialRefs: many(materials),
}));

export const subscriptionCache = sqliteTable("subscription_cache", {
  entitlement: text("entitlement").primaryKey(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  updatedAt: text("updated_at").notNull(),
  expiresAt: text("expires_at"),
});

export type RitualRecord = typeof rituals.$inferSelect;
export type RitualStepRecord = typeof ritualSteps.$inferSelect;
export type MaterialRecord = typeof materials.$inferSelect;
export type LibraryEntryRecord = typeof libraryEntries.$inferSelect;
export type TarotCardRecord = typeof tarotCards.$inferSelect;
export type TarotReadingRecord = typeof tarotReadings.$inferSelect;
