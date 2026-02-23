import type {
  BillingCycle,
  RevenueCatPaywallData,
  RevenueCatPurchaseOutcome,
} from "@/features/subscription/revenuecat.types";

export async function initRevenueCat(): Promise<boolean> {
  return false;
}

export async function syncProEntitlementFromRevenueCat(): Promise<boolean> {
  return false;
}

export async function getRevenueCatPaywallData(): Promise<RevenueCatPaywallData> {
  return {
    isConfigured: false,
    offeringIdentifier: null,
    plans: {},
  };
}

export async function purchaseRevenueCatPlan(_cycle?: BillingCycle): Promise<RevenueCatPurchaseOutcome> {
  throw new Error("RevenueCat purchases are unavailable on this platform.");
}

export async function restoreRevenueCatPurchases(): Promise<boolean> {
  throw new Error("RevenueCat purchases are unavailable on this platform.");
}

export async function presentRevenueCatCustomerCenter(): Promise<void> {
  throw new Error("Subscription management is unavailable on this platform.");
}

export type {
  BillingCycle,
  RevenueCatPaywallData,
  RevenueCatPaywallPlan,
  RevenueCatPurchaseOutcome,
} from "@/features/subscription/revenuecat.types";
