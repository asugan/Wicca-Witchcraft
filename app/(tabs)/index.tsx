import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

const actions = [
  { id: "log", icon: "notebook-edit-outline", label: "Log Ritual" },
  { id: "horoscope", icon: "star-four-points-outline", label: "Daily Horoscope" },
  { id: "cleanse", icon: "leaf-circle-outline", label: "Cleanse Space" },
] as const;

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.blueHalo} />
        <View pointerEvents="none" style={styles.greenHalo} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Astrological Date</Text>
            <Text style={styles.headerTitle}>October 24 • Scorpio Season</Text>
          </View>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons color={mysticTheme.colors.primary} name="bell-outline" size={22} />
            <View style={styles.notifyDot} />
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.zodiacRingOuter}>
            <View style={styles.zodiacRingInner} />
            <View style={styles.moonOrb}>
              <ImageBackground
                imageStyle={styles.moonImage}
                source={{
                  uri: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=1932&auto=format&fit=crop",
                }}
                style={styles.moonSurface}
              >
                <View style={styles.moonShade} />
              </ImageBackground>
            </View>
          </View>

          <Text style={styles.phaseTitle}>Waning Gibbous</Text>
          <View style={styles.illuminationBadge}>
            <MaterialCommunityIcons
              color={mysticTheme.colors.primary}
              name="weather-night"
              size={16}
            />
            <Text style={styles.illuminationText}>Illumination: 85%</Text>
          </View>
          <Text style={styles.phaseDescription}>
            A powerful time for release, banishing bad habits, and turning inward.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
          {actions.map((action) => (
            <Pressable key={action.id} style={styles.actionChip}>
              <MaterialCommunityIcons color={mysticTheme.colors.primary} name={action.icon} size={18} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Insight</Text>
          <Text style={styles.sectionLink}>View All</Text>
        </View>

        <View style={styles.insightCard}>
          <ImageBackground
            imageStyle={styles.insightImage}
            source={{
              uri: "https://images.unsplash.com/photo-1575035229855-0f7f828f4116?q=80&w=1964&auto=format&fit=crop",
            }}
            style={styles.insightMedia}
          >
            <View style={styles.mediaOverlay} />
            <View style={styles.mediaBadge}>
              <Text style={styles.mediaBadgeText}>Card of the Day</Text>
            </View>
          </ImageBackground>

          <View style={styles.insightBody}>
            <View style={styles.categoryLine}>
              <MaterialCommunityIcons color={mysticTheme.colors.primary} name="star-four-points" size={16} />
              <Text style={styles.categoryText}>Major Arcana</Text>
            </View>
            <Text style={styles.cardTitle}>The Star</Text>
            <Text style={styles.quote}>{'"Hope is the light that guides you through the darkness."'}</Text>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>View Interpretation</Text>
              <MaterialCommunityIcons color={mysticTheme.colors.background} name="arrow-right" size={18} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mysticTheme.colors.background,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    gap: 18,
  },
  blueHalo: {
    position: "absolute",
    top: 60,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(15,23,42,0.65)",
  },
  greenHalo: {
    position: "absolute",
    top: 200,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 120,
    backgroundColor: "rgba(6,78,59,0.25)",
  },
  header: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    color: "rgba(242,193,78,0.85)",
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  headerTitle: {
    color: mysticTheme.colors.textMain,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
    fontFamily: typefaces.display,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(39,36,27,0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  notifyDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E06666",
  },
  heroWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  zodiacRingOuter: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.22)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,193,78,0.04)",
  },
  zodiacRingInner: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(242,193,78,0.2)",
  },
  moonOrb: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: mysticTheme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  moonSurface: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  moonImage: {
    borderRadius: 80,
  },
  moonShade: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0,0,0,0.45)",
    transform: [{ translateX: 20 }],
  },
  phaseTitle: {
    color: mysticTheme.colors.textMain,
    fontSize: 34,
    fontWeight: "700",
    marginTop: 18,
    fontFamily: typefaces.display,
  },
  illuminationBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.24)",
    borderRadius: mysticTheme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "rgba(242,193,78,0.08)",
  },
  illuminationText: {
    color: mysticTheme.colors.primary,
    fontWeight: "600",
  },
  phaseDescription: {
    marginTop: 12,
    maxWidth: 290,
    textAlign: "center",
    color: mysticTheme.colors.textMuted,
    lineHeight: 22,
  },
  actionScroll: {
    marginTop: 2,
  },
  actionChip: {
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(39,36,27,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionLabel: {
    color: mysticTheme.colors.textMain,
    fontWeight: "500",
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: mysticTheme.colors.textMain,
    fontSize: 21,
    fontWeight: "700",
    fontFamily: typefaces.display,
  },
  sectionLink: {
    color: mysticTheme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  insightCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: mysticTheme.colors.surface,
  },
  insightMedia: {
    height: 210,
    justifyContent: "flex-end",
  },
  insightImage: {
    resizeMode: "cover",
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18,12,6,0.45)",
  },
  mediaBadge: {
    margin: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediaBadgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightBody: {
    padding: 18,
    gap: 10,
  },
  categoryLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryText: {
    color: mysticTheme.colors.primary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  cardTitle: {
    color: mysticTheme.colors.textMain,
    fontFamily: typefaces.display,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 38,
  },
  quote: {
    color: "#D0CABD",
    borderLeftWidth: 2,
    borderColor: "rgba(242,193,78,0.35)",
    paddingLeft: 10,
    fontStyle: "italic",
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: mysticTheme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonLabel: {
    color: mysticTheme.colors.background,
    fontWeight: "700",
  },
});
