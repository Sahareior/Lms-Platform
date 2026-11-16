import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, spacing } from '../../theme';

interface AuthScaffoldProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthScaffold({
  title,
  subtitle,
  children,
  footer,
}: AuthScaffoldProps) {
  const { colors, isDark, radius } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.lg,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: isDark ? 18 : 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.onAccent,
                fontSize: 26,
                fontWeight: '900',
              }}
            >
              G
            </Text>
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: 1.5,
            }}
          >
            GENESEON
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            AI LMS Platform
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: isDark ? colors.borderSoft : colors.border,
            padding: spacing.lg,
            ...(isDark
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.4,
                  shadowRadius: 24,
                  elevation: 6,
                }
              : {
                  shadowColor: colors.hardShadow,
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 3,
                }),
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: '900',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.sub,
              fontSize: 12,
              lineHeight: 18,
              marginBottom: spacing.lg,
            }}
          >
            {subtitle}
          </Text>

          {children}
        </View>

        {footer ? (
          <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            {footer}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export const authStyles = StyleSheet.create({
  link: { fontSize: 12, fontWeight: '700' },
});
