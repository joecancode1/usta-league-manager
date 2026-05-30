import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SportPill } from '@/components/ui/SportPill';
import { SPORTS, type SportId } from '@/constants/sports';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * "Mis juegos" + esbozo de planificar un juego (selector de deporte).
 * Fase 2: formulario completo + persistencia en Supabase.
 */
export default function Games() {
  const [selectedSport, setSelectedSport] = useState<SportId | null>(null);

  return (
    <Screen>
      <Text style={styles.title}>Planificar un juego</Text>

      <Text style={styles.section}>Elige un deporte</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        {SPORTS.map((sport) => (
          <SportPill
            key={sport.id}
            sport={sport}
            selected={selectedSport === sport.id}
            onPress={() => setSelectedSport(sport.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.cta}>
        <Button
          label="Continuar"
          onPress={() => {
            /* Fase 2: navegar al formulario de creación */
          }}
          disabled={!selectedSport}
        />
      </View>

      <Text style={[styles.section, { marginTop: spacing.xl }]}>Mis próximos juegos</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyBody}>Aún no tienes juegos planificados.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.lg },
  section: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.md },
  pills: { gap: spacing.sm, paddingRight: spacing.lg },
  cta: { marginTop: spacing.lg },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyBody: { color: colors.textMuted, fontSize: fontSize.sm },
});
