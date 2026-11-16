import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eye, EyeOff, LogIn } from 'lucide-react-native';
import {
  useAppDispatch,
  useLoginMutation,
  type LoginRequest,
} from '@my-monorepo/store';

import type { AuthStackParamList } from '../../navigation/types';
import { AuthScaffold } from './AuthScaffold';
import { Button, ErrorState, Field } from '../../ui';
import { useAppTheme, spacing } from '../../theme';
import { applyAuthResponse } from '../../lib/sessionActions';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('That email address does not look valid.');
      return;
    }

    try {
      const payload: LoginRequest = { email: trimmed, password };
      const data = await login(payload).unwrap();
      await applyAuthResponse(dispatch, data as any);
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.error ||
          'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to continue your preparation. Your progress is saved across web and mobile."
      footer={
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <Text style={{ color: colors.sub, fontSize: 12 }}>
            New here?{' '}
            <Text style={{ color: colors.accent, fontWeight: '800' }}>
              Create an account
            </Text>
          </Text>
        </Pressable>
      }
    >
      {error ? <ErrorState message={error} /> : null}

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
      />

      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={submit}
        right={
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
            {showPassword ? (
              <EyeOff size={18} color={colors.muted} />
            ) : (
              <Eye size={18} color={colors.muted} />
            )}
          </Pressable>
        }
      />

      <Pressable
        onPress={() => navigation.navigate('ForgotPassword')}
        style={{ alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg }}
        hitSlop={8}
      >
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>
          Forgot password?
        </Text>
      </Pressable>

      <Button
        label="Sign In"
        onPress={submit}
        loading={isLoading}
        icon={LogIn}
      />

      <View style={{ height: spacing.md }} />
      <Text
        style={{
          color: colors.muted,
          fontSize: 10,
          textAlign: 'center',
          lineHeight: 15,
        }}
      >
        By signing in you agree to use the platform for your own study
        preparation.
      </Text>
    </AuthScaffold>
  );
}
