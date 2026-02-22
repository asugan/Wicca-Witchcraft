# Mystic and Spiritual App Roadmap

This document is a practical roadmap for building a beautiful, high-retention mystical app with a clear product structure, scalable content system, and a realistic delivery plan.

## 1) Product Vision and Success Criteria

### Core product promise
- Give users a meaningful reason to open the app every day.
- Combine ritual practice, spiritual learning, and personal journaling in one ecosystem.
- Increase session length through rich cross-linked content (Wikipedia-style exploration).

### North-star metrics
- Retention: D1, D7, D30
- Engagement: DAU/MAU, average session length, sessions per user
- Discovery: ritual detail views per session, cross-link click-through rate
- Personalization: favorites saved, journal entries created per week

### Initial 90-day KPI targets
- D1 retention: 30%+
- D7 retention: 15%+
- Average session duration: 6-10 minutes
- At least 4 screen views per session

## 2) Confirmed Technology Stack

### Mobile framework
- React Native with Expo

### UI and design system
- `react-native-paper` for components, theming, and typography consistency
- Custom mystical visual language layered on top of Paper tokens (colors, spacing, shape, motion)

### Local data and persistence
- `expo-sqlite` as the on-device database
- Drizzle ORM for schema, relations, typed queries, and migrations

### Recommended architecture style
- Local-first app architecture (fast startup, offline-friendly)
- Background sync can be added later if cloud features are required
- Repository layer between UI and database to keep business logic clean

## 2.1) Current Implementation Snapshot (Feb 2026)

### Completed in codebase
- Expo Router app shell with 5-tab bottom navigation is implemented.
- Design-driven first pass screens are implemented from `tasarim/stitch(8-11)` references:
  - Home (moon + daily insight)
  - Grimoire list
  - Ritual detail (`Full Moon Release`)
  - Tools tarot spread screen
- Drizzle + `expo-sqlite` local-first foundation is active with schema, migration runner, and repository scaffolding.
- Seeded local content is connected to screens (20+ rituals, 30+ library entries, moon events, cross-links).
- Ritual material cross-link modal flow is live (ritual -> linked library mini preview).
- Tools tab now includes Moon Calendar + Astro Timeline backed by `moon_events`.
- My Space tab is DB-connected with favorites persistence and Book of Shadows journal CRUD.
- Ritual bookmark action is persisted to `favorites` and reflected in My Space.
- Semantic theming layer is implemented with light/dark modes (`surface1`, `surface2`, `onSurface`, `onPrimary`, etc.).
- `react-native-paper` is integrated at root provider level with custom MD3 theme mapping.
- Reusable UI components are started:
  - `RitualCard`
  - `LibraryChip`
  - `MoonPhaseBadge`
  - `IncantationBlock`

### In progress / recently started (high priority)
- [x] Drizzle + `expo-sqlite` schema and first migration runner.
- [x] Seeded content pipeline (20+ rituals, 30+ library entries).
- [x] Cross-linking (`entity_links`) and inline entity preview modal.
- [~] Analytics instrumentation for core events (console-based tracking scaffold).

## 3) Information Architecture (5-Tab Bottom Navigation)

## 3.1 Home (Daily Summary)
Daily anchor screen designed for habitual usage.

- Moon phase of the day (percentage, phase, short energy summary)
- Daily tarot card (tap to draw, or auto-draw)
- Daily intention/motto
- Recommended ritual based on moon phase and weekday

## 3.2 Grimoire (Rituals and Spells)
Core value proposition of the product.

- Search and filters (category, difficulty, required material, moon phase)
- Category grid view
- Horizontal carousels: Popular and Newly Added

## 3.3 Library (Knowledge Base)
Educational spiritual encyclopedia.

- Crystals
- Herbs and Plants
- Candle Color Meanings
- Symbols and Runes
- Gods and Goddesses

## 3.4 Tools (Interactive Oracles)
Dynamic, reusable engagement modules.

- Moon calendar (new moon/full moon dates + zodiac sign)
- Tarot table (Past-Present-Future 3-card spread)
- Astrological events (Mercury retrograde, eclipses, major transits)

## 3.5 My Space (Profile and Digital Journal)
User-owned and high-retention personal area.

- Saved items (favorites)
- Book of Shadows (ritual notes, dreams, intentions)
- Settings (theme, notifications, premium)

## 4) Content Architecture

## 4.1 Ritual categories (Grimoire)
- Love and Relationships
- Protection
- Healing and Wellbeing
- Abundance and Prosperity
- Moon Rituals
- Beginner-Friendly (minimal materials, intention-first)

## 4.2 Ritual detail page template
Each ritual page should follow a consistent, reusable structure.

- Title + cover illustration
- Short purpose statement
- Metadata tags (difficulty, ideal timing, estimated duration)
- Materials checklist (interactive)
- Step-by-step instructions
- Incantation section (visually differentiated)
- Safety and intention note

## 4.3 Library entry template
Each reference entry should include:

- Entity type (crystal, herb, candle, symbol)
- Spiritual properties
- Chakra/element correspondences
- Cleansing and care methods
- Related rituals using this entity

