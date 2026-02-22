import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

import { appThemes, type AppMode } from "@/theme/tokens";

const paperThemeByMode: Record<AppMode, MD3Theme> = {
  light: {
    ...MD3LightTheme,
    roundness: appThemes.light.radius.lg,
    colors: {
      ...MD3LightTheme.colors,
      primary: appThemes.light.colors.primary,
      onPrimary: appThemes.light.colors.onPrimary,
      secondary: appThemes.light.colors.mysticPurple,
      onSecondary: "#F8F7F2",
      background: appThemes.light.colors.background,
      surface: appThemes.light.colors.surface1,
      surfaceVariant: appThemes.light.colors.surface2,
      onSurface: appThemes.light.colors.onSurface,
      onSurfaceVariant: appThemes.light.colors.onSurfaceMuted,
      outline: appThemes.light.colors.outline,
      error: appThemes.light.colors.danger,
    },
  },
  dark: {
    ...MD3DarkTheme,
    roundness: appThemes.dark.radius.lg,
    colors: {
      ...MD3DarkTheme.colors,
      primary: appThemes.dark.colors.primary,
      onPrimary: appThemes.dark.colors.onPrimary,
      secondary: appThemes.dark.colors.mysticPurpleSoft,
      onSecondary: "#F4F0E5",
      background: appThemes.dark.colors.background,
      surface: appThemes.dark.colors.surface1,
      surfaceVariant: appThemes.dark.colors.surface2,
      onSurface: appThemes.dark.colors.onSurface,
      onSurfaceVariant: appThemes.dark.colors.onSurfaceMuted,
      outline: appThemes.dark.colors.outline,
      error: appThemes.dark.colors.danger,
    },
  },
};

export function getPaperTheme(mode: AppMode): MD3Theme {
  return paperThemeByMode[mode];
}
