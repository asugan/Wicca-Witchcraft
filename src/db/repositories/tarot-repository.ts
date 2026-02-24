import { and, eq, inArray, sql } from "drizzle-orm";

import { PREMIUM_SPREAD_TYPES, SPREAD_CONFIGS, type SpreadType } from "@/config/premium";
import { db, ensureDatabaseInitialized } from "@/db/client";
import { tarotCards, tarotReadings } from "@/db/schema";
import type { TarotCardRecord } from "@/db/schema";

export type DrawnCard = {
  cardId: string;
  position: string;
  isReversed: boolean;
};

export type TarotReadingResult = {
  id: string;
  spreadType: string;
  readingDate: string;
  createdAt: number;
  cards: (TarotCardRecord & { position: string; isReversed: boolean })[];
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Pick `count` unique random cards from the deck.
 * Each card has a 30% chance of being reversed.
 */
function pickRandomCards(allCards: TarotCardRecord[], count: number): DrawnCard[] {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((card, index) => ({
    cardId: card.id,
    position: String(index),
    isReversed: Math.random() < 0.3,
  }));
}

/**
 * Get all 78 tarot cards from the database.
 */
export function getAllTarotCards(): TarotCardRecord[] {
  ensureDatabaseInitialized();
  return db.select().from(tarotCards).all();
}

/**
 * Get a single tarot card by ID.
 */
export function getTarotCardById(cardId: string): TarotCardRecord | undefined {
  ensureDatabaseInitialized();
  return db.select().from(tarotCards).where(eq(tarotCards.id, cardId)).get();
}

/**
 * Get or draw the daily tarot card for a given date and user.
 * If a daily reading already exists for today, return it.
 * Otherwise draw a new card and persist it.
 */
export function getDailyCard(userId: string, date = new Date()): TarotReadingResult {
  ensureDatabaseInitialized();

  const todayIso = toIsoDate(date);

  const existing = db
    .select()
    .from(tarotReadings)
    .where(
      and(
        eq(tarotReadings.userId, userId),
        eq(tarotReadings.spreadType, "daily"),
        eq(tarotReadings.readingDate, todayIso)
      )
    )
    .get();

  if (existing) {
    return hydrateReading(existing);
  }

  const allCards = getAllTarotCards();

  if (allCards.length === 0) {
    throw new Error("Tarot deck is empty. Ensure seed data has been loaded.");
  }

  // Use date-based seed for consistent daily card per date
  const dateSeed = hashDateToIndex(todayIso, allCards.length);
  const selectedCard = allCards[dateSeed];
  const isReversed = hashDateToIndex(todayIso + "-rev", 100) < 30;

  const drawnCards: DrawnCard[] = [
    { cardId: selectedCard.id, position: "daily", isReversed },
  ];

  const readingId = `daily-${todayIso}-${generateId()}`;
  const now = Date.now();

  db.insert(tarotReadings)
    .values({
      id: readingId,
      userId,
      spreadType: "daily",
      cardsJson: JSON.stringify(drawnCards),
      createdAt: now,
      readingDate: todayIso,
    })
    .run();

  return buildReadingResult(readingId, "daily", todayIso, now, drawnCards, allCards);
}

/**
 * Draw a new 3-card spread (Past / Present / Future).
 * Always creates a new reading (users can draw multiple spreads per day).
 */
export function drawThreeCardSpread(userId: string): TarotReadingResult {
  ensureDatabaseInitialized();

  const allCards = getAllTarotCards();
  const positions = ["past", "present", "future"];
  const picked = pickRandomCards(allCards, 3);

  const drawnCards: DrawnCard[] = picked.map((card, index) => ({
    ...card,
    position: positions[index],
  }));

  const readingId = `spread-${generateId()}`;
  const todayIso = toIsoDate(new Date());
  const now = Date.now();

  db.insert(tarotReadings)
    .values({
      id: readingId,
      userId,
      spreadType: "three_card",
      cardsJson: JSON.stringify(drawnCards),
      createdAt: now,
      readingDate: todayIso,
    })
    .run();

  return buildReadingResult(readingId, "three_card", todayIso, now, drawnCards, allCards);
}

/**
 * Get reading history for a user, most recent first.
 */
export function getReadingHistory(userId: string, limit = 20): TarotReadingResult[] {
  ensureDatabaseInitialized();

  const readings = db
    .select()
    .from(tarotReadings)
    .where(eq(tarotReadings.userId, userId))
    .orderBy(sql`${tarotReadings.createdAt} DESC`)
    .limit(limit)
    .all();

  return readings.map(hydrateReading);
}

// --- Internal helpers ---

/**
 * Build a TarotReadingResult from in-memory data, avoiding any DB re-query.
 * Used immediately after an insert when we already hold the drawn cards and full deck.
 */
function buildReadingResult(
  id: string,
  spreadType: string,
  readingDate: string,
  createdAt: number,
  drawnCards: DrawnCard[],
  allCards: TarotCardRecord[]
): TarotReadingResult {
  const cardMap = new Map(allCards.map((c) => [c.id, c]));

  const cards = drawnCards
    .map((drawn) => {
      const card = cardMap.get(drawn.cardId);
      if (!card) return null;
      return { ...card, position: drawn.position, isReversed: drawn.isReversed };
    })
    .filter(Boolean) as TarotReadingResult["cards"];

  return { id, spreadType, readingDate, createdAt, cards };
}

/**
 * Hydrate a persisted reading row by fetching all referenced cards in a single query.
 * Used for cache-hit reads and reading history.
 */
function hydrateReading(
  reading: typeof tarotReadings.$inferSelect
): TarotReadingResult {
  const drawnCards: DrawnCard[] = JSON.parse(reading.cardsJson);

  const cardIds = drawnCards.map((d) => d.cardId);
  const cardRows =
    cardIds.length > 0
      ? db.select().from(tarotCards).where(inArray(tarotCards.id, cardIds)).all()
      : [];

  const cardMap = new Map(cardRows.map((c) => [c.id, c]));

  const cards = drawnCards
    .map((drawn) => {
      const card = cardMap.get(drawn.cardId);
      if (!card) return null;
      return { ...card, position: drawn.position, isReversed: drawn.isReversed };
    })
    .filter(Boolean) as TarotReadingResult["cards"];

  return {
    id: reading.id,
    spreadType: reading.spreadType,
    readingDate: reading.readingDate,
    createdAt: reading.createdAt,
    cards,
  };
}

/**
 * Simple deterministic hash so the same date always picks the same card.
 */
function hashDateToIndex(input: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return ((hash % mod) + mod) % mod;
}

/**
 * Check if a spread type requires premium access.
 */
export function isSpreadPremium(spreadType: SpreadType): boolean {
  return PREMIUM_SPREAD_TYPES.includes(spreadType);
}

/**
 * Get the spread configuration for a given type.
 */
export function getSpreadConfig(spreadType: SpreadType) {
  return SPREAD_CONFIGS[spreadType];
}

/**
 * Draw a generic spread of any type.
 * Creates a new reading with the specified spread type.
 */
export function drawSpread(userId: string, spreadType: SpreadType): TarotReadingResult {
  ensureDatabaseInitialized();

  const config = SPREAD_CONFIGS[spreadType];
  const allCards = getAllTarotCards();
  const picked = pickRandomCards(allCards, config.cardCount);

  const drawnCards: DrawnCard[] = picked.map((card, index) => ({
    ...card,
    position: config.positions[index],
  }));

  const readingId = `${spreadType}-${generateId()}`;
  const todayIso = toIsoDate(new Date());
  const now = Date.now();

  db.insert(tarotReadings)
    .values({
      id: readingId,
      userId,
      spreadType,
      cardsJson: JSON.stringify(drawnCards),
      createdAt: now,
      readingDate: todayIso,
    })
    .run();

  return buildReadingResult(readingId, spreadType, todayIso, now, drawnCards, allCards);
}

/**
 * Get available spread types with their premium status.
 */
export function getAvailableSpreads(): { type: SpreadType; isPremium: boolean; cardCount: number }[] {
  return (Object.keys(SPREAD_CONFIGS) as SpreadType[])
    .filter((type) => type !== "daily") // Exclude daily from the spread picker
    .map((type) => ({
      type,
      isPremium: isSpreadPremium(type),
      cardCount: SPREAD_CONFIGS[type].cardCount,
    }));
}
