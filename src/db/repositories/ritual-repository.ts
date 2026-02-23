import { asc, eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { libraryEntries, materials, ritualMaterials, rituals, ritualSteps } from "@/db/schema";

export type RitualListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  difficulty: string;
  moonPhase: string;
  durationMinutes: number;
  coverImage: string;
  materials: string[];
  isPremium: boolean;
};

export function listRituals(limit?: number): RitualListItem[] {
  ensureDatabaseInitialized();

  const ritualRows = db
    .select({
      id: rituals.id,
      slug: rituals.slug,
      title: rituals.title,
      summary: rituals.summary,
      category: rituals.category,
      difficulty: rituals.difficulty,
      moonPhase: rituals.moonPhase,
      durationMinutes: rituals.durationMinutes,
      coverImage: rituals.coverImage,
      isPremium: rituals.isPremium,
    })
    .from(rituals)
    .orderBy(asc(rituals.createdAt))
    .all();

  const ritualMaterialRows = db
    .select({
      ritualId: ritualMaterials.ritualId,
      materialName: materials.name,
    })
    .from(ritualMaterials)
    .innerJoin(materials, eq(ritualMaterials.materialId, materials.id))
    .all();

  const materialsByRitual = new Map<string, string[]>();

  for (const row of ritualMaterialRows) {
    const existingMaterials = materialsByRitual.get(row.ritualId);

    if (existingMaterials) {
      existingMaterials.push(row.materialName);
      continue;
    }

    materialsByRitual.set(row.ritualId, [row.materialName]);
  }

  const rows = ritualRows.map((row) => ({
    ...row,
    isPremium: row.isPremium ?? false,
    materials: materialsByRitual.get(row.id) ?? [],
  }));

  if (!limit) {
    return rows;
  }

  return rows.slice(0, limit);
}

export function getRitualBySlug(slug: string) {
  ensureDatabaseInitialized();

  return db.select().from(rituals).where(eq(rituals.slug, slug)).get() ?? null;
}

export function getRitualDetailBySlug(slug: string) {
  ensureDatabaseInitialized();

  const ritual = getRitualBySlug(slug);

  if (!ritual) {
    return null;
  }

  const steps = db
    .select({
      id: ritualSteps.id,
      stepOrder: ritualSteps.stepOrder,
      title: ritualSteps.title,
      content: ritualSteps.content,
    })
    .from(ritualSteps)
    .where(eq(ritualSteps.ritualId, ritual.id))
    .orderBy(asc(ritualSteps.stepOrder))
    .all();

  const linkedMaterials = db
    .select({
      id: materials.id,
      name: materials.name,
      quantityLabel: ritualMaterials.quantityLabel,
      sortOrder: ritualMaterials.sortOrder,
      linkedEntryId: libraryEntries.id,
      linkedEntrySlug: libraryEntries.slug,
      linkedEntryTitle: libraryEntries.title,
      linkedEntrySummary: libraryEntries.summary,
      linkedEntryType: libraryEntries.entityType,
      linkedEntryProperties: libraryEntries.spiritualProperties,
      linkedEntryCorrespondences: libraryEntries.correspondences,
      linkedEntryCleansingMethod: libraryEntries.cleansingMethod,
      linkedEntryCareNote: libraryEntries.careNote,
    })
    .from(ritualMaterials)
    .innerJoin(materials, eq(ritualMaterials.materialId, materials.id))
    .leftJoin(libraryEntries, eq(materials.linkedEntryId, libraryEntries.id))
    .where(eq(ritualMaterials.ritualId, ritual.id))
    .orderBy(asc(ritualMaterials.sortOrder))
    .all();

  return {
    ritual,
    steps,
    materials: linkedMaterials,
  };
}
