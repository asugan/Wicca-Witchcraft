export type Translations = {
  common: {
    close: string;
  };
  nav: {
    moon: string;
    grimoire: string;
    library: string;
    tools: string;
    profile: string;
  };
  home: {
    astrologicalDate: string;
    dailyIntention: string;
    dailyTarot: string;
    viewAll: string;
    cardOfTheDay: string;
    dailyDraw: string;
    logRitual: string;
    dailyHoroscope: string;
    cleanseSpace: string;
    defaultCardTitle: string;
    defaultCardQuote: string;
    revealGuidance: string;
    recommendedRitual: string;
    openRitual: string;
    duration: string;
  };
  grimoire: {
    title: string;
    searchPlaceholder: string;
    filterDifficulty: string;
    filterAllLevels: string;
    filterBeginner: string;
    filterIntermediate: string;
    filterAdvanced: string;
    filterMoonPhase: string;
    filterAllPhases: string;
    filterMaterial: string;
    filterAllMaterials: string;
    ritualsFound: string;
    currentFocus: string;
    chapters: string;
    noRitualsMatch: string;
    moonPhaseNew: string;
    moonPhaseWaxingCrescent: string;
    moonPhaseFirstQuarter: string;
    moonPhaseWaxingGibbous: string;
    moonPhaseFull: string;
    moonPhaseWaningGibbous: string;
    moonPhaseWaningMoon: string;
    moonPhaseWaningCrescent: string;
  };
  library: {
    title: string;
    subtitle: string;
    filterAll: string;
    typeCrystal: string;
    typeHerb: string;
    typeCandle: string;
    typeSymbol: string;
    typeDeity: string;
  };
  tools: {
    overline: string;
    title: string;
    subtitle: string;
    tarotSpread: string;
    cardPast: string;
    cardPresent: string;
    cardFuture: string;
    cardRevealed: string;
    tarotPrompt: string;
    revealAll: string;
    allRevealed: string;
    reset: string;
    moonCalendar: string;
    astroTimeline: string;
  };
  profile: {
    title: string;
    subtitle: string;
    favorites: string;
    savedCount: string;
    noFavorites: string;
    bookOfShadows: string;
    entriesCount: string;
    entryTitlePlaceholder: string;
    moodPlaceholder: string;
    contentPlaceholder: string;
    addEntry: string;
    updateEntry: string;
    cancelEdit: string;
    emptyJournal: string;
  };
  settings: {
    title: string;
    personal: string;
    remindersTitle: string;
    remindersDescription: string;
    permissionNotGranted: string;
    remindersActive: string;
    remindersOff: string;
    activeReminder: string;
    inactiveReminder: string;
    languageLabel: string;
    languageHint: string;
    languageEnglish: string;
    languageTurkish: string;
    languageGerman: string;
    languageSpanish: string;
    languageFrench: string;
    languageItalian: string;
    languagePortuguese: string;
    languageSavedMessage: string;
    saveErrorMessage: string;
  };
  ritual: {
    notFound: string;
    goBack: string;
    difficulty: string;
    moon: string;
    materials: string;
    preparedCount: string;
    theRitual: string;
    beginRitualMode: string;
    close: string;
    cleansing: string;
    care: string;
  };
};

