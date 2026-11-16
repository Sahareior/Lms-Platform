import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, LogOut, Moon, ShieldCheck, Sun } from 'lucide-react-native';
import {
  useAddUserInfoMutation,
  useAppDispatch,
  useAppSelector,
  useGetExamsQuery,
  useGetMeQuery,
  useRemoveExamMutation,
  useSelectExamMutation,
  getAuthToken,
  loginSuccess,
  logout,
  setAuthToken,
  clearAuthTokens,
  updateUser,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  Loader,
  Screen,
  SectionHeader,
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';
import { clearSession } from '../../lib/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { colors, isDark, setTheme, theme, radius } = useAppTheme();

  const reduxUser = useAppSelector((s) => s.user.user);
  const { data: me, isLoading, refetch } = useGetMeQuery();
  const { data: examsRaw } = useGetExamsQuery();
  const [selectExam, { isLoading: isSelecting }] = useSelectExamMutation();
  const [removeExam, { isLoading: isRemoving }] = useRemoveExamMutation();
  const [addUserInfo, { isLoading: isSaving }] = useAddUserInfoMutation();

  const user: any = me || reduxUser;
  const userId = user?._id;

  const exams: any[] = useMemo(() => {
    const raw: any = examsRaw;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  }, [examsRaw]);

  const selectedIds: string[] = useMemo(() => {
    const raw = user?.selectedExams;
    if (!Array.isArray(raw)) return [];
    return raw.map((e: any) => String(e?._id || e));
  }, [user]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [institute, setInstitute] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingExam, setPendingExam] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setStudentClass(user.studentClass || user.class || '');
    setInstitute(user.institute || '');
  }, [user?._id]);

  const saveProfile = async () => {
    if (!userId) return;
    setError(null);
    try {
      await addUserInfo({
        id: userId,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          studentClass: studentClass.trim(),
          class: studentClass.trim(),
          institute: institute.trim(),
        },
      }).unwrap();
      dispatch(
        updateUser({
          name: name.trim(),
          phone: phone.trim(),
          studentClass: studentClass.trim(),
          class: studentClass.trim(),
          institute: institute.trim(),
        })
      );
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.data?.message || 'Could not save your profile.');
    }
  };

  const toggleExam = async (id: string) => {
    if (!userId || pendingExam) return;
    setError(null);
    setPendingExam(id);
    try {
      if (selectedIds.includes(id)) {
        await removeExam({ userId, examId: [id] }).unwrap();
      } else {
        await selectExam({ userId, examId: [id] }).unwrap();
      }
      await refetch();
    } catch (err: any) {
      setError(err?.data?.message || 'Could not update your exams.');
    } finally {
      setPendingExam(null);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will be signed out on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setAuthToken(null);
          clearAuthTokens();
          await clearSession();
          dispatch(logout());
        },
      },
    ]);
  };

  if (isLoading && !user) {
    return (
      <Screen>
        <AppBar title="Settings" onBack={navigation.goBack} />
        <Loader label="Loading your profile…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar
        title="Settings"
        subtitle="Profile, exams and appearance"
        onBack={navigation.goBack}
      />

      {error ? <ErrorState message={error} /> : null}

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900', flex: 1 }}>
            Profile
          </Text>
          {saved ? <Badge label="Saved" tone="success" /> : null}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field
            label="Email"
            value={user?.email || ''}
            editable={false}
            placeholder="Email"
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
          />
          <Field
            label="Class / level"
            value={studentClass}
            onChangeText={setStudentClass}
            placeholder="e.g. HSC 2nd year"
          />
          <Field
            label="Institution"
            value={institute}
            onChangeText={setInstitute}
            placeholder="School, college or university"
          />
          <Button
            label="Save profile"
            loading={isSaving}
            onPress={saveProfile}
            disabled={!userId}
          />
        </View>
      </Card>

      <SectionHeader title="My exams" />
      <Card>
        <Text style={{ color: colors.sub, fontSize: 11, lineHeight: 17 }}>
          These exams drive your dashboard, mock exams and question center.
        </Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {exams.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              No exams available to select.
            </Text>
          ) : (
            exams.map((exam) => {
              const active = selectedIds.includes(String(exam._id));
              const busy =
                pendingExam === exam._id && (isSelecting || isRemoving);
              return (
                <Pressable
                  key={exam._id}
                  onPress={() => toggleExam(exam._id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingVertical: 10,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.borderSoft,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.borderSoft,
                      backgroundColor: active ? colors.accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active ? <Check size={12} color={colors.onAccent} /> : null}
                  </View>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 12,
                      fontWeight: '700',
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {exam.name}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </Card>

      <SectionHeader title="Appearance" />
      <Card>
        <Segmented
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={theme}
          onChange={setTheme}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.md,
          }}
        >
          {isDark ? (
            <Moon size={15} color={colors.accent} />
          ) : (
            <Sun size={15} color={colors.accent} />
          )}
          <Text style={{ color: colors.sub, fontSize: 11, flex: 1 }}>
            {isDark
              ? 'Graphite theme — easy on the eyes at night.'
              : 'Paper theme — the classic Geneseon look.'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="Account" />
      <Card>
        <Button
          label="Notifications"
          variant="secondary"
          small
          onPress={() => navigation.navigate('Notifications')}
        />
        <View style={{ height: spacing.sm }} />
        <Button
          label="Privacy Policy"
          variant="secondary"
          small
          icon={ShieldCheck}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <View style={{ height: spacing.sm }} />
        <Button
          label="Log out"
          variant="ghost"
          small
          icon={LogOut}
          onPress={confirmLogout}
        />
      </Card>

      <Text
        style={{
          color: colors.muted,
          fontSize: 10,
          textAlign: 'center',
          marginTop: spacing.lg,
        }}
      >
        Geneseon mobile · {getAuthToken() ? 'signed in' : 'offline'}
      </Text>
    </Screen>
  );
}
