import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors, scheme } = useTheme();

  if (scheme === 'light') {
    return (
      <LinearGradient colors={colors.bgGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ flex: 1 }, style]}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
}
