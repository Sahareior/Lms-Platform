import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useAppDispatch, useRegisterMutation } from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import { AuthScaffold } from './AuthScaffold';
import { Button, ErrorState, Field } from '../../ui';
import { useAppTheme, spacing } from '../../theme';
import { applyAuthResponse } from '../../lib/sessionActions';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      return setError('Please enter a valid email address.');
    if (password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (!agreed)
      return setError('Please accept the study terms to create an account.');

    try {
      const data = await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      }).unwrap();
      await applyAuthResponse(dispatch, data as any);
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.error ||
          'Registration failed. Please try again.'
      );
    }
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="One account for the website and the app — your exams, notes, attempts and XP stay in sync."
      footer={
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={{ color: colors.sub, fontSize: 12 }}>
            Already registered?{' '}
            <Text style={{ color: colors.accent, fontWeight: '800' }}>
              Sign in
            </Text>
          </Text>
        </Pressable>
      }
    >
      {error ? <ErrorState message={error} /> : null}

      <Field
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        autoCapitalize="words"
        autoComplete="name"
      />

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
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

      <Field
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat your password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <Pressable
        onPress={() => setAgreed((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: agreed ? colors.accent : colors.borderSoft,
            backgroundColor: agreed ? colors.accent : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
          }}
        >
          {agreed ? (
            <Text style={{ color: colors.onAccent, fontSize: 11, fontWeight: '900' }}>
              ✓
            </Text>
          ) : null}
        </View>
        <Text style={{ color: colors.sub, fontSize: 11, flex: 1, lineHeight: 16 }}>
          I agree to keep my account details accurate and to use this platform
          for my own learning, and I have read the{' '}
          <Text
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={{ color: colors.accent, fontWeight: '800' }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </Pressable>

      <Button
        label="Create Account"
        onPress={submit}
        loading={isLoading}
        icon={UserPlus}
      />
    </AuthScaffold>
  );
}
