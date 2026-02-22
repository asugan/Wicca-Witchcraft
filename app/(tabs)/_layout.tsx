import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

import { mysticTheme } from "@/theme/tokens";

type TabIconProps = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  focused: boolean;
};

function TabIcon({ name, label, color, focused }: TabIconProps) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <View
        style={{
          minWidth: 52,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 6,
          backgroundColor: focused ? "rgba(242,193,78,0.18)" : "transparent",
          borderWidth: focused ? 1 : 0,
          borderColor: "rgba(242,193,78,0.2)",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons color={color} name={name} size={22} />
      </View>
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 0.6,
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(24,22,17,0.96)",
          borderTopColor: "rgba(255,255,255,0.06)",
          height: 86,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: mysticTheme.colors.primary,
        tabBarInactiveTintColor: mysticTheme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Moon" name="moon-waning-gibbous" />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Grimoire" name="book-open-page-variant" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Library" name="diamond-stone" />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Tools" name="cards-playing" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="Profile" name="account-circle-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
