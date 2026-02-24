import { asc, count, eq } from "drizzle-orm";

import { db, ensureDatabaseInitialized } from "@/db/client";
import { libraryEntries } from "@/db/schema";

export function getLibraryEntryBySlug(slug: string) {
  ensureDatabaseInitialized();

  return db.select().from(libraryEntries).where(eq(libraryEntries.slug, slug)).get();
}

export function listLibraryEntries() {
  ensureDatabaseInitialized();

  return db
    .select({
      id: libraryEntries.id,
      slug: libraryEntries.slug,
      title: libraryEntries.title,
      entityType: libraryEntries.entityType,
      summary: libraryEntries.summary,
      isPremium: libraryEntries.isPremium,
    })
    .from(libraryEntries)
    .orderBy(asc(libraryEntries.entityType), asc(libraryEntries.title))
    .all();
}

export function listLibraryCategoryCounts() {
  ensureDatabaseInitialized();

  return db
    .select({
      entityType: libraryEntries.entityType,
      count: count(),
    })
    .from(libraryEntries)
    .groupBy(libraryEntries.entityType)
    .all();
}
