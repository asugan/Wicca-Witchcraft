# Agent Instructions for wicca-witchcraft

Welcome to the `wicca-witchcraft` repository. This file provides guidelines and context for AI coding agents operating within this project.

## 1. Project Overview & Tech Stack

This is a React Native mobile application built with **Expo**, focusing on spiritual and mystical practices (rituals, tarot, journaling, etc.).

**Core Technologies:**
- **Framework:** React Native + Expo (`expo-router` for file-based routing)
- **Language:** TypeScript (`strict` mode enabled)
- **UI Framework:** `react-native-paper` (Material Design 3)
- **Database:** SQLite (`expo-sqlite`) with `drizzle-orm`
- **Analytics:** Aptabase (`@aptabase/react-native`)
- **Animations:** `react-native-reanimated`

## 2. Build, Lint & Test Commands

We rely on Expo's CLI and standard Node/TypeScript tools. Note that there is no automated test runner configured yet. Verification relies on type checking and linting.

- **Start App (Development):**
  ```bash
  npm run start
  # Or specific platforms: npm run ios / npm run android / npm run web
  ```
- **Type Checking (Crucial for Verification):**
  Always run this after modifying code to ensure TypeScript compiles without errors.
  ```bash
  npx tsc --noEmit
  ```
- **Linting:**
  Runs ESLint to check for code style issues.
  ```bash
  npm run lint
  ```
- **Reset Project:**
  Clears Metro bundler cache and resets the app state.
  ```bash
  npm run reset-project
  ```

**Important:** Because there are no unit tests (`jest`, etc.) currently set up in this repository, **you must use `npx tsc --noEmit` and `npm run lint` as your primary verification steps** after making changes.

## 3. Code Style & Conventions

### Directory Structure & Routing
- `app/`: Expo Router file-based navigation.
  - `(tabs)/`: Main bottom tab navigation screens.
  - `[slug].tsx`: Dynamic routes for specific entities.
- `src/`: Core application logic and reusable code.
  - `components/`: UI components (e.g., `mystic/` for domain-specific components).
  - `db/`: Database configuration (`client.ts`), schema (`schema.ts`), migrations (`migrations.ts`), repositories, and seed data.
  - `lib/`: Utility functions (analytics, notifications).
  - `theme/`: Theming logic, tokens, and React Native Paper integration.

### Imports & Exports
- Use path aliases: `@/` resolves to `src/` (configured in `tsconfig.json`).
  *Example:* `import { MoonPhaseBadge } from "@/components/mystic/MoonPhaseBadge";`
- Prefer named exports over default exports, except for Expo Router screen components in the `app/` directory which *must* use default exports.
- Group imports: External libraries first, then absolute aliases (`@/...`), then relative imports.

### Typing & TypeScript
- Use strict typing. Avoid `any` at all costs.
- When working with the database, use the inferred types from Drizzle ORM schema (e.g., `typeof rituals.$inferSelect`).
- Explicitly define prop types for components using `type Props = { ... }` or `interface`.

### UI & Theming (`react-native-paper`)
- Use `react-native-paper` components (`Surface`, `Text`, `Button`) as the foundation for UI elements.
- Use the custom hook `useMysticTheme()` (from `@/theme/use-mystic-theme`) to access domain-specific colors (`mysticBlue`, `mysticGreen`, `mysticPurple`) and typography tokens.
- **Styling approach:** Use `StyleSheet.create` combined with a `makeStyles` pattern that takes the theme as an argument to generate dynamic styles based on light/dark mode.
  ```typescript
  const theme = useMysticTheme();
  const styles = makeStyles(theme);
  // ...
  const makeStyles = (theme: ReturnType<typeof useMysticTheme>) => StyleSheet.create({ ... });
  ```

### Database Operations (`drizzle-orm`)
- All database schemas are defined in `src/db/schema.ts`.
- Migrations are handled manually via raw SQL in `src/db/migrations.ts`. If you modify `schema.ts`, you **must** also add a corresponding raw SQL migration block to `migrations.ts`.
- Encapsulate database queries within repository files inside `src/db/repositories/`. Avoid calling `db.select()` directly inside React components.

### Error Handling
- Use standard `try/catch` blocks for asynchronous operations.
- Ensure the app fails gracefully without crashing the UI, especially during database reads/writes.

### File Naming
- Use `kebab-case` for file names (e.g., `moon-phase-badge.tsx`, `settings-repository.ts`).
- Ensure components start with a Capital letter in the code but use `PascalCase.tsx` only if matching existing patterns, otherwise stick to `kebab-case.tsx` as seen in `app/` and `src/db/`. Follow the convention of the specific folder you are working in.

## 4. Workflows & Verification

1. **Understand:** Read relevant files in `app/` (for UI routes) and `src/db/` (for data models) before making changes.
2. **Implement:** Write code adhering to the React Native Paper theme and Drizzle ORM setup.
3. **Verify:**
   - Run `npx tsc --noEmit` to ensure no typing errors were introduced.
   - Run `npm run lint` to verify code style.
   - If UI changes were made, visually confirm them if possible, or ensure the styles follow the `makeStyles` pattern correctly.
