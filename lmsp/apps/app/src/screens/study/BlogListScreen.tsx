import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookOpen } from 'lucide-react-native';
import { useGetBlogPostsQuery, formatDate } from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  Loader,
  Screen,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BlogList'>;

export default function BlogListScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { data, isLoading, refetch } = useGetBlogPostsQuery();
  const posts = data?.posts ?? [];

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Blog & notes"
        subtitle="Short reads for fast revision"
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <Loader label="Loading posts…" />
      ) : posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No posts published"
            message="Study notes and exam tips will appear here."
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {posts.map((post) => (
            <Card
              key={post._id}
              onPress={() =>
                navigation.navigate('BlogPost', { postId: post._id })
              }
            >
              <Text
                style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}
                numberOfLines={2}
              >
                {post.title}
              </Text>
              <Text
                style={{
                  color: colors.sub,
                  fontSize: 11,
                  lineHeight: 17,
                  marginTop: 4,
                }}
                numberOfLines={3}
              >
                {post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 160)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 6,
                  marginTop: spacing.sm,
                  flexWrap: 'wrap',
                }}
              >
                {post.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} label={tag} tone="info" />
                ))}
                <Text style={{ color: colors.muted, fontSize: 9, alignSelf: 'center' }}>
                  {post.author ? `${post.author} · ` : ''}
                  {formatDate(post.createdAt)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
