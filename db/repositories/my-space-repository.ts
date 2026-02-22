import { and, desc, eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { favorites, journalEntries, rituals } from "@/db/schema";

const RITUAL_ENTITY_TYPE = "ritual";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listFavoriteRituals(userId: string) {
  ensureDatabaseInitialized();

  return db
    .select({
      favoriteId: favorites.id,
      favoritedAt: favorites.createdAt,
      ritualId: rituals.id,
      ritualSlug: rituals.slug,
      ritualTitle: rituals.title,
      ritualSummary: rituals.summary,
      ritualMoonPhase: rituals.moonPhase,
      ritualCoverImage: rituals.coverImage,
    })
    .from(favorites)
    .innerJoin(rituals, eq(favorites.entityId, rituals.id))
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, RITUAL_ENTITY_TYPE)))
    .orderBy(desc(favorites.createdAt))
    .all();
}

export function isRitualFavorited(userId: string, ritualId: string) {
  ensureDatabaseInitialized();

  const row = db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, RITUAL_ENTITY_TYPE), eq(favorites.entityId, ritualId)))
    .limit(1)
    .get();

  return Boolean(row);
}

export function toggleRitualFavorite(userId: string, ritualId: string) {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, RITUAL_ENTITY_TYPE), eq(favorites.entityId, ritualId)))
    .limit(1)
    .get();

  if (existing) {
    removeRitualFavorite(userId, ritualId);

    return false;
  }

  addRitualFavorite(userId, ritualId);

  return true;
}

export function addRitualFavorite(userId: string, ritualId: string) {
  ensureDatabaseInitialized();

  db.insert(favorites)
    .values({
      id: createId("favorite"),
      userId,
      entityType: RITUAL_ENTITY_TYPE,
      entityId: ritualId,
      createdAt: Date.now(),
    })
    .run();
}

export function removeRitualFavorite(userId: string, ritualId: string) {
  ensureDatabaseInitialized();

  db.delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, RITUAL_ENTITY_TYPE), eq(favorites.entityId, ritualId)))
    .run();
}

export function listJournalEntries(userId: string) {
  ensureDatabaseInitialized();

  return db
    .select({
      id: journalEntries.id,
      title: journalEntries.title,
      content: journalEntries.content,
      mood: journalEntries.mood,
      createdAt: journalEntries.createdAt,
    })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .all();
}

export function createJournalEntry(userId: string, title: string, content: string, mood?: string) {
  ensureDatabaseInitialized();

  const id = createId("journal");

  db.insert(journalEntries)
    .values({
      id,
      userId,
      title,
      content,
      mood: mood?.trim() ? mood.trim() : null,
      createdAt: Date.now(),
    })
    .run();

  return id;
}

export function updateJournalEntry(userId: string, entryId: string, title: string, content: string, mood?: string) {
  ensureDatabaseInitialized();

  db.update(journalEntries)
    .set({
      title,
      content,
      mood: mood?.trim() ? mood.trim() : null,
    })
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.id, entryId)))
    .run();
}

export function deleteJournalEntry(userId: string, entryId: string) {
  ensureDatabaseInitialized();

  db.delete(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.id, entryId)))
    .run();
}
