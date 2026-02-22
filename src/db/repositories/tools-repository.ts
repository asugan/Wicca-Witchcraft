import { asc } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { moonEvents } from "@/db/schema";

type TimelineKind = "preparation" | "peak" | "integration";

function toEventDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function asTimelineSummary(phase: string, zodiacSign: string, kind: TimelineKind) {
  if (kind === "peak") {
    return `${phase} in ${zodiacSign} is strongest for ritual focus and clear intention setting.`;
  }

  if (kind === "preparation") {
    return `The day before ${phase} is ideal for cleansing, journaling, and gathering ritual materials.`;
  }

  return `The day after ${phase} supports grounding, reflection, and integrating insights from ${zodiacSign} themes.`;
}

export function listMoonEvents() {
  ensureDatabaseInitialized();

  return db
    .select({
      id: moonEvents.id,
      eventDate: moonEvents.eventDate,
      phase: moonEvents.phase,
      zodiacSign: moonEvents.zodiacSign,
      summary: moonEvents.summary,
    })
    .from(moonEvents)
    .orderBy(asc(moonEvents.eventDate))
    .all();
}

export function listMoonCalendarSections() {
  const events = listMoonEvents();
  const sections = new Map<string, { key: string; label: string; events: typeof events }>();

  for (const event of events) {
    const eventDate = toEventDate(event.eventDate);
    const key = formatMonthKey(eventDate);
    const existing = sections.get(key);

    if (existing) {
      existing.events.push(event);
      continue;
    }

    sections.set(key, {
      key,
      label: formatMonthLabel(eventDate),
      events: [event],
    });
  }

  return Array.from(sections.values());
}

export function listAstroTimeline() {
  const events = listMoonEvents();

  return events.flatMap((event) => {
    const peakDate = toEventDate(event.eventDate);
    const dayBefore = new Date(peakDate);
    dayBefore.setDate(peakDate.getDate() - 1);

    const dayAfter = new Date(peakDate);
    dayAfter.setDate(peakDate.getDate() + 1);

    return [
      {
        id: `${event.id}-prep`,
        dateLabel: formatDayLabel(dayBefore),
        rawDate: dayBefore.toISOString().slice(0, 10),
        title: `Prepare for ${event.phase}`,
        kind: "preparation" as const,
        summary: asTimelineSummary(event.phase, event.zodiacSign, "preparation"),
      },
      {
        id: `${event.id}-peak`,
        dateLabel: formatDayLabel(peakDate),
        rawDate: event.eventDate,
        title: `${event.phase} in ${event.zodiacSign}`,
        kind: "peak" as const,
        summary: asTimelineSummary(event.phase, event.zodiacSign, "peak"),
      },
      {
        id: `${event.id}-integrate`,
        dateLabel: formatDayLabel(dayAfter),
        rawDate: dayAfter.toISOString().slice(0, 10),
        title: `${event.phase} Integration`,
        kind: "integration" as const,
        summary: asTimelineSummary(event.phase, event.zodiacSign, "integration"),
      },
    ];
  });
}
