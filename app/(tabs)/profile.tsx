import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Profile as ProfileRow } from '@/types/database';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * Perfil del usuario. Carga datos de `profiles`.
 * Fase 1: edición de perfil, avatar y stats reales.
 */
export default function Profile() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const displayName = profile?.full_name || profile?.username || session?.user.email || 'Jugador';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        {profile?.home_city ? <Text style={styles.city}>📍 {profile.home_city}</Text> : null}
      </View>

      <View style={styles.stats}>
        <Stat label="Partidos" value="0" />
        <Stat label="Victorias" value="0" />
        <Stat label="Logros" value="0" />
      </View>

      <View style={styles.actions}>
        <Button label="Editar perfil" variant="secondary" onPress={() => { /* Fase 1 */ }} />
        <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  city: { color: colors.textMuted, fontSize: fontSize.sm },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  stat: { alignItems: 'center' },
  statValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },
  actions: { marginTop: 'auto', marginBottom: spacing.xl, gap: spacing.sm },
});
