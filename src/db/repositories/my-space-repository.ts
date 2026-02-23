import { and, count, desc, eq } from "drizzle-orm";

import { FREE_JOURNAL_LIMIT } from "@/config/premium";
import { db, ensureDatabaseInitialized } from "@/db/client";
import { favorites, journalEntries, rituals } from "@/db/schema";

const RITUAL_ENTITY_TYPE = "ritual";
const LIBRARY_ENTRY_ENTITY_TYPE = "library_entry";

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

export function isLibraryEntryFavorited(userId: string, entryId: string) {
  ensureDatabaseInitialized();

  const row = db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, LIBRARY_ENTRY_ENTITY_TYPE), eq(favorites.entityId, entryId)))
    .limit(1)
    .get();

  return Boolean(row);
}

export function toggleLibraryEntryFavorite(userId: string, entryId: string) {
  ensureDatabaseInitialized();

  const existing = db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.entityType, LIBRARY_ENTRY_ENTITY_TYPE), eq(favorites.entityId, entryId)))
    .limit(1)
    .get();

  if (existing) {
    db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.entityType, LIBRARY_ENTRY_ENTITY_TYPE), eq(favorites.entityId, entryId)))
      .run();

    return false;
  }

  db.insert(favorites)
    .values({
      id: createId("favorite"),
      userId,
      entityType: LIBRARY_ENTRY_ENTITY_TYPE,
      entityId: entryId,
      createdAt: Date.now(),
    })
    .run();

  return true;
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

export function getJournalEntryCount(userId: string): number {
  ensureDatabaseInitialized();

  const result = db
    .select({ value: count() })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .get();

  return result?.value ?? 0;
}

export function canCreateJournalEntry(userId: string, isPremium: boolean): boolean {
  if (isPremium) {
    return true;
  }

  const currentCount = getJournalEntryCount(userId);
  return currentCount < FREE_JOURNAL_LIMIT;
}

export function getJournalRemainingCount(userId: string, isPremium: boolean): number {
  if (isPremium) {
    return -1; // Unlimited
  }

  const currentCount = getJournalEntryCount(userId);
  return Math.max(0, FREE_JOURNAL_LIMIT - currentCount);
}
