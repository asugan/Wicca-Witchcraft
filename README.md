# Wicca Witchcraft & Spells

A local-first mobile app for spiritual practice — rituals, spells, a knowledge library, oracle tools, and a personal journal, all in one place.

Built with React Native / Expo, fully offline with no backend required.

## Tech Stack

- **Framework**: React Native + Expo SDK 54 (New Architecture + React Compiler)
- **Routing**: Expo Router (file-based, typed routes)
- **Database**: Drizzle ORM + expo-sqlite (local-first, auto-migrates on launch)
- **UI**: react-native-paper v5 (Material Design 3) with a custom mystical theme
- **i18n**: i18next + react-i18next, 7 languages (EN, TR, DE, ES, FR, IT, PT)
- **Analytics**: Aptabase (privacy-respecting, no personal data)
- **Purchases**: react-native-purchases (RevenueCat)

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Bottom tab screens
    index.tsx           # Home — moon phase, daily tarot, intention
    grimoire.tsx        # Ritual & spell browser with search/filters
    library.tsx         # Spiritual encyclopedia (crystals, herbs, etc.)
    tools.tsx           # Moon calendar, tarot spread, astro timeline
    profile.tsx         # Favorites, journal, settings
  ritual/[slug].tsx     # Ritual detail page
  onboarding.tsx        # Onboarding flow
  subscription.tsx      # Premium paywall
  _layout.tsx           # Root layout

src/
  db/                   # Drizzle schema, migrations, repositories, seed data
  theme/                # Color tokens, Paper MD3 theme, useMysticTheme hook
  i18n/                 # i18next config + translations for all 7 languages
  components/           # Shared UI components
    mystic/             # Domain components: RitualCard, MoonPhaseBadge, etc.
  context/              # Toast context
  hooks/                # Custom hooks
  features/             # Feature modules
  lib/                  # Utilities
```

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- For native builds: Android Studio or Xcode

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the root:

```
EXPO_PUBLIC_APTABASE_APP_KEY=your_key_here
```

### Start the dev server

```bash
npm start
```

Then press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

## Commands

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run on web |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to clean state |

## Architecture Notes

### Local-first database

The app uses Drizzle ORM + expo-sqlite. On first launch, migrations run automatically and seed data is inserted. All DB access goes through repository functions in `src/db/repositories/` — never raw queries in screens.

Default user ID is `"local-user"`.

### Theme system

`src/theme/tokens.ts` defines semantic color tokens (warm beige for light mode, deep brown for dark mode). The `useMysticTheme()` hook gives any component access to the full token set. Dark mode is the default.

### i18n

Device language is auto-detected via expo-localization. Users can override it from the profile settings. Language preference is persisted to the `app_settings` table.

To add a new translation key: add it to `src/i18n/resources/en.ts` first (this defines the `Translations` type), then add the same key to all other language files.

### Analytics

Events are sent to Aptabase using `EXPO_PUBLIC_APTABASE_APP_KEY`. All event names are `snake_case` past-tense (e.g. `ritual_opened`, `journal_entry_created`). Properties use `snake_case` only.

## Supported Languages

English, Turkish, German, Spanish, French, Italian, Portuguese
