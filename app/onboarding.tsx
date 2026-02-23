import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { setOnboardingCompleted } from "@/db/repositories/settings-repository";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const LOCAL_USER_ID = "local-user";

// Image URLs from the design
const SLIDE_IMAGES = {
  zodiacWheel:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDih7EH7vz_ZqcONg5Yr3cE4Ux_Bg1kuLjlmLRsuD5piV7TZCmKmVO_gJgjnJ_nYJ5HM9Y5DpM_bQTFkmyoA9gCJNvXD1iONdGLDx3CSsov6GqGl2uWGvEvGf4zpjVf6MenuB9k310xPfBIwBedfbEKb1W5e7I-BS8_0bcxlVHccEza-7sCYlj28X4PM1OfUcJHhQ3LF8YbRycqBc5JLynFehPLvYE6QiepqOe2xUwEdeYuHVg9M404ef6vodD0j-aA72eCyi-CPyuu",
  sunMoon:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBk5VsiMlOMFA_XjM0yTd8gP0YqQ6YsuxWqZXo4vGuxjUEkxx7zreq1Dq55wQl-b1o7u4elOHLOhW4wb2aeKaqhU-WUNYh0IagopeZ4GgxhxUiR4NC8OdqjKXqQOgjueNo9gNoK2UzYoPj3oX2_PTkUY5KaS4AfU3B33eO9k54au_LjAnK9mvwlc-CegD4GzDdmaeZ53VJoGSaVgSp2bx4qG1KmKjKlPfMwbv6s7pwgE8rJ-oNXp0Ekn6bqE01AQxu_kZfxu_IbnDFP",
  grimoire:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRJE2jYp39Am96bShyjSFX-SGCcKwE9SSL54sqqmbHjR7KnWq2kNE_oilqq96FjM9rQjXQNz-qsd7Gdy5SQIBGcGMgK9W8JnhbGfv-vrsuF8ympBzLGCUdf6VbzINFh9bYQvYr86b6Feq6zcju30HiXGLxuFnr4bUz3-q0jAyQH79xzCnHUgpUuF3P4C6re2TdrKTJ3n48pUPeTgeTgJKuKnsJ3-lMB7wX6DIPB5PUcq_6dzOmhIEOduO5-xNKczIRXRlOu4O6nGuQ",
  tarotMoon:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAYbgZCtGX-OKbD6SjV0rHYDFZNuuiZilIhU0FRZi-9yXGpBR06Rx5PKvyyMeH0dIMvzt5ZnWvppirgag02A0XG5S-YFX3N486yj7WNC5iZD7IoKxR2SfNtxRwNrJ2LylneBrM7MbG8sF3TjDrhjzXycZmrh0Fq3E2i3R4Ytl7OOKL4sk--ygDIGbMfMJkfNCp2cK2gGVUkGtkSG-cdoqV1BK862G1CNTJ1HXX7z1ZS2VU-3b8UNsChgQDCHih-ZjpO-qaPn-AUbdhu",
  tarotPriestess:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDoPDDdZ4Pl76q6V7Qb2fVmg6QIqu6bj_iZKlLHW_xO-JfWL3tiGG7JZ4j9sq8vOQmryAAyjJupks6AbcYh51CfYp2_hQ8vJsPFXT54V2_Bodkh69bjBCa7lvSC26CxzQLrdkgFZm2WRTohzslpSYbW7XeMe1i0SdOtSUC4oAXyv1SYzEXGEI86oxX1NS_jj7jQjrXdOcHNAzi-30Ay36mfaTN0sWmAXfT4Q1dT0H6qcfg5lVSUJsNs3qHoe02zX2F4l2sPjeDpuM5C",
  tarotMagician:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB_oFzUEmtbUU9a5ke4I2Cjj60OgyOB39GfUg7nk6euM_ETahj0IlFTI4Abv8yEnq1VSq_FQURZvgAwPiAwO9wINFHNwxyXU9Hoqjp7hwfD0xKmirtGyTPY6_lBq_iWmzJKns9aktomYD2NJ2kUS_LB0fxgkCHRdiJyuKqbZg-LlUKm3GqgCmH-vA0riFVwgmGpDoDu78vOSUlXNSNNgUhWz2FcCz_XiwLADeUp0YRiLjXy0FOQyTWlo3-EgrDbopKwmDxQDHDrSF67",
};

// Slide background colors matching the design
const SLIDE_BACKGROUNDS = {
  slide1: "#0c0b16", // Deep cosmic black-blue
  slide2: "#0f1c15", // Dark forest green
  slide3: "#1a1523", // Deep velvet purple
};

type SlideData = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  background: string;
};

const SLIDES: SlideData[] = [
  {
    id: "1",
    titleKey: "onboarding.slide1Title",
    subtitleKey: "onboarding.slide1Subtitle",
    background: SLIDE_BACKGROUNDS.slide1,
  },
  {
    id: "2",
    titleKey: "onboarding.slide2Title",
    subtitleKey: "onboarding.slide2Subtitle",
    background: SLIDE_BACKGROUNDS.slide2,
  },
  {
    id: "3",
    titleKey: "onboarding.slide3Title",
    subtitleKey: "onboarding.slide3Subtitle",
    background: SLIDE_BACKGROUNDS.slide3,
  },
];

