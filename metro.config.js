// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for drizzle-kit: allow Metro to resolve .sql migration files.
// babel-plugin-inline-import handles inlining them as strings at build time.
config.resolver.sourceExts.push("sql");

module.exports = config;
