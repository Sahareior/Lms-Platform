import React from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExternalLink, Users } from 'lucide-react-native';
import { useGetStudyGroupLinksQuery } from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  Loader,
  Screen,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyGroups'>;

const PLATFORM_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  other: 'Community',
};

export default function StudyGroupsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { data, isLoading, refetch } = useGetStudyGroupLinksQuery();
  const links = data?.links ?? [];

  const open = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot open link', 'This link is not supported on your device.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Cannot open link', 'Please try again later.');
    }
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Study groups"
        subtitle="Learn together with other candidates"
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <Loader label="Loading groups…" />
      ) : links.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No groups yet"
            message="Official community links will be posted here."
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {links.map((link) => (
            <Card key={link._id}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}
                  >
                    {link.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.sub,
                      fontSize: 11,
                      lineHeight: 17,
                      marginTop: 3,
                    }}
                  >
                    {link.description || 'Join the discussion and ask questions.'}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <Badge
                      label={PLATFORM_LABEL[link.platform] || link.platform}
                      tone="info"
                    />
                  </View>
                </View>
              </View>
              <View style={{ marginTop: spacing.md }}>
                <Button
                  label={`Open in ${PLATFORM_LABEL[link.platform] || 'app'}`}
                  small
                  icon={ExternalLink}
                  onPress={() => open(link.url)}
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
