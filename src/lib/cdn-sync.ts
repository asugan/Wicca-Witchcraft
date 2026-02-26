import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { getCdnVersion, setCdnVersion } from "@/db/repositories/settings-repository";
import { entityLinks, libraryEntries, materials, ritualMaterials, rituals, ritualSteps } from "@/db/schema";

const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;
const FETCH_TIMEOUT_MS = 15_000;

interface CdnManifest {
  version: number;
  updatedAt: string;
}

interface CdnContent extends CdnManifest {
  rituals: (typeof rituals.$inferInsert)[];
  ritualSteps: (typeof ritualSteps.$inferInsert)[];
  materials: (typeof materials.$inferInsert)[];
  ritualMaterials: (typeof ritualMaterials.$inferInsert)[];
  entityLinks: (typeof entityLinks.$inferInsert)[];
  libraryEntries: (typeof libraryEntries.$inferInsert)[];
}

async function fetchWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function applyContent(content: CdnContent): void {
  db.transaction((tx) => {
    if (content.libraryEntries.length > 0) {
      tx.insert(libraryEntries)
        .values(content.libraryEntries)
        .onConflictDoUpdate({
          target: libraryEntries.id,
          set: {
            slug: sql`excluded.slug`,
            title: sql`excluded.title`,
            entityType: sql`excluded.entity_type`,
            summary: sql`excluded.summary`,
            spiritualProperties: sql`excluded.spiritual_properties`,
            correspondences: sql`excluded.correspondences`,
            cleansingMethod: sql`excluded.cleansing_method`,
            careNote: sql`excluded.care_note`,
            isPremium: sql`excluded.is_premium`,
          },
        })
        .run();
    }

    if (content.materials.length > 0) {
      tx.insert(materials)
        .values(content.materials)
        .onConflictDoUpdate({
          target: materials.id,
          set: {
            slug: sql`excluded.slug`,
            name: sql`excluded.name`,
            linkedEntryId: sql`excluded.linked_entry_id`,
          },
        })
        .run();
    }

    if (content.rituals.length > 0) {
      tx.insert(rituals)
        .values(content.rituals)
        .onConflictDoUpdate({
          target: rituals.id,
          set: {
            slug: sql`excluded.slug`,
            title: sql`excluded.title`,
            summary: sql`excluded.summary`,
            category: sql`excluded.category`,
            difficulty: sql`excluded.difficulty`,
            moonPhase: sql`excluded.moon_phase`,
            durationMinutes: sql`excluded.duration_minutes`,
            coverImage: sql`excluded.cover_image`,
            incantation: sql`excluded.incantation`,
            safetyNote: sql`excluded.safety_note`,
            isPremium: sql`excluded.is_premium`,
          },
        })
        .run();
    }

    if (content.ritualSteps.length > 0) {
      tx.insert(ritualSteps)
        .values(content.ritualSteps)
        .onConflictDoUpdate({
          target: ritualSteps.id,
          set: {
            ritualId: sql`excluded.ritual_id`,
            stepOrder: sql`excluded.step_order`,
            title: sql`excluded.title`,
            content: sql`excluded.content`,
          },
        })
        .run();
    }

    if (content.ritualMaterials.length > 0) {
      tx.insert(ritualMaterials)
        .values(content.ritualMaterials)
        .onConflictDoUpdate({
          target: [ritualMaterials.ritualId, ritualMaterials.materialId],
          set: {
            quantityLabel: sql`excluded.quantity_label`,
            sortOrder: sql`excluded.sort_order`,
          },
        })
        .run();
    }

    if (content.entityLinks.length > 0) {
      tx.insert(entityLinks)
        .values(content.entityLinks)
        .onConflictDoUpdate({
          target: entityLinks.id,
          set: {
            sourceEntityType: sql`excluded.source_entity_type`,
            sourceEntityId: sql`excluded.source_entity_id`,
            targetEntityType: sql`excluded.target_entity_type`,
            targetEntityId: sql`excluded.target_entity_id`,
            relationType: sql`excluded.relation_type`,
          },
        })
        .run();
    }
  });
}

export async function syncCdnContent(userId: string): Promise<void> {
  if (!CDN_BASE_URL) {
    if (__DEV__) console.warn("[cdn-sync] EXPO_PUBLIC_CDN_BASE_URL is not set — skipping sync");
    return;
  }

  try {
    const manifest = await fetchWithTimeout<CdnManifest>(`${CDN_BASE_URL}/manifest.json`);
    const localVersion = getCdnVersion(userId);

    if (manifest.version <= localVersion) {
      if (__DEV__) console.log(`[cdn-sync] Already up to date (v${localVersion})`);
      return;
    }

    const content = await fetchWithTimeout<CdnContent>(`${CDN_BASE_URL}/content.json`);

    if (content.version !== manifest.version) {
      if (__DEV__) console.warn("[cdn-sync] Version mismatch between manifest and content — aborting");
      return;
    }

    applyContent(content);
    setCdnVersion(userId, content.version);

    if (__DEV__) console.log(`[cdn-sync] Synced to v${content.version}`);
  } catch (err) {
    if (__DEV__) console.warn("[cdn-sync] Sync failed:", err);
  }
}
