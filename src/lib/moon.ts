import SunCalc from "suncalc";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

type PhaseInfo = {
  phaseKey: string;
  phaseName: string;
  illuminationPercent: number;
  phaseNumber: number;
};

export type MoonInfo = {
  phaseKey: string;
  phaseName: string;
  illuminationPercent: number;
  zodiacSign: ZodiacSign;
  summary: string;
};

export type MoonEvent = {
  id: string;
  eventDate: string;
  phase: string;
  zodiacSign: string;
  summary: string;
};

const PHASE_SUMMARIES: Record<string, string> = {
  new: "Quiet beginnings support intention setting and inner listening.",
  "waxing-crescent": "Build momentum with small, consistent ritual actions.",
  "first-quarter": "Choose courage and take practical action on your intention.",
  "waxing-gibbous": "Refine details and prepare for visible energetic results.",
  full: "Peak lunar energy favors release, clarity, and emotional truth.",
  "waning-gibbous": "Integrate what you learned and share wisdom thoughtfully.",
  "third-quarter": "Reassess priorities and release habits that have run their course.",
  "waning-crescent": "Rest, cleanse, and release what no longer serves you.",
};

const ZODIAC_THEMES: Record<ZodiacSign, string> = {
  Aries: "courage and fresh initiative",
  Taurus: "stability and grounded abundance",
  Gemini: "communication and flexible thinking",
  Cancer: "emotional depth and nurturing",
  Leo: "confidence and creative expression",
  Virgo: "clarity and mindful refinement",
  Libra: "balance and relationship harmony",
  Scorpio: "transformation and deep insight",
  Sagittarius: "expansion and philosophical growth",
  Capricorn: "discipline and structured ambition",
  Aquarius: "innovation and collective vision",
  Pisces: "intuition and spiritual connection",
};

export function getMoonPhaseForDate(date: Date): PhaseInfo {
  const illumination = SunCalc.getMoonIllumination(date);
  const phase = illumination.phase;
  const percent = Math.round(illumination.fraction * 100);

  let phaseKey: string;
  let phaseName: string;

  if (phase < 0.04 || phase >= 0.96) {
    phaseKey = "new";
    phaseName = "New Moon";
  } else if (phase < 0.21) {
    phaseKey = "waxing-crescent";
    phaseName = "Waxing Crescent";
  } else if (phase < 0.29) {
    phaseKey = "first-quarter";
    phaseName = "First Quarter";
  } else if (phase < 0.46) {
    phaseKey = "waxing-gibbous";
    phaseName = "Waxing Gibbous";
  } else if (phase < 0.54) {
    phaseKey = "full";
    phaseName = "Full Moon";
  } else if (phase < 0.71) {
    phaseKey = "waning-gibbous";
    phaseName = "Waning Gibbous";
  } else if (phase < 0.79) {
    phaseKey = "third-quarter";
    phaseName = "Third Quarter";
  } else {
    phaseKey = "waning-crescent";
    phaseName = "Waning Crescent";
  }

  return { phaseKey, phaseName, illuminationPercent: percent, phaseNumber: phase };
}

/**
 * Compute ecliptic longitude of the Moon using a simplified Jean Meeus algorithm.
 * Accuracy is ~1° which is sufficient for zodiac sign determination.
 */
function getMoonEclipticLongitude(date: Date): number {
  const JD = toJulianDay(date);
  const T = (JD - 2451545.0) / 36525.0;

  // Mean longitude of the Moon (L')
  const Lp =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    (T * T * T) / 538841.0 -
    (T * T * T * T) / 65194000.0;

  // Mean elongation of the Moon (D)
  const D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868.0 -
    (T * T * T * T) / 113065000.0;

  // Sun's mean anomaly (M)
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0;

  // Moon's mean anomaly (M')
  const Mp =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699.0 -
    (T * T * T * T) / 14712000.0;

  // Moon's argument of latitude (F)
  const F =
    93.272095 +
    483202.0175233 * T -
    0.0036539 * T * T -
    (T * T * T) / 3526000.0 +
    (T * T * T * T) / 863310000.0;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Principal perturbation terms for longitude
  const longitude =
    Lp +
    6.289 * Math.sin(toRad(Mp)) +
    1.274 * Math.sin(toRad(2 * D - Mp)) +
    0.658 * Math.sin(toRad(2 * D)) +
    0.214 * Math.sin(toRad(2 * Mp)) -
    0.186 * Math.sin(toRad(M)) -
    0.114 * Math.sin(toRad(2 * F));

  return ((longitude % 360) + 360) % 360;
}

function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  const a = Math.floor((14 - m) / 12);
  const yAdj = y + 4800 - a;
  const mAdj = m + 12 * a - 3;

  return (
    d +
    Math.floor((153 * mAdj + 2) / 5) +
    365 * yAdj +
    Math.floor(yAdj / 4) -
    Math.floor(yAdj / 100) +
    Math.floor(yAdj / 400) -
    32045.5
  );
}

export function getMoonZodiacSign(date: Date): ZodiacSign {
  const longitude = getMoonEclipticLongitude(date);
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[index];
}

export function getCurrentMoonInfo(date = new Date()): MoonInfo {
  const phase = getMoonPhaseForDate(date);
  const zodiacSign = getMoonZodiacSign(date);
  const summary =
    PHASE_SUMMARIES[phase.phaseKey] ?? "Tune in gently and choose one intentional practice for today.";

  return {
    phaseKey: phase.phaseKey,
    phaseName: phase.phaseName,
    illuminationPercent: phase.illuminationPercent,
    zodiacSign,
    summary,
  };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function makeMoonEventSummary(phaseName: string, zodiacSign: ZodiacSign): string {
  const theme = ZODIAC_THEMES[zodiacSign] ?? "aligned energy";
  return `${phaseName} in ${zodiacSign} supports ${theme}.`;
}

const MAJOR_PHASE_KEYS = new Set(["new", "full", "first-quarter", "third-quarter"]);

export function generateMoonEvents(
  startDate: Date,
  endDate: Date,
  options?: { majorOnly?: boolean }
): MoonEvent[] {
  const events: MoonEvent[] = [];
  const current = new Date(startDate);
  current.setHours(12, 0, 0, 0);

  let prevPhaseKey = getMoonPhaseForDate(current).phaseKey;
  current.setDate(current.getDate() + 1);

  while (current <= endDate) {
    const phase = getMoonPhaseForDate(current);

    if (phase.phaseKey !== prevPhaseKey && MAJOR_PHASE_KEYS.has(phase.phaseKey)) {
      if (!options?.majorOnly || phase.phaseKey === "new" || phase.phaseKey === "full") {
        const zodiacSign = getMoonZodiacSign(current);
        const dateStr = toIsoDate(current);

        events.push({
          id: `moon-${dateStr}-${phase.phaseKey}`,
          eventDate: dateStr,
          phase: phase.phaseName,
          zodiacSign,
          summary: makeMoonEventSummary(phase.phaseName, zodiacSign),
        });
      }
    }

    prevPhaseKey = phase.phaseKey;
    current.setDate(current.getDate() + 1);
  }

  return events;
}
