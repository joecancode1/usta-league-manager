import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

/** Contenedor base de pantalla: fondo oscuro + safe area + padding opcional. */
export function Screen({ children, style, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
