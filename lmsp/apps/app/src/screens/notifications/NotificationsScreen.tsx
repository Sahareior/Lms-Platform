import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, CheckCheck } from 'lucide-react-native';
import {
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  timeAgo,
} from '@my-monorepo/store';

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

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();
  const { data, isLoading, refetch } = useGetMyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications ?? [];

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Notifications"
        subtitle={
          data?.unreadCount
            ? `${data.unreadCount} unread`
            : 'You are all caught up'
        }
        onBack={navigation.goBack}
        right={
          data?.unreadCount ? (
            <Pressable
              onPress={() => markAll().catch(() => undefined)}
              disabled={markingAll}
              hitSlop={8}
            >
              <CheckCheck size={18} color={colors.accent} />
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <Loader label="Loading notifications…" />
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            message="Exam announcements and account updates will appear here."
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              onPress={() => {
                if (!notification.read) {
                  markRead(notification._id).catch(() => undefined);
                }
              }}
              style={{
                borderColor: notification.read
                  ? colors.borderSoft
                  : colors.accent,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: 4,
                }}
              >
                {!notification.read ? (
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: colors.accent,
                    }}
                  />
                ) : null}
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: '800',
                    fontSize: 13,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 9 }}>
                  {timeAgo(notification.createdAt)}
                </Text>
              </View>
              <Text style={{ color: colors.sub, fontSize: 11, lineHeight: 17 }}>
                {notification.message}
              </Text>
              {notification.type ? (
                <View style={{ marginTop: spacing.sm }}>
                  <Badge label={notification.type} tone="info" />
                </View>
              ) : null}
            </Card>
          ))}

          <Button
            label="Mark all as read"
            variant="secondary"
            small
            loading={markingAll}
            onPress={() => markAll().catch(() => undefined)}
          />
        </View>
      )}

      <View
        style={{
          marginTop: spacing.lg,
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius,
          padding: spacing.md,
        }}
      >
        <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16 }}>
          Notifications are also delivered to the website. Opening one here marks
          it as read everywhere.
        </Text>
      </View>
    </Screen>
  );
}
