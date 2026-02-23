import { and, eq, sql } from "drizzle-orm";

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

  db.insert(tarotReadings)
    .values({
      id: readingId,
      userId,
      spreadType: "daily",
      cardsJson: JSON.stringify(drawnCards),
      createdAt: Date.now(),
      readingDate: todayIso,
    })
    .run();

  return hydrateReading(
    db.select().from(tarotReadings).where(eq(tarotReadings.id, readingId)).get()!
  );
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

  db.insert(tarotReadings)
    .values({
      id: readingId,
      userId,
      spreadType: "three_card",
      cardsJson: JSON.stringify(drawnCards),
      createdAt: Date.now(),
      readingDate: todayIso,
    })
    .run();

  return hydrateReading(
    db.select().from(tarotReadings).where(eq(tarotReadings.id, readingId)).get()!
  );
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

function hydrateReading(
  reading: typeof tarotReadings.$inferSelect
): TarotReadingResult {
  const drawnCards: DrawnCard[] = JSON.parse(reading.cardsJson);

  const cards = drawnCards
    .map((drawn) => {
      const card = db
        .select()
        .from(tarotCards)
        .where(eq(tarotCards.id, drawn.cardId))
        .get();

      if (!card) return null;

      return {
        ...card,
        position: drawn.position,
        isReversed: drawn.isReversed,
      };
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
