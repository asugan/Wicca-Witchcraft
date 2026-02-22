import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";

import { getPaperTheme } from "@/theme/paper-theme";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export default function RootLayout() {
  const theme = useMysticTheme();

  return (
    <PaperProvider theme={getPaperTheme(theme.mode)}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </PaperProvider>
  );
}
