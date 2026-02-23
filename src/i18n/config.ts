import * as Localization from "expo-localization";

export type AppLanguage = "en" | "tr" | "de" | "es" | "fr" | "it" | "pt";

export const APP_LANGUAGES: AppLanguage[] = ["en", "tr", "de", "es", "fr", "it", "pt"];

export function normalizeAppLanguage(locale: string | null | undefined): AppLanguage {
  if (!locale) {
    return "en";
  }

  const tag = locale.toLowerCase();

  if (tag.startsWith("tr")) return "tr";
  if (tag.startsWith("de")) return "de";
  if (tag.startsWith("es")) return "es";
  if (tag.startsWith("fr")) return "fr";
  if (tag.startsWith("it")) return "it";
  if (tag.startsWith("pt")) return "pt";
  if (tag.startsWith("en")) return "en";

  return "en";
}

export function getDeviceAppLanguage(): AppLanguage {
  const locales = Localization.getLocales();
  const primaryLocale = locales[0];
  return normalizeAppLanguage(primaryLocale?.languageTag ?? null);
}
