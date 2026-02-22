import { useColorScheme } from "react-native";

import { appThemes, type AppMode } from "@/theme/tokens";

export function useAppMode(): AppMode {
  const preferred = useColorScheme();

  return preferred === "light" ? "light" : "dark";
}

export function useMysticTheme() {
  const mode = useAppMode();

  return appThemes[mode];
}
