import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { useDatabaseReady } from '@/context/database-context';
import { useSplashAnimation } from '@/hooks/use-splash-animation';

const LOGO_SIZE = 140;
const BAR_WIDTH = 200;
const ANIM_DURATION = 1500;
const BG_COLOR = '#181611';
const CIRCLE_COLOR = '#2A2416';
const GOLD_COLOR = '#C4A46C';


export function AnimatedSplashScreen({ children }: { children: React.ReactNode }) {
  const { isReady } = useDatabaseReady();
  const { isVisible, hideSplash } = useSplashAnimation();
  const barAnim = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isReady || hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.timing(barAnim, {
      toValue: 1,
      duration: ANIM_DURATION,
      useNativeDriver: false,
    }).start(async () => {
      await SplashScreen.hideAsync();
      hideSplash();
    });
  }, [isReady, barAnim, hideSplash]);

  if (!isVisible) {
    return <>{children}</>;
  }

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_WIDTH],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Image
          source={require('../../assets/images/foreground.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: CIRCLE_COLOR,
    borderWidth: 2,
    borderColor: GOLD_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: LOGO_SIZE * 0.75,
    height: LOGO_SIZE * 0.75,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: 3,
    backgroundColor: CIRCLE_COLOR,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: GOLD_COLOR,
    borderRadius: 2,
  },
});