// Slide 1: Celestial Journey
function Slide1Visual(_props: { theme: ReturnType<typeof useMysticTheme> }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    rotate.start();
    glow.start();

    return () => {
      rotate.stop();
      glow.stop();
    };
  }, [rotateAnim, glowAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.visualContainer}>
      {/* Zodiac Wheel Background */}
      <Animated.View
        style={[
          styles.zodiacWheelContainer,
          { transform: [{ rotate: spin }], opacity: 0.3 },
        ]}
      >
        <Image
          source={{ uri: SLIDE_IMAGES.zodiacWheel }}
          style={styles.zodiacWheel}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Glow Effect */}
      <Animated.View
        style={[styles.glowEffect, { opacity: glowAnim }]}
      />

      {/* Sun Moon Image */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: SLIDE_IMAGES.sunMoon }}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// Slide 2: Master the Ancient Arts
function Slide2Visual(_props: { theme: ReturnType<typeof useMysticTheme> }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    float.start();
    glow.start();

    return () => {
      float.stop();
      glow.stop();
    };
  }, [floatAnim, glowAnim]);

  return (
    <View style={styles.visualContainer}>
      {/* Ambient Glow */}
      <Animated.View
        style={[styles.ambientGlow, { opacity: glowAnim }]}
      />

      {/* Grimoire Book */}
      <Animated.View
        style={[
          styles.grimoireContainer,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <View style={styles.grimoireGlow} />
        <Image
          source={{ uri: SLIDE_IMAGES.grimoire }}
          style={styles.grimoireImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

// Slide 3: Cast Your Intentions
function Slide3Visual(_props: { theme: ReturnType<typeof useMysticTheme> }) {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -10,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    const float1 = createFloat(floatAnim1, 0);
    const float2 = createFloat(floatAnim2, 1000);
    const float3 = createFloat(floatAnim3, 2000);

    float1.start();
    float2.start();
    float3.start();

    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
    };
  }, [floatAnim1, floatAnim2, floatAnim3]);

  return (
    <View style={styles.visualContainer}>
      {/* Top Glow */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      {/* Tarot Cards Container */}
      <View style={styles.tarotCardsContainer}>
        {/* Left Card - The Moon */}
        <Animated.View
          style={[
            styles.tarotCard,
            styles.tarotCardLeft,
            { transform: [{ translateY: floatAnim1 }, { rotate: "-15deg" }] },
          ]}
        >
          <Image
            source={{ uri: SLIDE_IMAGES.tarotMoon }}
            style={styles.tarotCardImage}
            resizeMode="cover"
          />
          <View style={styles.tarotCardOverlay} />
          <View style={styles.tarotCardBorder} />
          <Text style={styles.tarotCardLabel}>The Moon</Text>
        </Animated.View>

        {/* Center Card - The Magician */}
        <Animated.View
          style={[
            styles.tarotCard,
            styles.tarotCardCenter,
            { transform: [{ translateY: floatAnim2 }] },
          ]}
        >
          <Image
            source={{ uri: SLIDE_IMAGES.tarotMagician }}
            style={styles.tarotCardImage}
            resizeMode="cover"
          />
          <View style={styles.tarotCardCenterBorder} />
          <View style={styles.tarotCardCenterLabel}>
            <Text style={styles.tarotCardCenterText}>The Magician</Text>
          </View>
        </Animated.View>

        {/* Right Card - High Priestess */}
        <Animated.View
          style={[
            styles.tarotCard,
            styles.tarotCardRight,
            { transform: [{ translateY: floatAnim3 }, { rotate: "15deg" }] },
          ]}
        >
          <Image
            source={{ uri: SLIDE_IMAGES.tarotPriestess }}
            style={styles.tarotCardImage}
            resizeMode="cover"
          />
          <View style={styles.tarotCardOverlay} />
          <View style={styles.tarotCardBorder} />
          <Text style={styles.tarotCardLabel}>High Priestess</Text>
        </Animated.View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      setOnboardingCompleted(LOCAL_USER_ID, true);
      router.replace("/(tabs)");
    }
  }, [currentIndex, router]);

  const renderSlide = useCallback(
    ({ item, index }: { item: SlideData; index: number }) => {
      const title = t(item.titleKey as string);
      const subtitle = t(item.subtitleKey as string);

      // Split title for special formatting on slide 1
      const titleParts = index === 0 ? title.split(" ") : [];
      const firstTwoParts = titleParts.slice(0, 2).join(" ");
      const restParts = titleParts.slice(2).join(" ");

      return (
        <View style={[styles.slide, { backgroundColor: item.background }]}>
          {/* Star pattern overlay for slide 1 */}
          {index === 0 && <View style={styles.starsOverlay} />}

          {/* Bottom gradient overlay */}
          <View style={styles.bottomGradient} />

          {/* Visual Content */}
          <View style={styles.visualWrapper}>
            {index === 0 && <Slide1Visual theme={theme} />}
            {index === 1 && <Slide2Visual theme={theme} />}
            {index === 2 && <Slide3Visual theme={theme} />}
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            {index === 0 ? (
              <View style={styles.titleBlock}>
                <Text style={styles.titleGold}>{firstTwoParts}</Text>
                <Text style={styles.titleWhite}>{restParts}</Text>
              </View>
            ) : index === 1 ? (
              <Text style={styles.titleGradient}>{title}</Text>
            ) : (
              <Text style={styles.titleLight}>{title}</Text>
            )}
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      );
    },
    [t, theme]
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;

            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <Pressable
          style={styles.actionButton}
          onPress={handleNext}
        >
          <View style={styles.buttonGlow} />
          {isLastSlide && (
            <MaterialCommunityIcons
              name="auto-fix"
              size={22}
              color={SLIDE_BACKGROUNDS.slide1}
              style={styles.buttonIcon}
            />
          )}
          <Text style={styles.actionButtonText}>
            {isLastSlide ? t("onboarding.beginRitual") : t("onboarding.next")}
          </Text>
          {!isLastSlide && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={SLIDE_BACKGROUNDS.slide1}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const PRIMARY_GOLD = "#f2b90d";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLIDE_BACKGROUNDS.slide1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "flex-end",
  },
  starsOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: "transparent",
  },
  visualWrapper: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  visualContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // Slide 1 Styles
  zodiacWheelContainer: {
    position: "absolute",
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  zodiacWheel: {
    width: "100%",
    height: "100%",
  },
  glowEffect: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PRIMARY_GOLD,
  },
  mainImageContainer: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  // Slide 2 Styles
  ambientGlow: {
    position: "absolute",
    top: "20%",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: PRIMARY_GOLD,
  },
  grimoireContainer: {
    width: 280,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  grimoireGlow: {
    position: "absolute",
    width: "90%",
    height: "90%",
    borderRadius: 20,
    backgroundColor: `${PRIMARY_GOLD}30`,
  },
  grimoireImage: {
    width: "100%",
    height: "100%",
  },
  // Slide 3 Styles
  topGlow: {
    position: "absolute",
    top: -50,
    width: "120%",
    height: 300,
    borderRadius: 150,
    backgroundColor: `${PRIMARY_GOLD}15`,
  },
  bottomGlow: {
    position: "absolute",
    bottom: -100,
    width: "80%",
    height: 250,
    borderRadius: 125,
    backgroundColor: `${PRIMARY_GOLD}08`,
  },
  tarotCardsContainer: {
    width: "100%",
    height: 340,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  tarotCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1f1a2e",
    borderWidth: 1,
    borderColor: `${PRIMARY_GOLD}40`,
  },
  tarotCardLeft: {
    position: "absolute",
    left: 20,
    width: 140,
    height: 220,
    zIndex: 1,
  },
  tarotCardCenter: {
    width: 160,
    height: 260,
    zIndex: 2,
    borderColor: `${PRIMARY_GOLD}80`,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  tarotCardRight: {
    position: "absolute",
    right: 20,
    width: 140,
    height: 220,
    zIndex: 1,
  },
  tarotCardImage: {
    width: "100%",
    height: "100%",
  },
  tarotCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tarotCardBorder: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 2,
    borderColor: `${PRIMARY_GOLD}30`,
    borderRadius: 8,
  },
  tarotCardLabel: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: "center",
    color: `${PRIMARY_GOLD}CC`,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  tarotCardCenterBorder: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 3,
    borderColor: `${PRIMARY_GOLD}50`,
    borderRadius: 8,
  },
  tarotCardCenterLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: SLIDE_BACKGROUNDS.slide3,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: `${PRIMARY_GOLD}40`,
  },
  tarotCardCenterText: {
    color: PRIMARY_GOLD,
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: typefaces.display,
    letterSpacing: 1,
  },
  // Text Content
  textContent: {
    paddingHorizontal: 32,
    paddingBottom: 180,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 42,
    fontFamily: typefaces.display,
    width: "100%",
  },
  titleBlock: {
    width: "100%",
  },
  titleGold: {
    fontSize: 36,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 42,
    color: PRIMARY_GOLD,
    fontFamily: typefaces.display,
  },
  titleWhite: {
    fontSize: 36,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 42,
    color: "#f0f0f0",
    fontFamily: typefaces.display,
  },
  titleGradient: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 42,
    color: PRIMARY_GOLD,
    fontFamily: typefaces.display,
    width: "100%",
  },
  titleLight: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 40,
    color: "#f0f0f0",
    fontFamily: typefaces.display,
    width: "100%",
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 28,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    backgroundColor: PRIMARY_GOLD,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  actionButton: {
    width: "100%",
    maxWidth: 320,
    height: 56,
    borderRadius: 12,
    backgroundColor: PRIMARY_GOLD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    opacity: 0,
  },
  buttonIcon: {
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: SLIDE_BACKGROUNDS.slide1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
