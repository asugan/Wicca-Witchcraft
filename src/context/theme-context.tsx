import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useColorScheme } from "react-native";

import { getThemeMode, setThemeMode as saveThemeMode } from "@/db/repositories/settings-repository";

export type ThemeMode = "system" | "light" | "dark";
export type AppMode = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  appMode: AppMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_USER_ID = "local-user";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const savedMode = getThemeMode(LOCAL_USER_ID);
    setThemeModeState(savedMode);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(LOCAL_USER_ID, mode);
  }, []);

  const appMode: AppMode =
    themeMode === "system"
      ? systemColorScheme === "light"
        ? "light"
        : "dark"
      : themeMode;

  return (
    <ThemeContext.Provider value={{ themeMode, appMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemeContext(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
