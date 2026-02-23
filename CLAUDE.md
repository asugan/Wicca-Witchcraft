# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — Start Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — Run on platform
- `npm run lint` — ESLint check (expo lint config)
- `npm run reset-project` — Reset to clean state

No test runner is currently configured.

## Architecture

React Native / Expo app (SDK 54, React 19, New Architecture + React Compiler enabled). Fully local-first with Drizzle ORM + expo-sqlite — no backend.

### Path alias

`@/` maps to `src/` (configured in tsconfig.json).

### Routing

Expo Router with file-based routing in `app/`. Typed routes enabled via `typedRoutes` experiment.

- `app/_layout.tsx` — Root layout (PaperProvider → ToastProvider → Stack)
- `app/(tabs)/` — Bottom tab screens: index (home), grimoire, library, tools, profile
- `app/ritual/[slug].tsx` — Ritual detail via slug lookup

### Database (`src/db/`)

Drizzle ORM + expo-sqlite. Auto-migrates and seeds on first launch.

- `schema.ts` — All table definitions (users, rituals, ritual_steps, materials, library_entries, favorites, journal_entries, app_settings, etc.)
- `client.ts` — DB client init with `ensureDatabaseInitialized()` guard
- `migrations.ts` — Ordered migration list
- `seed-data.ts` — Initial content data
- `repositories/` — One file per entity (ritual, library, settings, etc.). All queries go through repositories.

Default user ID is `"local-user"`.

### Theme (`src/theme/`)

- `tokens.ts` — Semantic color tokens, spacing scale, type scale, radius values. Light mode (warm beige) and dark mode (deep brown).
- `paper-theme.ts` — Factory wrapping tokens into react-native-paper MD3 theme
- `use-mystic-theme.ts` — `useMysticTheme()` hook returns full token set; `useAppMode()` for dark/light toggle

### i18n (`src/i18n/`)

i18next + react-i18next with 7 languages (en, tr, de, es, fr, it, pt). Device language auto-detected via expo-localization.

- `config.ts` — `AppLanguage` type, `normalizeAppLanguage()`, `getDeviceAppLanguage()`
- `index.ts` — Singleton init
- `resources/` — One file per language. `en.ts` defines the `Translations` type interface.

Language preference persists in `app_settings` table via `getLanguagePreference()` / `setLanguagePreference()` in the settings repository.

### UI Components

react-native-paper v5 (Material Design 3). Custom domain components live in `src/components/mystic/` (RitualCard, MoonPhaseBadge, etc.).

### Toast Notifications (`src/context/toast-context.tsx`)

`useToast()` hook from ToastProvider context. `showToast(message, type?)` where type is "success" | "error" | "info".

### Analytics

Aptabase (privacy-respecting). Key in `.env` as `EXPO_PUBLIC_APTABASE_APP_KEY`.

## Conventions

- **Translations**: Use `const { t } = useTranslation()`. For dynamic keys: `t(someKey as string)` to satisfy TypeScript. The `Translations` type uses `string` values (not `as const`).
- **New translations**: Add key to `en.ts` first (defines the type), then add to all other language files.
- **Repositories**: All DB access goes through repository functions, never raw queries in screens.
- **Naming**: Screens are PascalCase (`HomeScreen`), hooks use `use` prefix, repositories are `<entity>-repository.ts`.
- **Changing language at runtime**: Call `i18n.changeLanguage(lang)` and use `i18n.getFixedT(lang)` for immediate toast messages in the new language.
