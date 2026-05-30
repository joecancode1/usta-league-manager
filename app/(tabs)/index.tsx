import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * Feed / Inicio. Placeholder del scaffold.
 * Fase 7: actividad real (partidos jugados, logros, nuevos seguidores).
 */
export default function Home() {
  return (
    <Screen>
      <Text style={styles.title}>Inicio</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎾</Text>
          <Text style={styles.emptyTitle}>Tu feed aparecerá aquí</Text>
          <Text style={styles.emptyBody}>
            Sigue a otros jugadores y planifica tu primer partido para empezar a ver actividad.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.lg },
  list: { gap: spacing.md, paddingBottom: spacing.xxl },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },
});
