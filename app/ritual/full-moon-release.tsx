import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

const items = ["White Candle", "Dried Sage Bundle", "Bowl of Water"];

const steps = [
  {
    roman: "I",
    title: "Cleanse Your Space",
    content:
      "Begin by lighting the sage. Waft the smoke into the corners of your room and visualize heavy energy dissolving. Whisper: I clear this space of all that is not love.",
  },
  {
    roman: "II",
    title: "Light the Candle",
    content:
      "Sit comfortably before your bowl of water. Light the white candle and focus on its steady flame as your guiding intuition.",
  },
  {
    roman: "III",
    title: "Release & Let Go",
    content:
      "Dip your fingers into the water. Imagine your worries flowing from your body and being neutralized by the bowl. Speak aloud what you release.",
  },
  {
    roman: "IV",
    title: "Close the Circle",
    content:
      "Blow out the candle to close the ritual. Pour the water into the earth to ground the energy and seal your intention.",
  },
];

export default function RitualDetailScreen() {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.texture} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialCommunityIcons color={mysticTheme.colors.primary} name="arrow-left" size={24} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setBookmarked((prev) => !prev)} style={styles.headerButton}>
            <MaterialCommunityIcons
              color={mysticTheme.colors.primary}
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
            />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <MaterialCommunityIcons color={mysticTheme.colors.primary} name="share-variant-outline" size={22} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground
          imageStyle={styles.heroImage}
          source={{
            uri: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1740&auto=format&fit=crop",
          }}
          style={styles.hero}
        >
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTag}>Celestial Rituals</Text>
          <Text style={styles.heroTitle}>Full Moon Release</Text>
        </ImageBackground>

        <Text style={styles.description}>
          Harness the powerful energy of the full moon to release what no longer serves you and open the path for new beginnings.
        </Text>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.ingredientsCard}>
          {items.map((item) => {
            const selected = Boolean(checked[item]);

            return (
              <Pressable
                key={item}
                onPress={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
                style={styles.ingredientRow}
              >
                <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                  {selected ? (
                    <MaterialCommunityIcons color={mysticTheme.colors.background} name="check" size={14} />
                  ) : null}
                </View>
                <Text style={[styles.ingredientText, selected && styles.ingredientTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
          <Text style={styles.countLabel}>{checkedCount} / {items.length} prepared</Text>
        </View>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>The Ritual</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.stepsWrap}>
          {steps.map((step, index) => (
            <View key={step.roman} style={styles.stepRow}>
              <View style={styles.stepMarker}>
                <Text style={styles.stepMarkerText}>{step.roman}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepContent}>{step.content}</Text>
              </View>
              {index !== steps.length - 1 ? <View style={styles.stepDivider} /> : null}
            </View>
          ))}
        </View>

        <Text style={styles.quote}>{'"As I will it, so mote it be."'}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.beginButton}>
          <MaterialCommunityIcons color={mysticTheme.colors.background} name="play-circle-outline" size={22} />
          <Text style={styles.beginLabel}>Begin Ritual Mode</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mysticTheme.colors.backgroundSoft,
  },
  texture: {
    position: "absolute",
    top: -140,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(242,193,78,0.05)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(34,30,16,0.85)",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    height: 260,
    justifyContent: "flex-end",
    padding: 20,
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,10,6,0.45)",
  },
  heroTag: {
    color: "rgba(242,193,78,0.85)",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: 6,
  },
  heroTitle: {
    color: mysticTheme.colors.primary,
    fontFamily: typefaces.display,
    fontSize: 44,
    lineHeight: 50,
    fontStyle: "italic",
    fontWeight: "700",
  },
  description: {
    marginTop: 16,
    color: "#D6CFBF",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 22,
  },
  sectionTitleWrap: {
    marginTop: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(242,193,78,0.34)",
  },
  sectionTitle: {
    color: mysticTheme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  ingredientsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "rgba(44,40,27,0.7)",
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.16)",
    padding: 16,
    gap: 14,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.52)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: mysticTheme.colors.primary,
    borderColor: mysticTheme.colors.primary,
  },
  ingredientText: {
    color: "#E9E3D6",
    fontSize: 18,
  },
  ingredientTextSelected: {
    color: mysticTheme.colors.primary,
  },
  countLabel: {
    marginTop: 2,
    color: "rgba(242,193,78,0.72)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  stepsWrap: {
    marginTop: 8,
    paddingHorizontal: 20,
    gap: 16,
  },
  stepRow: {
    paddingLeft: 10,
  },
  stepMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: mysticTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mysticTheme.colors.backgroundSoft,
    marginBottom: 8,
  },
  stepMarkerText: {
    color: mysticTheme.colors.primary,
    fontWeight: "700",
    fontSize: 10,
  },
  stepBody: {
    borderLeftWidth: 1,
    borderColor: "rgba(242,193,78,0.2)",
    marginLeft: 11,
    paddingLeft: 14,
  },
  stepTitle: {
    color: mysticTheme.colors.textMain,
    fontFamily: typefaces.display,
    fontStyle: "italic",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 34,
  },
  stepContent: {
    marginTop: 6,
    color: "#D8D2C4",
    fontSize: 17,
    lineHeight: 27,
  },
  stepDivider: {
    marginTop: 16,
    marginBottom: 2,
    height: 1,
    backgroundColor: "rgba(242,193,78,0.25)",
    marginLeft: 25,
  },
  quote: {
    marginTop: 22,
    marginBottom: 18,
    textAlign: "center",
    color: "rgba(242,193,78,0.7)",
    fontStyle: "italic",
    fontSize: 14,
  },
  bottomBar: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
  },
  beginButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: mysticTheme.colors.primaryBright,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  beginLabel: {
    color: mysticTheme.colors.background,
    fontWeight: "800",
    fontSize: 16,
  },
});
