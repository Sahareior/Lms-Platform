import React, { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Download, FileText } from 'lucide-react-native';
import {
  useGetStudyPdfsQuery,
  useIncrementPdfDownloadMutation,
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
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PdfList'>;
type Category = 'academic' | 'job';

export default function PdfListScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<Category>('academic');
  const { data, isLoading, refetch } = useGetStudyPdfsQuery({ category });
  const [incrementDownload] = useIncrementPdfDownloadMutation();

  const pdfs = data?.pdfs ?? [];

  const openPdf = async (pdf: any) => {
    if (!pdf.fileUrl) return;
    incrementDownload(pdf._id).catch(() => undefined);
    try {
      await Linking.openURL(pdf.fileUrl);
    } catch {
      Alert.alert('Could not open file', 'The link may have expired.');
    }
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Study PDFs"
        subtitle="Downloadable notes for offline revision"
        onBack={navigation.goBack}
      />

      <Segmented
        options={[
          { value: 'academic', label: 'Academic' },
          { value: 'job', label: 'Job preparation' },
        ]}
        value={category}
        onChange={setCategory}
      />

      <View style={{ marginTop: spacing.md, gap: spacing.md }}>
        {isLoading ? (
          <Loader label="Loading PDFs…" />
        ) : pdfs.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileText}
              title="No PDFs here yet"
              message="New study material for this category will appear here."
            />
          </Card>
        ) : (
          pdfs.map((pdf) => (
            <Card key={pdf._id}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: colors.dangerSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={19} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}
                    numberOfLines={2}
                  >
                    {pdf.title}
                  </Text>
                  {pdf.description ? (
                    <Text
                      style={{
                        color: colors.sub,
                        fontSize: 11,
                        lineHeight: 17,
                        marginTop: 3,
                      }}
                      numberOfLines={2}
                    >
                      {pdf.description}
                    </Text>
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 6,
                      marginTop: spacing.sm,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Badge label={category === 'academic' ? 'Academic' : 'Job'} />
                    {pdf.downloadCount ? (
                      <Badge
                        label={`${pdf.downloadCount} downloads`}
                        tone="info"
                      />
                    ) : null}
                  </View>
                </View>
              </View>
              <View style={{ marginTop: spacing.md }}>
                <Button
                  label="Open / download"
                  small
                  icon={Download}
                  onPress={() => openPdf(pdf)}
                />
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
