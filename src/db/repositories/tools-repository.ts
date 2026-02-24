import { generateMoonEvents } from "@/lib/moon";
import { toLocalIsoDate } from "@/lib/date-utils";

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
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  const end = new Date(now);
  end.setDate(end.getDate() + 180);

  return generateMoonEvents(start, end);
}

function buildMoonCalendarSections(events: ReturnType<typeof listMoonEvents>) {
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

function buildAstroTimeline(events: ReturnType<typeof listMoonEvents>) {
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
        rawDate: toLocalIsoDate(dayBefore),
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
        rawDate: toLocalIsoDate(dayAfter),
        title: `${event.phase} Integration`,
        kind: "integration" as const,
        summary: asTimelineSummary(event.phase, event.zodiacSign, "integration"),
      },
    ];
  });
}

export function listMoonCalendarSections() {
  return buildMoonCalendarSections(listMoonEvents());
}

export function listAstroTimeline() {
  return buildAstroTimeline(listMoonEvents());
}

export function getMoonData() {
  const events = listMoonEvents();
  return {
    sections: buildMoonCalendarSections(events),
    timeline: buildAstroTimeline(events),
  };
}