export const enTranslations: Translations = {
  common: {
    close: "Close",
  },
  nav: {
    moon: "Moon",
    grimoire: "Grimoire",
    library: "Library",
    tools: "Tools",
    profile: "Profile",
  },
  home: {
    astrologicalDate: "Astrological Date",
    dailyIntention: "Daily Intention",
    dailyTarot: "Daily Tarot",
    viewAll: "View All",
    cardOfTheDay: "Card of the Day",
    dailyDraw: "Daily Draw",
    logRitual: "Log Ritual",
    dailyHoroscope: "Daily Horoscope",
    cleanseSpace: "Cleanse Space",
    defaultCardTitle: "The Star",
    defaultCardQuote: "Hope is the light that guides you through the darkness.",
    revealGuidance: "Reveal Guidance",
    recommendedRitual: "Recommended Ritual",
    openRitual: "Open Ritual",
    duration: "{{durationMinutes}} min",
  },
  grimoire: {
    title: "Book of Shadows",
    searchPlaceholder: "Search spells, crystals, herbs...",
    filterDifficulty: "Difficulty",
    filterAllLevels: "All Levels",
    filterBeginner: "Beginner",
    filterIntermediate: "Intermediate",
    filterAdvanced: "Advanced",
    filterMoonPhase: "Moon Phase",
    filterAllPhases: "All Phases",
    filterMaterial: "Material",
    filterAllMaterials: "All Materials",
    ritualsFound: "{{count}} rituals found",
    currentFocus: "Current Focus",
    chapters: "Grimoire Chapters",
    noRitualsMatch: "No rituals match your current filters.",
    moonPhaseNew: "New",
    moonPhaseWaxingCrescent: "Waxing Crescent",
    moonPhaseFirstQuarter: "First Quarter",
    moonPhaseWaxingGibbous: "Waxing Gibbous",
    moonPhaseFull: "Full",
    moonPhaseWaningGibbous: "Waning Gibbous",
    moonPhaseWaningMoon: "Waning Moon",
    moonPhaseWaningCrescent: "Waning Crescent",
  },
  library: {
    title: "Mystic Library",
    subtitle: "Explore cross-linked entries to deepen your ritual practice.",
    filterAll: "All",
    typeCrystal: "Crystal",
    typeHerb: "Herb",
    typeCandle: "Candle",
    typeSymbol: "Symbol",
    typeDeity: "Deity",
  },
  tools: {
    overline: "Tools",
    title: "Oracles and Cosmic Timing",
    subtitle: "Track moon phases, plan rituals, and read energetic windows.",
    tarotSpread: "3-Card Tarot Spread",
    cardPast: "Past",
    cardPresent: "Present",
    cardFuture: "Future",
    cardRevealed: "Revealed",
    tarotPrompt: "\"Focus on your question and tap each card\"",
    revealAll: "Reveal All",
    allRevealed: "All Revealed",
    reset: "Reset",
    moonCalendar: "Moon Calendar",
    astroTimeline: "Astro Timeline",
  },
  profile: {
    title: "My Space",
    subtitle: "Your saved rituals and Book of Shadows journal entries.",
    favorites: "Favorites",
    savedCount: "{{count}} saved",
    noFavorites: "No favorites yet. Save rituals from the detail page.",
    bookOfShadows: "Book of Shadows",
    entriesCount: "{{count}} entries",
    entryTitlePlaceholder: "Entry title",
    moodPlaceholder: "Mood (optional)",
    contentPlaceholder: "Write your ritual notes, dreams, or intentions...",
    addEntry: "Add Entry",
    updateEntry: "Update Entry",
    cancelEdit: "Cancel Edit",
    emptyJournal: "Your first journal entry starts your Book of Shadows.",
  },
  settings: {
    title: "Settings",
    personal: "Personal",
    remindersTitle: "Daily and Moon Reminders",
    remindersDescription: "Receive a daily ritual nudge and upcoming moon event alerts.",
    permissionNotGranted: "Permission was not granted. You can enable reminders from device settings.",
    remindersActive: "Daily and moon event reminders are now active.",
    remindersOff: "Reminders are turned off.",
    activeReminder: "Active: daily reminder at 20:30 and moon events at 09:00.",
    inactiveReminder: "Inactive: reminders are currently turned off.",
    languageLabel: "Language",
    languageHint: "Select your preferred language",
    languageEnglish: "English",
    languageTurkish: "Türkçe",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languagePortuguese: "Português",
    languageSavedMessage: "Language saved to {{language}}",
    saveErrorMessage: "Could not save language preference",
  },
  ritual: {
    notFound: "Ritual not found",
    goBack: "Go Back",
    difficulty: "Difficulty: {{value}}",
    moon: "Moon: {{value}}",
    materials: "Materials",
    preparedCount: "{{checked}}/{{total}} prepared",
    theRitual: "The Ritual",
    beginRitualMode: "Begin Ritual Mode",
    close: "Close",
    cleansing: "Cleansing: {{value}}",
    care: "Care: {{value}}",
  },
};
