import { useThemeContext, type AppMode } from "@/context/theme-context";
import { appThemes } from "@/theme/tokens";

export type { AppMode };

export function useAppMode(): AppMode {
  const { appMode } = useThemeContext();
  return appMode;
}

export function useMysticTheme() {
  const mode = useAppMode();

  return appThemes[mode];
}
