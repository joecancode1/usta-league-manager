import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * Catálogo de logros (placeholder con los del seed).
 * Fase 6: marcar desbloqueados desde user_achievements.
 */
const CATALOG = [
  { id: 'first_game', name: 'Primer partido', description: 'Jugaste tu primer partido en Rally.', icon: '🎉' },
  { id: 'win_1', name: 'Primera victoria', description: 'Ganaste tu primer partido.', icon: '🥇' },
  { id: 'win_10', name: 'En racha', description: 'Ganaste 10 partidos.', icon: '🔥' },
  { id: 'all_sports', name: 'Multideporte', description: 'Jugaste los 4 deportes de raqueta.', icon: '🏆' },
  { id: 'organizer_5', name: 'Anfitrión', description: 'Organizaste 5 partidos.', icon: '📅' },
];

export default function Achievements() {
  return (
    <Screen>
      <Text style={styles.title}>Logros</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {CATALOG.map((a) => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.icon}>{a.icon}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.desc}>{a.description}</Text>
            </View>
            <View style={styles.lock}>
              <Text style={styles.lockText}>🔒</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.lg },
  list: { gap: spacing.sm, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  lock: { opacity: 0.5 },
  lockText: { fontSize: fontSize.md },
});
