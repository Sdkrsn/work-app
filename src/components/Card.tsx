import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Card({
  children,
  style,
  glass = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
}) {
  const { colors, scheme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 14,
          borderWidth: scheme === 'dark' && glass ? 1 : 0,
          borderColor: colors.glassBorder,
          shadowColor: colors.cardShadow,
          shadowOpacity: scheme === 'light' ? 0.12 : 0,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: scheme === 'light' ? 2 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