## 5) Data Model Blueprint (Drizzle + expo-sqlite)

Use relational modeling from day one to support cross-linking and future personalization.

### Suggested core tables
- `users`
- `rituals`
- `ritual_steps`
- `materials`
- `ritual_materials` (many-to-many)
- `library_entries`
- `entity_links` (cross-link map)
- `daily_cards`
- `moon_events`
- `favorites`
- `journal_entries`
- `app_settings`

### Drizzle implementation notes
- Define schema with explicit foreign keys and indexes on `slug`, `type`, and relation pivots.
- Keep enum-like fields (`difficulty`, `entity_type`, `moon_phase`) normalized or constrained.
- Add migration strategy early (versioned migrations in app startup flow).

## 6) Cross-Linking Strategy (Retention Multiplier)

### Principle
Every ritual and every library entity should connect to other relevant entities.

### Example user flow
- User opens "Prosperity Ritual".
- Taps "Green Candle" in the materials list.
- A modal or bottom sheet opens with mini details from `Library > Green Candle`.
- User returns to the same ritual step without losing progress.

### Why this matters
- Increases session depth
- Improves perceived content quality
- Builds an interconnected ecosystem rather than isolated pages

## 7) UX and Visual Direction (with react-native-paper)

### Experience principles
- Calm, intentional interface with a mystical identity
- Clear card hierarchy and readable typography
- Meaningful motion: tarot draw animation, moon transition, modal reveal
- One-handed usability for bottom navigation and quick actions

### Paper-specific guidance
- Extend Paper theme (`MD3`) with custom brand tokens (surface tiers, accent, typography scale)
- Build reusable components: `RitualCard`, `LibraryChip`, `MoonPhaseBadge`, `IncantationBlock`
- Use Paper primitives (`Card`, `Chip`, `Dialog`, `BottomNavigation`, `Snackbar`) for consistency

## 8) Delivery Plan: MVP to V1

## Phase 0 (Week 1-2): Foundation
- [x] Finalize IA and wireframes for all 5 tabs
- [x] Define Drizzle schema and migrations
- [x] Create theme system with `react-native-paper`
- [x] Prepare initial seeded content model

## Phase 1 (Week 3-5): MVP Core
- [x] Implement bottom tab navigation
- [x] Build Home daily modules (moon, tarot, intention, recommendation)
- [x] Build Grimoire list + ritual detail
- [x] Build Library basics
- [x] Build My Space: favorites + simple journal

## Phase 2 (Week 6-8): Interactive Tools
- [x] Moon calendar module
- [x] 3-card tarot spread experience
- [x] Astrological events timeline
- [ ] Notification triggers (daily reminder, moon events)

## Phase 3 (Week 9-10): Engagement and Premium
- Streak and consistency indicators
- Advanced filtering and search refinement
- Premium features (expanded journal, advanced spreads, exclusive ritual packs)
- Subscription screen and purchase flow

## Phase 4 (Week 11-12): Quality and Launch
- Performance optimization (cold start, list rendering, image caching)
- Event instrumentation validation
- Crash monitoring and bug-fix sprint
- Store listing and launch checklist

## 9) Analytics Event Taxonomy

### Core events
- `home_viewed`
- `daily_card_drawn`
- `ritual_opened`
- `material_link_clicked`
- `library_entry_viewed`
- `ritual_favorited`
- `journal_entry_created`
- `premium_paywall_viewed`
- `premium_started`

### Minimum event properties
- `user_id`
- `timestamp`
- `tab_name`
- `entity_id`
- `source`

## 10) Risks and Mitigations

- Content quality risk -> Editorial review workflow and source policy
- Cultural/spiritual sensitivity risk -> Inclusive language and clear disclaimers
- Retention drop risk -> Faster onboarding and immediate first-session value
- Scope creep risk -> Strict MVP boundaries, then layer additional depth

## 11) First 2-Week Action Plan (Start Now)

1. [x] Lock the 5-tab IA and user flows.
2. [x] Implement base app shell with `react-native-paper` bottom navigation.
3. [x] Create Drizzle schema on top of `expo-sqlite` and run first migrations.
4. [x] Build Home, Grimoire list, and Ritual Detail low-fi versions.
5. [x] Seed initial content: at least 20 rituals and 30 library entries.
6. [x] Implement cross-linking via `entity_links` + modal preview.
7. [~] Add analytics hooks to all primary actions.

## 12) Updated Next Sprint Focus (Recommended)

1. Move analytics from console scaffold to production provider and validate event payload quality.
2. Add notification triggers (daily reminder + moon events) with opt-in controls.
3. Refine Home personalization with richer recommendation scoring and fresh daily tarot rotation.
4. Add search/filter depth (moon phase, difficulty, materials) and improve discovery ranking.
5. Prepare engagement layer: streaks, consistency indicators, and onboarding refinements.

---

If this roadmap is followed, product strategy, content structure, UI consistency, and data architecture will move forward together. The key growth triangle is simple: **daily habit + cross-linked knowledge + personal journaling**.
