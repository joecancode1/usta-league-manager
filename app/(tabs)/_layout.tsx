import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

/** Tab bar minimalista con íconos emoji (reemplazables por un set de íconos). */
function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: fontSize.lg, opacity: focused ? 1 : 0.4 }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: fontSize.xs },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="games"
        options={{ title: 'Juegos', tabBarIcon: ({ focused }) => <TabIcon icon="🎾" focused={focused} /> }}
      />
      <Tabs.Screen
        name="achievements"
        options={{ title: 'Logros', tabBarIcon: ({ focused }) => <TabIcon icon="🏅" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
      />
    </Tabs>
  );
}
