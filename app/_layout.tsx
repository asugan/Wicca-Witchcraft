import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { mysticTheme } from "@/theme/tokens";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: mysticTheme.colors.background },
        }}
      />
    </>
  );
}
