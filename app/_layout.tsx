import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

import { getNotificationsEnabled } from "@/db/repositories/settings-repository";
import { syncMysticNotifications } from "@/lib/notifications";
import { getPaperTheme } from "@/theme/paper-theme";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const LOCAL_USER_ID = "local-user";

export default function RootLayout() {
  const theme = useMysticTheme();

  useEffect(() => {
    const notificationsEnabled = getNotificationsEnabled(LOCAL_USER_ID);

    void syncMysticNotifications(notificationsEnabled);
  }, []);

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
