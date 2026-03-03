import * as SplashScreen from 'expo-splash-screen';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { PaperProvider } from "react-native-paper";

import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { DatabaseProvider } from "@/context/database-context";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { getLanguagePreference, getNotificationsEnabled } from "@/db/repositories/settings-repository";
import { prewarmMoonData } from "@/db/repositories/tools-repository";
import { initRevenueCat } from "@/features/subscription/revenuecat";
import i18n from "@/i18n";
import { initAnalytics, trackAppStarted } from "@/lib/analytics";
import { syncCdnContent } from "@/lib/cdn-sync";
import { syncMysticNotifications } from "@/lib/notifications";
import { getPaperTheme } from "@/theme/paper-theme";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const LOCAL_USER_ID = "local-user";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });

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

    // Tools tab'ı ilk açıldığında donmaması için moon hesaplamasını arka planda
    // önceden ısıt. UI animasyonları bittikten sonra çalışır.
    const moonPrewarm = InteractionManager.runAfterInteractions(() => {
      prewarmMoonData();
    });
    return () => moonPrewarm.cancel();
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
    <DatabaseProvider>
      <AnimatedSplashScreen>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AnimatedSplashScreen>
    </DatabaseProvider>
  );
}
