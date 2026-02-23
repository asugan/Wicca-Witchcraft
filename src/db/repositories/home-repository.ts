import { asc, eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { dailyCards, rituals } from "@/db/schema";
import { getCurrentMoonInfo } from "@/lib/moon";

const weekdayIntentions = [
  "I soften my pace and listen to what my intuition already knows.",
  "I protect my focus and move with grounded purpose.",
  "I welcome aligned opportunities through clear choices.",
  "I trust my craft and stay devoted to steady practice.",
  "I speak with heart and invite harmony into my connections.",
  "I honor joy, beauty, and the sacred in ordinary moments.",
  "I reset, release, and prepare my spirit for a fresh cycle.",
] as const;

const weekdayCategoryBias = ["healing", "protection", "abundance", "ritual", "love", "moon", "beginner"] as const;

const fallbackMoonSummaryByKey: Record<string, string> = {
  new: "Quiet beginnings support intention setting and inner listening.",
  "waxing-crescent": "Build momentum with small, consistent ritual actions.",
  "first-quarter": "Choose courage and take practical action on your intention.",
  "waxing-gibbous": "Refine details and prepare for visible energetic results.",
  full: "Peak lunar energy favors release, clarity, and emotional truth.",
  "waning-gibbous": "Integrate what you learned and share wisdom thoughtfully.",
  "third-quarter": "Reassess priorities and release habits that have run their course.",
  "waning-crescent": "Rest, cleanse, and release what no longer serves you.",
  "waning-moon": "Close energetic loops and protect your boundaries.",
  "waxing-moon": "Nurture growth with patience, devotion, and aligned effort.",
  any: "Tune in gently and choose one intentional practice for today.",
};

export type HomeDailySnapshot = {
  dateLabel: string;
  cosmicLabel: string;
  intention: string;
  moon: {
    phase: string;
    phaseKey: string;
    illumination: string;
    summary: string;
  };
  card: {
    id: string;
    cardName: string;
    arcana: string;
    uprightMeaning: string;
  } | null;
  recommendation: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    moonPhase: string;
    durationMinutes: number;
  } | null;
};

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeMoonPhaseKey(phase: string) {
  const normalized = phase
    .trim()
    .toLowerCase()
    .replace(/moon/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized === "waning") {
    return "waning-moon";
  }

  if (normalized === "waxing") {
    return "waxing-moon";
  }

  return normalized || "any";
}

function scoreRitual(
  ritual: { category: string; moonPhase: string; difficulty: string },
  preferredCategory: string,
  moonPhaseKey: string
) {
  let score = 0;

  if (ritual.moonPhase === moonPhaseKey) {
    score += 6;
  }

  if (moonPhaseKey.startsWith("waxing") && ritual.moonPhase.startsWith("waxing")) {
    score += 3;
  }

  if (moonPhaseKey.startsWith("waning") && ritual.moonPhase.startsWith("waning")) {
    score += 3;
  }

  if (ritual.category === preferredCategory) {
    score += 2;
  }

  if (ritual.difficulty === "beginner") {
    score += 1;
  }

  return score;
}

export function getHomeDailySnapshot(date = new Date()): HomeDailySnapshot {
  ensureDatabaseInitialized();

  const todayIso = toIsoDate(date);

  const moonInfo = getCurrentMoonInfo(date);
  const moonPhaseKey = normalizeMoonPhaseKey(moonInfo.phaseKey);

  const dailyCard =
    db
      .select({
        id: dailyCards.id,
        cardName: dailyCards.cardName,
        arcana: dailyCards.arcana,
        uprightMeaning: dailyCards.uprightMeaning,
      })
      .from(dailyCards)
      .where(eq(dailyCards.drawDate, todayIso))
      .limit(1)
      .get() ??
    db
      .select({
        id: dailyCards.id,
        cardName: dailyCards.cardName,
        arcana: dailyCards.arcana,
        uprightMeaning: dailyCards.uprightMeaning,
      })
      .from(dailyCards)
      .where(eq(dailyCards.drawDate, "default"))
      .limit(1)
      .get() ??
    null;

  const ritualRows = db
    .select({
      id: rituals.id,
      slug: rituals.slug,
      title: rituals.title,
      summary: rituals.summary,
      category: rituals.category,
      moonPhase: rituals.moonPhase,
      difficulty: rituals.difficulty,
      durationMinutes: rituals.durationMinutes,
      createdAt: rituals.createdAt,
    })
    .from(rituals)
    .orderBy(asc(rituals.createdAt))
    .all();

  const preferredCategory = weekdayCategoryBias[date.getDay()];

  const recommendation =
    ritualRows
      .map((ritual) => ({
        ritual,
        score: scoreRitual(ritual, preferredCategory, moonPhaseKey),
      }))
      .sort((a, b) => b.score - a.score || a.ritual.createdAt - b.ritual.createdAt)[0]?.ritual ?? null;

  return {
    dateLabel: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
    cosmicLabel: `${moonInfo.zodiacSign} Moon`,
    intention: weekdayIntentions[date.getDay()],
    moon: {
      phase: moonInfo.phaseName,
      phaseKey: moonPhaseKey,
      illumination: `${moonInfo.illuminationPercent}%`,
      summary: moonInfo.summary ?? fallbackMoonSummaryByKey[moonPhaseKey] ?? fallbackMoonSummaryByKey.any,
    },
    card: dailyCard,
    recommendation,
  };
}
