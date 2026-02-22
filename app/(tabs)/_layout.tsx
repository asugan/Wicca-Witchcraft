import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useMysticTheme } from "@/theme/use-mystic-theme";

type TabIconProps = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  focused: boolean;
  surfaceColor: string;
  borderColor: string;
};

function TabIcon({ name, label, color, focused, surfaceColor, borderColor }: TabIconProps) {
  return (
    <View style={styles.iconWrap}>
      <View
        style={{
          minWidth: 52,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 6,
          backgroundColor: focused ? surfaceColor : "transparent",
          borderWidth: focused ? 1 : 0,
          borderColor,
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons color={color} name={name} size={22} />
      </View>
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 0.7,
          color,
          fontWeight: focused ? "700" : "500",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useMysticTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: `${theme.colors.background}F5`,
          borderTopColor: "rgba(255,255,255,0.06)",
          height: 86,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              label="Moon"
              name="moon-waning-gibbous"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              label="Grimoire"
              name="book-open-page-variant"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              label="Library"
              name="diamond-stone"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              label="Tools"
              name="cards-playing"
              surfaceColor={`${theme.colors.primary}2D`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              borderColor={`${theme.colors.primary}33`}
              color={color}
              focused={focused}
              label="Profile"
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
  iconWrap: {
    alignItems: "center",
    gap: 2,
  },
});
