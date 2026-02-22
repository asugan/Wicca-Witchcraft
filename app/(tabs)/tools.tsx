import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mysticTheme, typefaces } from "@/theme/tokens";

const cardSymbols = ["infinity", "white-balance-sunny", "auto-fix"] as const;

function useFloating(delay: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const start = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: -8, duration: 1800, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(start);
  }, [delay, value]);

  return value;
}

export default function ToolsScreen() {
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  const floatOne = useFloating(0);
  const floatTwo = useFloating(350);
  const floatThree = useFloating(650);

  const allRevealed = useMemo(() => revealed.every(Boolean), [revealed]);

  const toggleOne = (index: number) => {
    setRevealed((prev) => prev.map((item, cardIndex) => (cardIndex === index ? !item : item)));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.bgGradient} />
      <View style={styles.starOne} />
      <View style={styles.starTwo} />
      <View style={styles.starThree} />
      <View style={styles.starFour} />

      <View style={styles.header}>
        <Pressable>
          <MaterialCommunityIcons color="rgba(242,193,78,0.8)" name="close" size={30} />
        </Pressable>
        <Text style={styles.headerTitle}>The Spread</Text>
        <Pressable>
          <MaterialCommunityIcons color="rgba(242,193,78,0.8)" name="information-outline" size={28} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.cardsRow}>
          {[floatOne, floatTwo, floatThree].map((floating, index) => (
            <Animated.View key={cardSymbols[index]} style={[styles.cardAnimatedWrap, { transform: [{ translateY: floating }] }]}>
              <Pressable onPress={() => toggleOne(index)} style={styles.cardBack}>
                <View style={styles.cardInnerBorder} />
                <MaterialCommunityIcons
                  color="rgba(242,193,78,0.7)"
                  name={revealed[index] ? "cards-playing-heart-multiple" : cardSymbols[index]}
                  size={44}
                />
                {revealed[index] ? <Text style={styles.revealedText}>Revealed</Text> : null}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={styles.promptWrap}>
          <Text style={styles.promptText}>{'"Focus on your question and tap to draw"'}</Text>
          <View style={styles.promptLine} />
        </View>

        <Pressable
          onPress={() => setRevealed([true, true, true])}
          style={[styles.secondaryButton, allRevealed && styles.secondaryButtonDone]}
        >
          <Text style={styles.secondaryButtonLabel}>{allRevealed ? "All Cards Revealed" : "Reveal All"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mysticTheme.colors.mysticPurple,
  },
  bgGradient: {
    position: "absolute",
    top: -180,
    left: -120,
    width: 540,
    height: 540,
    borderRadius: 270,
    backgroundColor: "rgba(46,26,71,0.9)",
  },
  starOne: {
    position: "absolute",
    top: 80,
    left: 36,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(242,193,78,0.8)",
  },
  starTwo: {
    position: "absolute",
    top: 160,
    right: 64,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(242,193,78,0.55)",
  },
  starThree: {
    position: "absolute",
    bottom: 260,
    left: 54,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  starFour: {
    position: "absolute",
    bottom: 200,
    right: 38,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(242,193,78,0.4)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: {
    color: mysticTheme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  cardsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 36,
  },
  cardAnimatedWrap: {
    flex: 1,
  },
  cardBack: {
    borderRadius: 12,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.45)",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cardInnerBorder: {
    position: "absolute",
    inset: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.25)",
  },
  revealedText: {
    color: mysticTheme.colors.primary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  promptWrap: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  promptText: {
    color: "rgba(242,193,78,0.9)",
    textAlign: "center",
    fontFamily: typefaces.display,
    fontSize: 20,
    fontStyle: "italic",
    maxWidth: 280,
    lineHeight: 30,
  },
  promptLine: {
    width: 82,
    height: 1,
    backgroundColor: "rgba(242,193,78,0.5)",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.35)",
    backgroundColor: "rgba(242,193,78,0.1)",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  secondaryButtonDone: {
    backgroundColor: "rgba(242,193,78,0.2)",
  },
  secondaryButtonLabel: {
    color: mysticTheme.colors.primary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "600",
  },
});
