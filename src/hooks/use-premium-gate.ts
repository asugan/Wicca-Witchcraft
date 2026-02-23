import { useCallback } from "react";
import { useRouter } from "expo-router";

import { hasProAccess } from "@/db/repositories/subscription-repository";
import type { PremiumFeature } from "@/config/premium";
import { trackEvent } from "@/lib/analytics";

export type PremiumGateResult = {
  /** Whether the user has an active premium subscription */
  isPremium: boolean;
  /** Check if user has access (always true for premium users) */
  checkAccess: () => boolean;
  /** Check access for a specific feature; navigates to /subscription if not premium */
  requirePremium: (feature: PremiumFeature) => boolean;
  /** Show upgrade prompt by navigating to subscription screen */
  showUpgradePrompt: (feature: PremiumFeature) => void;
};

/**
 * Hook for checking and enforcing premium access throughout the app.
 * Uses the local subscription cache to determine premium status.
 */
export function usePremiumGate(): PremiumGateResult {
  const router = useRouter();
  const isPremium = hasProAccess();

  const checkAccess = useCallback(() => {
    return isPremium;
  }, [isPremium]);

  const showUpgradePrompt = useCallback(
    (feature: PremiumFeature) => {
      trackEvent("premium_gate_shown", {
        user_id: "local-user",
        feature,
        source: "premium_gate",
      });
      router.push("/subscription");
    },
    [router]
  );

  const requirePremium = useCallback(
    (feature: PremiumFeature) => {
      if (isPremium) {
        return true;
      }

      showUpgradePrompt(feature);
      return false;
    },
    [isPremium, showUpgradePrompt]
  );

  return {
    isPremium,
    checkAccess,
    requirePremium,
    showUpgradePrompt,
  };
}
