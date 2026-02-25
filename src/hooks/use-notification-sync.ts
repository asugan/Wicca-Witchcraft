import { useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/db/repositories/settings-repository";
import { disableMysticNotifications, syncMysticNotifications } from "@/lib/notifications";

const LOCAL_USER_ID = "local-user";

export function useNotificationSync() {
  const isFocused = useIsFocused();
  const [notificationsEnabled, setNotificationsEnabledState] = useState(() =>
    getNotificationsEnabled(LOCAL_USER_ID),
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Re-read DB when screen gains focus (fixes Home bell staleness)
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    setNotificationsEnabledState(getNotificationsEnabled(LOCAL_USER_ID));
  }, [isFocused]);

  const reconcileWithOs = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const osGranted = status === "granted";
    // Read fresh from DB — not stale React state
    const dbEnabled = getNotificationsEnabled(LOCAL_USER_ID);

    if (osGranted && !dbEnabled) {
      // User granted in OS settings; auto-enable
      await syncMysticNotifications(true);
      setNotificationsEnabled(LOCAL_USER_ID, true);
      setNotificationsEnabledState(true);
    } else if (!osGranted && dbEnabled) {
      // User revoked in OS settings; auto-disable
      await disableMysticNotifications();
      setNotificationsEnabled(LOCAL_USER_ID, false);
      setNotificationsEnabledState(false);
    }
  }, []);

  // Sync on background → active transition (fixes stale state after OS settings visit)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      // Only reconcile on genuine background → active (not inactive → active from system dialogs)
      if (prevState === "background" && nextState === "active") {
        void reconcileWithOs();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [reconcileWithOs]);

  return { notificationsEnabled, setNotificationsEnabled: setNotificationsEnabledState };
}
