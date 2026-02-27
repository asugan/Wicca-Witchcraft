# AGENTS.md

Guidance for agentic coding assistants working in this repository.

## Project Overview

React Native / Expo app (SDK 54, React 19, New Architecture + React Compiler). Fully local-first: Drizzle ORM + expo-sqlite, no backend. Wicca/witchcraft spiritual companion app with rituals, tarot, moon phases, and journaling.

---

## Commands

```bash
npm start               # Start Expo dev server
npm run android         # Run on Android
npm run ios             # Run on iOS
npm run web             # Run in browser
npm run lint            # ESLint check (eslint-config-expo flat config)
npm run db:generate     # Generate Drizzle migration after schema changes
npm run cdn:generate    # Regenerate content JSON from raw data
```

**No test runner is configured.** There are no test files; do not add test infrastructure unless explicitly requested.

**Single file lint check:** `npx eslint src/path/to/file.ts`

**After schema changes:** always run `npm run db:generate` and commit the generated file in `drizzle/`. Never manually edit files in `drizzle/`.

---

## Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`). Always use `@/` imports for internal modules rather than relative paths that cross more than one directory level.

---

## TypeScript

- `strict: true` is enabled — no implicit `any`, no loose nullability.
- Infer types from Drizzle schema using `typeof table.$inferSelect` / `$inferInsert`; export them from `schema.ts`.
- Use explicit return types on exported functions and hooks.
- For i18n dynamic keys: cast as `t(key as string)` to satisfy the `Translations` interface.
- Avoid `as` casts except for i18n keys and unavoidable third-party interop.
- Prefer `type` over `interface` for object shapes; `interface` only when extension is needed.

---

## Code Style & Formatting

- No Prettier config — follow the existing style visible in source files.
- 2-space indentation, double quotes for JSX props, single quotes for TS string literals.
- Trailing commas in multi-line arrays and objects.
- Arrow functions for components and callbacks; `function` keyword only for named exports at module level when preferred for readability.
- Keep files focused: one primary export per file.
- `void` prefix for fire-and-forget async calls inside synchronous contexts (e.g., `void i18n.changeLanguage(lang)`).

---

## Import Order

Group imports in this order, separated by a blank line:
1. React and React Native core (`react`, `react-native`)
2. Expo and third-party packages
3. Internal aliases (`@/context/...`, `@/db/...`, `@/theme/...`, etc.) — sorted roughly by depth/layer
4. Local relative imports (same directory)

Do not mix groups. Follow the pattern in `app/_layout.tsx` as the canonical example.

---

## File & Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Screen components | PascalCase file, default export | `grimoire.tsx` → `GrimoireScreen` |
| Hooks | `use` prefix, camelCase file | `use-mystic-theme.ts` |
| Repositories | `<entity>-repository.ts` | `ritual-repository.ts` |
| Context files | `<name>-context.tsx` | `toast-context.tsx` |
| Components | PascalCase file, named or default export | `RitualCard.tsx` |
| Types from schema | PascalCase with `Record` suffix | `RitualRecord`, `TarotCardRecord` |
| DB constants | `"local-user"` for default user ID, `"${userId}-settings"` for settings row ID |

---

## Database (Drizzle + expo-sqlite)

- **All repository functions are synchronous** — Drizzle's expo-sqlite driver is sync. Do not add `async/await` to repository functions unless a specific async operation is required.
- All DB access goes through repository functions in `src/db/repositories/`. Never write raw queries in screens or components.
- Schema lives entirely in `src/db/schema.ts`. Add new tables/columns there, then run `npm run db:generate`.
- Use `.all()` for multi-row results, `.get()` for single-row. Check for `undefined` on `.get()` results.
- Seed data lives in `src/db/seed-data.ts`, `ritual-seed-data.ts`, `library-seed-data.ts`, `tarot-seed-data.ts`.

---

## Components & Theming

- Use `useMysticTheme()` for access to full token set (`colors`, `spacing`, `radius`, `typeScale`, `typefaces`, `mode`).
- Define styles with a factory: `const styles = makeStyles(theme)` where `makeStyles` returns `StyleSheet.create({...})`. Call `makeStyles(theme)` inside the component body (or memoize it).
- Color values come from `theme.colors.*` — never hardcode hex values in component styles.
- Use `react-native-paper` `Text`, `Button`, `Card`, etc. for standard UI. Use `MaterialCommunityIcons` from `@expo/vector-icons` for icons.
- Wrap performance-sensitive list items in `React.memo` with a custom comparator when props are stable objects.

---

## i18n

- All user-facing strings must use `const { t } = useTranslation()`.
- Add new keys to `src/i18n/resources/en.ts` **first** (this file defines the `Translations` type), then add the key to all 7 language files: `en`, `tr`, `de`, `es`, `fr`, `it`, `pt`.
- To change language at runtime: `i18n.changeLanguage(lang)`. For immediate toast in the new language before the hook re-renders: `i18n.getFixedT(lang)("key")`.
- Persist language preference via `setLanguagePreference(userId, lang)` from `settings-repository`.
- `AppLanguage` type and `normalizeAppLanguage()` are in `src/i18n/config.ts`.

---

## Toast Notifications

Use `const { showToast } = useToast()` from `@/context/toast-context`. Signature:

```ts
showToast(message: string, type?: "success" | "error" | "info", action?: SnackbarAction, duration?: number)
```

Do not use `Alert.alert` for routine feedback — always prefer toast.

---

## Navigation (Expo Router)

- File-based routing under `app/`. Screens in `app/(tabs)/` appear in the bottom tab bar.
- Use typed routes: `router.push("/ritual/[slug]")` with the `typedRoutes` experiment enabled.
- Named dynamic segments use bracket syntax: `app/ritual/[slug].tsx`.
- Access route params via `useLocalSearchParams()` from `expo-router`.

---

## Analytics

Aptabase (privacy-respecting, no PII). Import helpers from `@/lib/analytics`. Key is in `.env` as `EXPO_PUBLIC_APTABASE_APP_KEY`. Do not log personal or sensitive data.

---

## Error Handling

- Repository functions do not throw on missing rows — return `undefined` and let callers handle it.
- Use `void` for unawaited promises; do not silently swallow errors in `catch` — at minimum `console.error`.
- Async operations in `useEffect` should use the `void asyncFn()` pattern; clean up subscriptions or timers in the effect's return function.

---

## Environment & Secrets

- `.env` holds `EXPO_PUBLIC_*` vars. `.env.example` documents required keys.
- Never commit `.env`. The `EXPO_PUBLIC_` prefix is required for Expo to expose vars to the app bundle.
- RevenueCat entitlements are managed via `src/features/subscription/revenuecat.ts` and `use-premium-gate.ts`.
