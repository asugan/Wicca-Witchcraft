import { Redirect } from "expo-router";

import { getOnboardingCompleted } from "@/db/repositories/settings-repository";

const LOCAL_USER_ID = "local-user";

export default function Index() {
  const onboardingCompleted = getOnboardingCompleted(LOCAL_USER_ID);

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
