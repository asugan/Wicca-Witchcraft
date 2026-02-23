import { Platform } from "react-native";
import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_IOS_API_KEY,
  REVENUECAT_OFFERING_ID,
  REVENUECAT_PRO_ENTITLEMENT_ID,
} from "@/config/revenuecat";
import { updateProAccessCache } from "@/db/repositories/subscription-repository";
import type {
  BillingCycle,
  RevenueCatPaywallData,
  RevenueCatPaywallPlan,
  RevenueCatPurchaseOutcome,
} from "@/features/subscription/revenuecat.types";

let hasConfigured = false;
let hasCustomerInfoListener = false;

function getApiKeyForPlatform(): string {
  if (Platform.OS === "ios") {
    return REVENUECAT_IOS_API_KEY;
  }

  if (Platform.OS === "android") {
    return REVENUECAT_ANDROID_API_KEY;
  }

  return "";
}

function inferCycleFromSubscriptionPeriod(subscriptionPeriod: string | null): BillingCycle | null {
  if (!subscriptionPeriod) {
    return null;
  }

  const normalizedPeriod = subscriptionPeriod.toUpperCase();

  if (normalizedPeriod === "P1Y" || normalizedPeriod === "P12M") {
    return "yearly";
  }

  if (normalizedPeriod === "P1M") {
    return "monthly";
  }

  return null;
}

function inferPlanCycle(pkg: PurchasesPackage): BillingCycle | null {
  switch (pkg.packageType) {
    case Purchases.PACKAGE_TYPE.ANNUAL:
      return "yearly";
    case Purchases.PACKAGE_TYPE.MONTHLY:
      return "monthly";
    case Purchases.PACKAGE_TYPE.LIFETIME:
      return "oneTime";
    default:
      break;
  }

  const periodCycle = inferCycleFromSubscriptionPeriod(pkg.product.subscriptionPeriod);
  if (periodCycle) {
    return periodCycle;
  }

  if (!pkg.product.subscriptionPeriod) {
    return "oneTime";
  }

  const normalizedIdentifier = `${pkg.identifier}_${pkg.product.identifier}`.toLowerCase();

  if (
    normalizedIdentifier.includes("lifetime") ||
    normalizedIdentifier.includes("one_time") ||
    normalizedIdentifier.includes("onetime") ||
    normalizedIdentifier.includes("once")
  ) {
    return "oneTime";
  }

  if (normalizedIdentifier.includes("year") || normalizedIdentifier.includes("annual")) {
    return "yearly";
  }

  if (normalizedIdentifier.includes("month")) {
    return "monthly";
  }

  return null;
}

function toPaywallPlan(pkg: PurchasesPackage, cycle: BillingCycle): RevenueCatPaywallPlan {
  return {
    cycle,
    productId: pkg.product.identifier,
    title: pkg.product.title,
    price: pkg.product.priceString,
  };
}

function buildPaywallData(offering: PurchasesOffering | null): RevenueCatPaywallData {
  if (!offering) {
    return {
      isConfigured: true,
      offeringIdentifier: null,
      plans: {},
    };
  }

  const plans: RevenueCatPaywallData["plans"] = {};
  const yearlyPackage = findPackageForCycle(offering, "yearly");
  const monthlyPackage = findPackageForCycle(offering, "monthly");
  const oneTimePackage = findPackageForCycle(offering, "oneTime");

  if (yearlyPackage) {
    plans.yearly = toPaywallPlan(yearlyPackage, "yearly");
  }

  if (monthlyPackage) {
    plans.monthly = toPaywallPlan(monthlyPackage, "monthly");
  }

  if (oneTimePackage) {
    plans.oneTime = toPaywallPlan(oneTimePackage, "oneTime");
  }

  return {
    isConfigured: true,
    offeringIdentifier: offering.identifier,
    plans,
  };
}

