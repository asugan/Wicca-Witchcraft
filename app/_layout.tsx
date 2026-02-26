import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";

import { DatabaseProvider, useDatabaseReady } from "@/context/database-context";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { getLanguagePreference, getNotificationsEnabled } from "@/db/repositories/settings-repository";
import { initRevenueCat } from "@/features/subscription/revenuecat";
import i18n from "@/i18n";
import { initAnalytics, trackAppStarted } from "@/lib/analytics";
import { syncCdnContent } from "@/lib/cdn-sync";
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
    void syncCdnContent(LOCAL_USER_ID);
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

function DatabaseGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useDatabaseReady();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#181611" }}>
        <ActivityIndicator color="#C4A46C" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <DatabaseGate>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </DatabaseGate>
    </DatabaseProvider>
  );
}
