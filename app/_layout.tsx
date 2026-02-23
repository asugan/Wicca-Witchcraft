import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

import { getNotificationsEnabled } from "@/db/repositories/settings-repository";
import { initAnalytics, trackAppStarted } from "@/lib/analytics";
import { syncMysticNotifications } from "@/lib/notifications";
import { getPaperTheme } from "@/theme/paper-theme";
import { useMysticTheme } from "@/theme/use-mystic-theme";
import { ToastProvider } from "@/context/toast-context";

const LOCAL_USER_ID = "local-user";

initAnalytics();

export default function RootLayout() {
  const theme = useMysticTheme();

  useEffect(() => {
    trackAppStarted(LOCAL_USER_ID);

    const notificationsEnabled = getNotificationsEnabled(LOCAL_USER_ID);

    void syncMysticNotifications(notificationsEnabled);
  }, []);

  return (
    <PaperProvider theme={getPaperTheme(theme.mode)}>
      <ToastProvider>
        <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
      </ToastProvider>
    </PaperProvider>
  );
}
