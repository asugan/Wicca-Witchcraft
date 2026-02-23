function readPublicEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

export const REVENUECAT_IOS_API_KEY = readPublicEnv(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY);
export const REVENUECAT_ANDROID_API_KEY = readPublicEnv(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY);
export const REVENUECAT_PRO_ENTITLEMENT_ID = readPublicEnv(process.env.EXPO_PUBLIC_REVENUECAT_PRO_ENTITLEMENT) || "pro";
export const REVENUECAT_OFFERING_ID = readPublicEnv(process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID);
