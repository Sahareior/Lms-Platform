import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyRound } from 'lucide-react-native';
import { useResetPasswordMutation } from '@my-monorepo/store';

import type { AuthStackParamList } from '../../navigation/types';
import { AuthScaffold } from './AuthScaffold';
import { Button, ErrorState, Field } from '../../ui';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const [reset, { isLoading }] = useResetPasswordMutation();

  const [token, setToken] = useState(route.params?.token || '');
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!token.trim()) return setError('Enter the reset token from your email.');
    if (password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    try {
      await reset({
        token: token.trim(),
        email: email.trim() || undefined,
        newPassword: password,
      }).unwrap();
      setDone(true);
    } catch (err: any) {
      setError(
        err?.data?.message ||
          'Could not reset your password. The token may have expired.'
      );
    }
  };

  return (
    <AuthScaffold
      title="Choose a new password"
      subtitle="Paste the token from the reset email and set a password you have not used before."
      footer={
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>
            Back to sign in
          </Text>
        </Pressable>
      }
    >
      {error ? <ErrorState message={error} /> : null}

      {done ? (
        <>
          <Text
            style={{
              color: colors.success,
              fontSize: 13,
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            Your password has been updated. Sign in with your new password.
          </Text>
          <Button
            label="Go to sign in"
            onPress={() => navigation.navigate('Login')}
          />
        </>
      ) : (
        <>
          <Field
            label="Reset token"
            value={token}
            onChangeText={setToken}
            placeholder="Paste the token"
            autoCapitalize="none"
          />
          <Field
            label="Email (optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />
          <Field
            label="Confirm new password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat the password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Button
            label="Update password"
            onPress={submit}
            loading={isLoading}
            icon={KeyRound}
          />
        </>
      )}
    </AuthScaffold>
  );
}
