/**
 * Generates versioned CDN content files from TypeScript seed data.
 *
 * Output:
 *   docs/manifest.json  — tiny version file; app fetches this first to detect updates
 *   docs/content.json   — full content payload; app fetches & upserts when version changes
 *
 * Usage:
 *   npx tsx scripts/generate-content-json.ts
 *   (or add "cdn:generate": "tsx scripts/generate-content-json.ts" to package.json)
 *
 * When to re-run:
 *   Any time rituals, library entries, or materials change.
 *   Bump CONTENT_VERSION so devices know to re-download.
 */

import {
  ENTITY_LINK_SEEDS,
  MATERIAL_SEEDS,
  RITUAL_MATERIAL_SEEDS,
  RITUAL_SEEDS,
  RITUAL_STEP_SEEDS,
} from "../src/db/ritual-seed-data";
import { LIBRARY_ENTRY_SEEDS } from "../src/db/library-seed-data";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ─── Bump this whenever you publish new/changed content ──────────────────────
const CONTENT_VERSION = 1;
// ─────────────────────────────────────────────────────────────────────────────

// Fixed base so createdAt values are deterministic across script runs
const BASE_CREATED_AT = 1704067200000; // 2024-01-01T00:00:00Z

const updatedAt = new Date().toISOString().split("T")[0];

const content = {
  version: CONTENT_VERSION,
  updatedAt,
  rituals: RITUAL_SEEDS.map((r, i) => ({
    ...r,
    createdAt: BASE_CREATED_AT + i,
  })),
  ritualSteps: [...RITUAL_STEP_SEEDS],
  materials: [...MATERIAL_SEEDS],
  ritualMaterials: [...RITUAL_MATERIAL_SEEDS],
  entityLinks: [...ENTITY_LINK_SEEDS],
  libraryEntries: LIBRARY_ENTRY_SEEDS.map((e) => ({
    ...e,
    isPremium: e.isPremium ?? false,
  })),
};

const manifest = {
  version: CONTENT_VERSION,
  updatedAt,
};

const outDir = join(process.cwd(), "docs");
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "content.json"), JSON.stringify(content, null, 2), "utf-8");
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

console.log("✓ docs/content.json");
console.log(`    rituals        : ${content.rituals.length}`);
console.log(`    ritualSteps    : ${content.ritualSteps.length}`);
console.log(`    materials      : ${content.materials.length}`);
console.log(`    ritualMaterials: ${content.ritualMaterials.length}`);
console.log(`    entityLinks    : ${content.entityLinks.length}`);
console.log(`    libraryEntries : ${content.libraryEntries.length}`);
console.log(`✓ docs/manifest.json  (version: ${CONTENT_VERSION}, updatedAt: ${updatedAt})`);
