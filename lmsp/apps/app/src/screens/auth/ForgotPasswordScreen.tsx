import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MailCheck } from 'lucide-react-native';
import { useForgotPasswordMutation } from '@my-monorepo/store';

import type { AuthStackParamList } from '../../navigation/types';
import { AuthScaffold } from './AuthScaffold';
import { Button, ErrorState, Field } from '../../ui';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [send, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await send({ email: trimmed }).unwrap();
      setSent(true);
    } catch (err: any) {
      setError(
        err?.data?.message || 'Could not send the reset email. Please try again.'
      );
    }
  };

  return (
    <AuthScaffold
      title="Reset your password"
      subtitle="We will email you a secure link to choose a new password."
      footer={
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>
            Back to sign in
          </Text>
        </Pressable>
      }
    >
      {error ? <ErrorState message={error} /> : null}

      {sent ? (
        <Text
          style={{
            color: colors.success,
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          If an account exists for {email.trim()}, a reset link is on its way.
          Check your inbox and spam folder.
        </Text>
      ) : null}

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <Button
        label={sent ? 'Send again' : 'Send reset link'}
        onPress={submit}
        loading={isLoading}
        icon={MailCheck}
      />

      <Pressable
        onPress={() => navigation.navigate('ResetPassword')}
        style={{ marginTop: 16, alignSelf: 'center' }}
        hitSlop={8}
      >
        <Text style={{ color: colors.sub, fontSize: 12 }}>
          Already have a reset token?{' '}
          <Text style={{ color: colors.accent, fontWeight: '800' }}>
            Enter it here
          </Text>
        </Text>
      </Pressable>
    </AuthScaffold>
  );
}
