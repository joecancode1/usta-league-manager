import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { supabase } from '@/lib/supabase';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * Login por "magic link" (email). Sin contraseñas.
 * Fase 1 del roadmap: añadir OTP por teléfono.
 */
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Ups', error.message);
      return;
    }
    setSent(true);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View>
          <Text style={styles.logo}>Rally</Text>
          <Text style={styles.tagline}>Tu próximo partido empieza aquí.</Text>
        </View>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentTitle}>Revisa tu correo ✉️</Text>
            <Text style={styles.sentBody}>
              Te enviamos un enlace mágico a {email}. Ábrelo en este teléfono para entrar.
            </Text>
            <Button label="Usar otro correo" variant="ghost" onPress={() => setSent(false)} />
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={styles.input}
            />
            <Button label="Entrar" onPress={onSendLink} loading={loading} />
            <Text style={styles.hint}>Sin contraseñas. Te mandamos un enlace para entrar.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  logo: { color: colors.accent, fontSize: fontSize.xxl, fontWeight: '800' },
  tagline: { color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.sm },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  hint: { color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center' },
  sentBox: { gap: spacing.md },
  sentTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  sentBody: { color: colors.textMuted, fontSize: fontSize.md, lineHeight: 22 },
});
