import { Pressable, StyleSheet, Text } from 'react-native';

import type { Sport } from '@/constants/sports';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

interface SportPillProps {
  sport: Sport;
  selected?: boolean;
  onPress?: () => void;
}

/** Chip de deporte con su color de acento. Usado al planificar un juego. */
export function SportPill({ sport, selected = false, onPress }: SportPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: sport.color },
        selected && { backgroundColor: sport.color },
      ]}
    >
      <Text style={styles.emoji}>{sport.emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{sport.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emoji: { fontSize: fontSize.md },
  label: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  labelSelected: { color: colors.background },
});
