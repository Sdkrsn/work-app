import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { PersonalHomeScreen } from '../screens/personal/PersonalHomeScreen';
import { IdeasScreen } from '../screens/personal/IdeasScreen';
import { IdeaFormScreen } from '../screens/personal/IdeaFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function IdeasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="IdeasMain" component={IdeasScreen} />
      <Stack.Screen name="IdeaForm" component={IdeaFormScreen} />
    </Stack.Navigator>
  );
}

export function PersonalTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.hairlineOnBg,
          height: 56 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom || 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subOnBg,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="PersonalHome"
        component={PersonalHomeScreen}
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Ideas"
        component={IdeasStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="bulb-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
