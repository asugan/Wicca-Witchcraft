export type AppMode = "light" | "dark";

export type AppSemanticColors = {
  background: string;
  backgroundElevated: string;
  surface1: string;
  surface2: string;
  surface3: string;
  onSurface: string;
  onSurfaceMuted: string;
  primary: string;
  primaryBright: string;
  primaryDim: string;
  onPrimary: string;
  outline: string;
  outlineSoft: string;
  danger: string;
  info: string;
  success: string;
  mysticBlue: string;
  mysticGreen: string;
  mysticPurple: string;
  mysticPurpleSoft: string;
};

const semanticColors: Record<AppMode, AppSemanticColors> = {
  light: {
    background: "#F8F7F2",
    backgroundElevated: "#F2EBDD",
    surface1: "#ECE3D2",
    surface2: "#E5D8C1",
    surface3: "#DBC8A8",
    onSurface: "#2F2719",
    onSurfaceMuted: "#6D614C",
    primary: "#B98A1B",
    primaryBright: "#CB9D2D",
    primaryDim: "#8C6510",
    onPrimary: "#1D1406",
    outline: "#BFAE8A",
    outlineSoft: "#D7C8AA",
    danger: "#B74A4A",
    info: "#32526D",
    success: "#3D6854",
    mysticBlue: "#2D4058",
    mysticGreen: "#3D6D57",
    mysticPurple: "#5A456F",
    mysticPurpleSoft: "#75628B",
  },
  dark: {
    background: "#181611",
    backgroundElevated: "#221E10",
    surface1: "#26231C",
    surface2: "#2C281B",
    surface3: "#353124",
    onSurface: "#F4F0E5",
    onSurfaceMuted: "#B8B19D",
    primary: "#F2C14E",
    primaryBright: "#F4D125",
    primaryDim: "#B58D17",
    onPrimary: "#1A1305",
    outline: "#5D5138",
    outlineSoft: "#4C4128",
    danger: "#D85B5B",
    info: "#5D81A7",
    success: "#6EA88E",
    mysticBlue: "#0F172A",
    mysticGreen: "#064E3B",
    mysticPurple: "#1A0B2E",
    mysticPurpleSoft: "#2E1A47",
  },
};

export const sharedTokens = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 30,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  typeScale: {
    overline: 11,
    label: 12,
    body: 14,
    bodyLarge: 17,
    title: 22,
    heading: 34,
    hero: 44,
  },
};

export const appThemes = {
  light: {
    mode: "light" as const,
    colors: semanticColors.light,
    ...sharedTokens,
  },
  dark: {
    mode: "dark" as const,
    colors: semanticColors.dark,
    ...sharedTokens,
  },
};

export const mysticTheme = appThemes.dark;

export const typefaces = {
  display: "serif",
  body: "serif",
};
