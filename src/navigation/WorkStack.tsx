import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { HomeScreen } from '../screens/work/HomeScreen';
import { MeetingsScreen } from '../screens/work/MeetingsScreen';
import { MeetingNotesScreen } from '../screens/work/MeetingNotesScreen';
import { ProjectsScreen } from '../screens/work/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/work/ProjectDetailScreen';
import { ProjectFormScreen } from '../screens/work/ProjectFormScreen';
import { DailyLogScreen } from '../screens/work/DailyLogScreen';
import { SalaryScreen } from '../screens/work/SalaryScreen';
import { CalendarScreen } from '../screens/work/CalendarScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MeetingNotes" component={MeetingNotesScreen} />
      <Stack.Screen name="Salary" component={SalaryScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function MeetingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MeetingsMain" component={MeetingsScreen} />
      <Stack.Screen name="MeetingNotes" component={MeetingNotesScreen} />
    </Stack.Navigator>
  );
}

function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProjectsMain" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
      <Stack.Screen name="MeetingNotes" component={MeetingNotesScreen} />
    </Stack.Navigator>
  );
}

export function WorkTabs() {
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
        name="Home"
        component={HomeStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Meetings"
        component={MeetingsStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="DailyLog"
        component={DailyLogScreen}
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-done-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
