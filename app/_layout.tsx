import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { getLanguagePreference, getNotificationsEnabled } from "@/db/repositories/settings-repository";
import { initRevenueCat } from "@/features/subscription/revenuecat";
import i18n from "@/i18n";
import { initAnalytics, trackAppStarted } from "@/lib/analytics";
import { syncMysticNotifications } from "@/lib/notifications";
import { getPaperTheme } from "@/theme/paper-theme";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const LOCAL_USER_ID = "local-user";

initAnalytics();

function RootLayoutContent() {
  const theme = useMysticTheme();

  useEffect(() => {
    trackAppStarted(LOCAL_USER_ID);

    const notificationsEnabled = getNotificationsEnabled(LOCAL_USER_ID);
    void syncMysticNotifications(notificationsEnabled);

    const savedLanguage = getLanguagePreference(LOCAL_USER_ID);
    if (i18n.language !== savedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }

    void initRevenueCat();
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
