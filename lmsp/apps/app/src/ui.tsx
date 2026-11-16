import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react-native';
import { useAppTheme, spacing } from './theme';

// ─── Screen ──────────────────────────────────────────────────
interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomInset?: boolean;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  style,
  bottomInset = true,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const paddingBottom = (bottomInset ? insets.bottom : 0) + spacing.xl;

  if (!scroll) {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: colors.bg, paddingTop: insets.top },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        padded && { paddingHorizontal: spacing.lg },
        { paddingTop: insets.top + spacing.lg, paddingBottom },
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

// ─── Header / AppBar ────────────────────────────────────────
interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function AppBar({ title, subtitle, onBack, right }: AppBarProps) {
  const { colors, radius, isDark } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={{
            width: 38,
            height: 38,
            borderRadius: isDark ? 12 : 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: 0.2,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{ color: colors.sub, fontSize: 12, marginTop: 2 }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

// ─── Card ───────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, padded = true, onPress }: CardProps) {
  const { colors, radius, cardShadow, isDark } = useAppTheme();
  const base: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.surface,
      borderRadius: radius,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderSoft,
      padding: padded ? spacing.lg : 0,
    },
    cardShadow,
    style,
  ];

  if (!onPress) return <View style={base}>{children}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}

// ─── Buttons ────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading,
  disabled,
  small,
  full = true,
  style,
}: ButtonProps) {
  const { colors, radius, isDark } = useAppTheme();

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'accent'
        ? colors.accent
        : variant === 'danger'
          ? colors.danger
          : variant === 'secondary'
            ? colors.surface
            : 'transparent';
  const fg =
    variant === 'primary'
      ? isDark
        ? '#ffffff'
        : colors.onAccent
      : variant === 'accent'
        ? colors.onAccent
        : variant === 'danger'
          ? '#ffffff'
          : colors.text;
  const border = variant === 'ghost' ? 'transparent' : colors.border;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: isDark ? colors.borderSoft : border,
          borderRadius: radius,
          paddingVertical: small ? 9 : 14,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: disabled ? 0.5 : 1,
        },
        full && { width: '100%' },
        pressed && !disabled && { opacity: 0.8 },
        variant === 'primary' && !isDark && !disabled
          ? {
              shadowColor: colors.hardShadow,
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }
          : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : Icon ? (
        <Icon size={small ? 15 : 17} color={fg} />
      ) : null}
      <Text
        style={{
          color: fg,
          fontWeight: '800',
          fontSize: small ? 12 : 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Inputs ─────────────────────────────────────────────────
interface FieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  right?: React.ReactNode;
}

export function Field({ label, error, right, style, ...rest }: FieldProps) {
  const { colors, radius, isDark } = useAppTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label ? (
        <Text
          style={{
            color: colors.sub,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? colors.danger : isDark ? colors.borderSoft : colors.border,
          borderRadius: radius,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
        }}
      >
        <TextInput
          placeholderTextColor={colors.muted}
          style={[
            {
              flex: 1,
              color: colors.text,
              fontSize: 15,
              paddingVertical: 12,
            },
            style,
          ]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Small building blocks ──────────────────────────────────
export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent';
}) {
  const { colors, isDark } = useAppTheme();
  const map = {
    neutral: { bg: colors.surfaceAlt, fg: colors.sub },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    info: { bg: colors.infoSoft, fg: colors.info },
    accent: { bg: colors.accentSoft, fg: colors.accent },
  }[tone];

  return (
    <View
      style={{
        backgroundColor: map.bg,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderWidth: isDark ? 0 : 1,
        borderColor: isDark ? 'transparent' : colors.borderSoft,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: map.fg, fontSize: 10, fontWeight: '800' }}>
        {label}
      </Text>
    </View>
  );
}

export function ProgressBar({
  value,
  color,
  height = 8,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height,
        backgroundColor: colors.surfaceAlt,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color || colors.success,
        }}
      />
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ListRow({
  icon: Icon,
  title,
  subtitle,
  right,
  onPress,
  tone,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  tone?: string;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          marginBottom: spacing.sm,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      {Icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: tone ? `${tone}1a` : colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={17} color={tone || colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: colors.sub, fontSize: 11, marginTop: 2 }} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={16} color={colors.muted} /> : null)}
    </Pressable>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: string;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: colors.surface,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: spacing.md,
      }}
    >
      {Icon ? <Icon size={16} color={tone || colors.accent} /> : null}
      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: '900',
          marginTop: 6,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: colors.sub, fontSize: 11, fontWeight: '600' }}>
        {label}
      </Text>
      {hint ? (
        <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Loader({ label }: { label?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
      <ActivityIndicator color={colors.accent} />
      {label ? (
        <Text style={{ color: colors.sub, fontSize: 12, marginTop: spacing.sm }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
      {Icon ? <Icon size={28} color={colors.muted} /> : null}
      <Text
        style={{
          color: colors.text,
          fontWeight: '800',
          fontSize: 15,
          marginTop: spacing.md,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message ? (
        <Text
          style={{
            color: colors.sub,
            fontSize: 12,
            marginTop: 4,
            textAlign: 'center',
            lineHeight: 18,
          }}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.lg, width: 200 }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" small />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        backgroundColor: colors.dangerSoft,
        borderRadius: 10,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.danger,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>
        {message || 'Something went wrong. Please try again.'}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ marginTop: 6 }}>
          <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '900' }}>
            Retry
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: 7,
              borderRadius: radius,
              borderWidth: 1,
              borderColor: active ? colors.border : colors.borderSoft,
              backgroundColor: active ? colors.primary : colors.surface,
            }}
          >
            <Text
              style={{
                color: active
                  ? colors.onAccent
                  : colors.sub,
                fontSize: 12,
                fontWeight: '800',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Avatar({
  name,
  size = 40,
  tint,
}: {
  name?: string;
  size?: number;
  tint?: string;
}) {
  const { colors } = useAppTheme();
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tint || colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: colors.onAccent,
          fontWeight: '900',
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

export function Divider() {
  const { colors } = useAppTheme();
  return (
    <View
      style={{ height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing.md }}
    />
  );
}

export const type = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '900' } as TextStyle,
  h2: { fontSize: 18, fontWeight: '800' } as TextStyle,
  body: { fontSize: 14, lineHeight: 21 } as TextStyle,
  small: { fontSize: 12 } as TextStyle,
  tiny: { fontSize: 10 } as TextStyle,
});
