import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetBlogPostByIdQuery, formatDate } from '@my-monorepo/store';

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

type Props = NativeStackScreenProps<RootStackParamList, 'BlogPost'>;

/** Converts simple rich-text from the CMS into readable plain text. */
function toParagraphs(html: string): string[] {
  return html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function BlogPostScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { data, isLoading } = useGetBlogPostByIdQuery(route.params.postId);
  const post = data?.post;

  const paragraphs = useMemo(
    () => (post?.content ? toParagraphs(post.content) : []),
    [post?.content]
  );

  if (isLoading) {
    return (
      <Screen>
        <AppBar title="Post" onBack={navigation.goBack} />
        <Loader label="Loading post…" />
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen>
        <AppBar title="Post" onBack={navigation.goBack} />
        <Card>
          <EmptyState
            title="Post not found"
            message="This post may have been unpublished."
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar
        title={post.title}
        subtitle={`${post.author ? `${post.author} · ` : ''}${formatDate(post.createdAt)}`}
        onBack={navigation.goBack}
      />

      {post.tags?.length ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: spacing.md,
          }}
        >
          {post.tags.map((tag) => (
            <Badge key={tag} label={tag} tone="info" />
          ))}
        </View>
      ) : null}

      <Card>
        {paragraphs.length === 0 ? (
          <Text style={{ color: colors.sub, fontSize: 13 }}>
            This post has no content yet.
          </Text>
        ) : (
          paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={{
                color: colors.text,
                fontSize: 13,
                lineHeight: 22,
                marginBottom: spacing.md,
              }}
            >
              {paragraph}
            </Text>
          ))
        )}
      </Card>
    </Screen>
  );
}
