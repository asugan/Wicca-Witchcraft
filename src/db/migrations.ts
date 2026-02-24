import type { SQLiteDatabase } from "expo-sqlite";

type Migration = {
  id: string;
  sql: string;
};

const migrations: Migration[] = [
  {
    id: "0001_initial_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rituals (
        id TEXT PRIMARY KEY NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        moon_phase TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        cover_image TEXT NOT NULL,
        incantation TEXT NOT NULL,
        safety_note TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS rituals_category_idx ON rituals(category);

      CREATE TABLE IF NOT EXISTS ritual_steps (
        id TEXT PRIMARY KEY NOT NULL,
        ritual_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE,
        UNIQUE(ritual_id, step_order)
      );

      CREATE TABLE IF NOT EXISTS library_entries (
        id TEXT PRIMARY KEY NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('crystal', 'herb', 'candle', 'symbol', 'deity')),
        summary TEXT NOT NULL,
        spiritual_properties TEXT NOT NULL,
        correspondences TEXT NOT NULL,
        cleansing_method TEXT NOT NULL,
        care_note TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS library_entries_type_idx ON library_entries(entity_type);

      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        linked_entry_id TEXT,
        FOREIGN KEY (linked_entry_id) REFERENCES library_entries(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS ritual_materials (
        ritual_id TEXT NOT NULL,
        material_id TEXT NOT NULL,
        quantity_label TEXT,
        sort_order INTEGER NOT NULL,
        PRIMARY KEY (ritual_id, material_id),
        FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS ritual_materials_ritual_sort_idx ON ritual_materials(ritual_id, sort_order);

      CREATE TABLE IF NOT EXISTS entity_links (
        id TEXT PRIMARY KEY NOT NULL,
        source_entity_type TEXT NOT NULL,
        source_entity_id TEXT NOT NULL,
        target_entity_type TEXT NOT NULL,
        target_entity_id TEXT NOT NULL,
        relation_type TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS entity_links_source_idx ON entity_links(source_entity_type, source_entity_id);
      CREATE INDEX IF NOT EXISTS entity_links_target_idx ON entity_links(target_entity_type, target_entity_id);

      CREATE TABLE IF NOT EXISTS daily_cards (
        id TEXT PRIMARY KEY NOT NULL,
        card_name TEXT NOT NULL,
        arcana TEXT NOT NULL,
        upright_meaning TEXT NOT NULL,
        draw_date TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS moon_events (
        id TEXT PRIMARY KEY NOT NULL,
        event_date TEXT NOT NULL,
        phase TEXT NOT NULL,
        zodiac_sign TEXT NOT NULL,
        summary TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS moon_events_event_date_idx ON moon_events(event_date);

      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, entity_type, entity_id)
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS journal_entries_user_created_at_idx ON journal_entries(user_id, created_at);

      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT UNIQUE,
        theme_mode TEXT NOT NULL,
        notifications_enabled INTEGER NOT NULL,
        premium_active INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `,
  },
  {
    id: "0002_add_language_to_settings",
    sql: `ALTER TABLE app_settings ADD COLUMN language TEXT NOT NULL DEFAULT '';`,
  },
  {
    id: "0003_add_tarot_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS tarot_cards (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        arcana TEXT NOT NULL CHECK (arcana IN ('major', 'minor')),
        suit TEXT,
        rank INTEGER NOT NULL,
        upright_meaning TEXT NOT NULL,
        reversed_meaning TEXT NOT NULL,
        keywords TEXT NOT NULL,
        description TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS tarot_cards_arcana_idx ON tarot_cards(arcana);
      CREATE INDEX IF NOT EXISTS tarot_cards_suit_idx ON tarot_cards(suit);

      CREATE TABLE IF NOT EXISTS tarot_readings (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        spread_type TEXT NOT NULL CHECK (spread_type IN ('daily', 'three_card')),
        cards_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        reading_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS tarot_readings_user_date_idx ON tarot_readings(user_id, reading_date);
    `,
  },
  {
    id: "0004_add_subscription_cache",
    sql: `
      CREATE TABLE IF NOT EXISTS subscription_cache (
        entitlement TEXT PRIMARY KEY NOT NULL,
        is_active INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT
      );
    `,
  },
  {
    id: "0005_add_premium_fields",
    sql: `
      ALTER TABLE rituals ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE library_entries ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0;

      UPDATE rituals SET is_premium = 1 WHERE slug IN (
        'cord-cutting-boundary',
        'career-path-divination',
        'ancestor-gratitude',
        'hearth-protection-circle',
        'relationship-harmony'
      );

      UPDATE library_entries SET is_premium = 1 WHERE slug IN (
        'labradorite',
        'black-tourmaline',
        'citrine',
        'brigid',
        'hekate',
        'freya',
        'thoth',
        'ankh',
        'triquetra'
      );
    `,
  },
  {
    id: "0006_expand_tarot_spread_types",
    sql: `
      CREATE TABLE IF NOT EXISTS tarot_readings_new (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        spread_type TEXT NOT NULL,
        cards_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        reading_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO tarot_readings_new SELECT * FROM tarot_readings;

      DROP TABLE tarot_readings;

      ALTER TABLE tarot_readings_new RENAME TO tarot_readings;

      CREATE INDEX IF NOT EXISTS tarot_readings_user_date_idx ON tarot_readings(user_id, reading_date);
    `,
  },
  {
    id: "0007_add_onboarding_completed",
    sql: `ALTER TABLE app_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;`,
  },
  {
    id: "0008_add_missing_indexes",
    sql: `
      CREATE INDEX IF NOT EXISTS ritual_materials_material_id_idx ON ritual_materials(material_id);
      CREATE INDEX IF NOT EXISTS materials_linked_entry_id_idx ON materials(linked_entry_id);
    `,
  },
  {
    id: "0009_add_tarot_readings_created_at_index",
    sql: `CREATE INDEX IF NOT EXISTS tarot_readings_user_created_at_idx ON tarot_readings(user_id, created_at);`,
  },
];

export function runMigrations(database: SQLiteDatabase) {
  database.execSync("PRAGMA foreign_keys = ON;");
  database.execSync(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

  const appliedRows = database.getAllSync<{ id: string }>("SELECT id FROM app_migrations;");
  const appliedIds = new Set(appliedRows.map((row) => row.id));

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) {
      continue;
    }

    database.execSync("BEGIN TRANSACTION;");

    try {
      database.execSync(migration.sql);
      database.runSync("INSERT INTO app_migrations (id, applied_at) VALUES (?, ?);", migration.id, Date.now());
      database.execSync("COMMIT;");
    } catch (error) {
      database.execSync("ROLLBACK;");
      throw error;
    }
  }
}
