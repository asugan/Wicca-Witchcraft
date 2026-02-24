import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { listMoonEvents } from "@/db/repositories/tools-repository";

const DAILY_CHANNEL_ID = "daily-reminders";
const MOON_CHANNEL_ID = "moon-events";
const DAILY_REMINDER_HOUR = 20;
const DAILY_REMINDER_MINUTE = 30;
const MOON_EVENT_HOUR = 9;
const MOON_EVENT_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannels() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(DAILY_CHANNEL_ID, {
    name: "Daily Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  await Notifications.setNotificationChannelAsync(MOON_CHANNEL_ID, {
    name: "Moon Events",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function asMoonTriggerDate(isoDate: string) {
  const date = new Date(`${isoDate}T${String(MOON_EVENT_HOUR).padStart(2, "0")}:${String(MOON_EVENT_MINUTE).padStart(2, "0")}:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (date.getTime() < Date.now()) {
    return null;
  }

  return date;
}

async function requestPermissions() {
  const existing = await Notifications.getPermissionsAsync();

  if (existing.status === "granted") {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return requested.status === "granted";
}

async function scheduleDailyReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Ritual Reminder",
      body: "Take a breath and open your grimoire for today's guidance.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_REMINDER_HOUR,
      minute: DAILY_REMINDER_MINUTE,
      channelId: DAILY_CHANNEL_ID,
    },
  });
}

async function scheduleMoonEventReminders() {
  const moonEvents = listMoonEvents();

  for (const event of moonEvents) {
    const triggerDate = asMoonTriggerDate(event.eventDate);

    if (!triggerDate) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${event.phase} in ${event.zodiacSign}`,
        body: event.summary,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: MOON_CHANNEL_ID,
      },
    });
  }
}

async function scheduleAllMysticNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await scheduleDailyReminder();
  await scheduleMoonEventReminders();
}

export type NotificationEnableResult = {
  enabled: boolean;
  reason?: "permission_denied";
};

export async function enableMysticNotifications(): Promise<NotificationEnableResult> {
  await ensureAndroidChannels();

  const hasPermission = await requestPermissions();

  if (!hasPermission) {
    return {
      enabled: false,
      reason: "permission_denied",
    };
  }

  await scheduleAllMysticNotifications();

  return {
    enabled: true,
  };
}

export async function disableMysticNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncMysticNotifications(notificationsEnabled: boolean) {
  await ensureAndroidChannels();

  if (!notificationsEnabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    return;
  }

  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.status !== "granted") {
    return;
  }

  await scheduleAllMysticNotifications();
}
