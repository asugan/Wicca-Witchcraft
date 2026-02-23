import { asc } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { libraryEntries } from "@/db/schema";

export function listLibraryEntries() {
  ensureDatabaseInitialized();

  return db
    .select({
      id: libraryEntries.id,
      slug: libraryEntries.slug,
      title: libraryEntries.title,
      entityType: libraryEntries.entityType,
      summary: libraryEntries.summary,
      correspondences: libraryEntries.correspondences,
      isPremium: libraryEntries.isPremium,
    })
    .from(libraryEntries)
    .orderBy(asc(libraryEntries.entityType), asc(libraryEntries.title))
    .all();
}

export function listLibraryCategoryCounts() {
  const entries = listLibraryEntries();
  const grouped = new Map<string, number>();

  for (const entry of entries) {
    grouped.set(entry.entityType, (grouped.get(entry.entityType) ?? 0) + 1);
  }

  return Array.from(grouped.entries()).map(([entityType, count]) => ({ entityType, count }));
}
