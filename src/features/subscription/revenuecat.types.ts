export type BillingCycle = "oneTime" | "yearly" | "monthly";

export type RevenueCatPaywallPlan = {
  cycle: BillingCycle;
  productId: string;
  title: string;
  price: string;
};

export type RevenueCatPaywallData = {
  isConfigured: boolean;
  offeringIdentifier: string | null;
  plans: Partial<Record<BillingCycle, RevenueCatPaywallPlan>>;
};

export type RevenueCatPurchaseOutcome = {
  isActive: boolean;
  cancelled: boolean;
};
