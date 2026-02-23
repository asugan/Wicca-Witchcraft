import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMysticTheme } from "@/theme/use-mystic-theme";

type TabIconProps = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  focused: boolean;
  surfaceColor: string;
  borderColor: string;
};

function TabIcon({ name, color, focused, surfaceColor, borderColor }: TabIconProps) {
  return (
    <View
      style={[
        styles.iconWrap,
        focused && {
          backgroundColor: surfaceColor,
          borderWidth: 1,
          borderColor,
        },
      ]}
    >
      <MaterialCommunityIcons color={color} name={name} size={22} />
    </View>
  );
}

export default function TabsLayout() {
  const theme = useMysticTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: "rgba(255,255,255,0.06)",
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(6, insets.bottom - 2),
        },
        tabBarLabelPosition: "below-icon",
        tabBarShowLabel: true,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.moon"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              name="moon-waning-gibbous"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          title: t("nav.grimoire"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              name="book-open-page-variant"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t("nav.library"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              name="diamond-stone"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: t("nav.tools"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              name="cards-playing"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              name="account-circle-outline"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: 1,
  },
  tabBarLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  iconWrap: {
    width: 52,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