function findPackageForCycle(offering: PurchasesOffering, cycle: BillingCycle): PurchasesPackage | null {
  switch (cycle) {
    case "yearly": {
      return offering.annual ?? offering.availablePackages.find((pkg) => inferPlanCycle(pkg) === "yearly") ?? null;
    }
    case "monthly": {
      return offering.monthly ?? offering.availablePackages.find((pkg) => inferPlanCycle(pkg) === "monthly") ?? null;
    }
    case "oneTime": {
      return offering.lifetime ?? offering.availablePackages.find((pkg) => inferPlanCycle(pkg) === "oneTime") ?? null;
    }
  }
}

function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const possibleError = error as { code?: unknown; userCancelled?: unknown };
  return (
    possibleError.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
    possibleError.userCancelled === true
  );
}

async function cacheEntitlement(customerInfo: CustomerInfo): Promise<boolean> {
  const entitlement = customerInfo.entitlements.all[REVENUECAT_PRO_ENTITLEMENT_ID];
  const isActive = entitlement?.isActive === true;
  updateProAccessCache(isActive, entitlement?.expirationDate ?? null);
  return isActive;
}

async function getTargetOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();

  if (REVENUECAT_OFFERING_ID) {
    return offerings.all[REVENUECAT_OFFERING_ID] ?? null;
  }

  return offerings.current;
}

export async function initRevenueCat(): Promise<boolean> {
  if (hasConfigured) {
    return true;
  }

  const apiKey = getApiKeyForPlatform();
  if (!apiKey) {
    return false;
  }

  Purchases.configure({ apiKey });

  if (__DEV__) {
    await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }

  if (!hasCustomerInfoListener) {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      void cacheEntitlement(customerInfo);
    });
    hasCustomerInfoListener = true;
  }

  hasConfigured = true;
  return true;
}

export async function syncProEntitlementFromRevenueCat(): Promise<boolean> {
  const initialized = await initRevenueCat();
  if (!initialized) {
    return false;
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return cacheEntitlement(customerInfo);
}

export async function getRevenueCatPaywallData(): Promise<RevenueCatPaywallData> {
  const initialized = await initRevenueCat();
  if (!initialized) {
    return {
      isConfigured: false,
      offeringIdentifier: null,
      plans: {},
    };
  }

  const offering = await getTargetOffering();
  return buildPaywallData(offering);
}

export async function purchaseRevenueCatPlan(cycle?: BillingCycle): Promise<RevenueCatPurchaseOutcome> {
  const initialized = await initRevenueCat();
  if (!initialized) {
    throw new Error("RevenueCat is not configured for this build.");
  }

  const offering = await getTargetOffering();
  if (!offering) {
    throw new Error("No active RevenueCat offering was found.");
  }

  const fallbackCycleOrder: BillingCycle[] = ["yearly", "monthly", "oneTime"];
  const purchaseCycleOrder = cycle ? [cycle, ...fallbackCycleOrder] : fallbackCycleOrder;

  let targetPackage: PurchasesPackage | null = null;
  for (const candidateCycle of purchaseCycleOrder) {
    const candidatePackage = findPackageForCycle(offering, candidateCycle);
    if (candidatePackage) {
      targetPackage = candidatePackage;
      break;
    }
  }

  if (!targetPackage) {
    throw new Error("No eligible package is available in the current offering.");
  }

  try {
    const purchaseResult = await Purchases.purchasePackage(targetPackage);
    const isActive = await cacheEntitlement(purchaseResult.customerInfo);
    return { isActive, cancelled: false };
  } catch (error) {
    if (isPurchaseCancelled(error)) {
      return { isActive: false, cancelled: true };
    }

    throw error;
  }
}

export async function restoreRevenueCatPurchases(): Promise<boolean> {
  const initialized = await initRevenueCat();
  if (!initialized) {
    throw new Error("RevenueCat is not configured for this build.");
  }

  const customerInfo = await Purchases.restorePurchases();
  return cacheEntitlement(customerInfo);
}

export async function presentRevenueCatCustomerCenter(): Promise<void> {
  const initialized = await initRevenueCat();
  if (!initialized) {
    throw new Error("RevenueCat is not configured for this build.");
  }

  await RevenueCatUI.presentCustomerCenter();
}

export type {
  BillingCycle,
  RevenueCatPaywallData,
  RevenueCatPaywallPlan,
  RevenueCatPurchaseOutcome,
} from "@/features/subscription/revenuecat.types";
