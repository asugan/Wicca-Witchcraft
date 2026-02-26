import { eq } from "drizzle-orm";

import { REVENUECAT_PRO_ENTITLEMENT_ID } from "@/config/revenuecat";
import { db } from "@/db/client";
import { subscriptionCache } from "@/db/schema";

export function hasProAccess(): boolean {

  const row = db
    .select({ isActive: subscriptionCache.isActive })
    .from(subscriptionCache)
    .where(eq(subscriptionCache.entitlement, REVENUECAT_PRO_ENTITLEMENT_ID))
    .limit(1)
    .get();

  return row?.isActive === true;
}

export function updateProAccessCache(isActive: boolean, expiresAt: string | null = null): void {

  const now = new Date().toISOString();

  db.insert(subscriptionCache)
    .values({
      entitlement: REVENUECAT_PRO_ENTITLEMENT_ID,
      isActive,
      updatedAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: subscriptionCache.entitlement,
      set: {
        isActive,
        updatedAt: now,
        expiresAt,
      },
    })
    .run();
}
