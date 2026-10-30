import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card, Space, Spin, Alert, Typography, message } from 'antd';
import {
  QuestionCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminQuestionsQuery,
  useLazyGetAdminQuestionByIdQuery,
  useDeleteAdminQuestionDocumentMutation,
  useQuestionAnalyzerMutation,
  type AdminQuestionSummary,
} from '@my-monorepo/store';
import {
  usePostQuestionPatternMutation,
  useLazyGetTopicsByExamAndSubjectQuery,
} from '@my-monorepo/store/src/redux/api/examApi';
import QuestionBankStats from './_components/QuestionBankStats';
import QuestionBankFilters from './_components/QuestionBankFilters';
import type { QuestionBankFilterValues } from './_components/QuestionBankFilters';
import QuestionBankTable from './_components/QuestionBankTable';
import { useQuestionBankLookups } from './_components/useQuestionBankLookups';
import { buildAnalyzerPayload } from './_components/questionBankUtils';

const { Text } = Typography;

const EMPTY_FILTERS: QuestionBankFilterValues = {
  exam: '',
  examVersion: '',
  subject: '',
  board: '',
};

/**
 * Question Bank — the overview of every stored question document.
 *
 * This page only lists and filters documents; individual questions are edited
 * on the dedicated QuestionManager page (`/admin/question-bank/:documentId`).
 */
const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<QuestionBankFilterValues>(EMPTY_FILTERS);

  // Empty strings must be dropped from the query, and the object has to stay
  // referentially stable or RTK Query refetches on every render.
  const filterParams = useMemo(() => {
    const params: { exam?: string; examVersion?: string; subject?: string; board?: string } = {};
    if (filters.exam) params.exam = filters.exam;
    if (filters.examVersion) params.examVersion = filters.examVersion;
    if (filters.subject) params.subject = filters.subject;
    if (filters.board) params.board = filters.board;
    return Object.keys(params).length ? params : undefined;
  }, [filters]);

  const { data: questions, isLoading, isFetching, error, refetch } = useGetAdminQuestionsQuery(filterParams);
  const lookups = useQuestionBankLookups();

  // Analysis needs the full data array, which the summaries endpoint doesn't
  // carry — fetch the single document on demand instead.
  const [fetchQuestionDoc] = useLazyGetAdminQuestionByIdQuery();

  const [deleteDocument] = useDeleteAdminQuestionDocumentMutation();
  const [questionAnalyzer] = useQuestionAnalyzerMutation();
  const [postQuestionPattern] = usePostQuestionPatternMutation();
  const [getStoredTopics] = useLazyGetTopicsByExamAndSubjectQuery();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  const stats = useMemo(() => {
    const docs = questions ?? [];
    return {
      documents: docs.length,
      totalQuestions: docs.reduce((sum, doc) => sum + (doc.questionCount || 0), 0),
      analyzed: docs.filter((doc) => doc.analyzed).length,
    };
  }, [questions]);

  // Changing the exam invalidates its dependent filters.
  const handleFilterChange = useCallback(
    (key: keyof QuestionBankFilterValues, value: string) => {
      setFilters((prev) => {
        if (key === 'exam') {
          return { ...prev, exam: value, examVersion: '', subject: '' };
        }
        return { ...prev, [key]: value };
      });
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id).unwrap();
      message.success('Question document deleted');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete');
    }
  };

  // Retry path for pattern analysis: re-runs the AI on a stored set without
  // re-uploading the source PDF.
  const handleAnalyzePattern = async (record: AdminQuestionSummary) => {
    if (!record.questionCount) {
      message.warning('This question set has no questions to analyze.');
      return;
    }
    setAnalyzingId(record._id);
    try {
      // The list endpoint returns summaries only — pull the full document
      // (with its data array) for the analyzer.
      const recordFull = await fetchQuestionDoc(record._id).unwrap();

      // Fetch existing stored topics for this exam & subject (token optimized: capped to top 40)
      let existingTopics: string[] = [];
      try {
        const topicsRes = await getStoredTopics({
          examId: record.exam,
          subjectId: record.subject || undefined,
        }).unwrap();
        if (Array.isArray(topicsRes)) {
          existingTopics = topicsRes.slice(0, 40).map((t: any) => t.name);
        }
      } catch {
        // Fallback gracefully if topics fetch fails
      }

      const payload = buildAnalyzerPayload(recordFull.data, new Date().getFullYear(), existingTopics);
      const res = await questionAnalyzer(payload).unwrap();

      const patternPayload: Record<string, unknown> = {
        exam: record.exam,
        res,
        questionDocumentId: record._id,
      };
      if (record.examVersion) patternPayload.examVersion = record.examVersion;
      if (record.subject) patternPayload.subject = record.subject;
      if (record.board) patternPayload.board = record.board;

      try {
        await postQuestionPattern(patternPayload).unwrap();
        message.success('Question pattern analyzed and stored successfully!');
      } catch (err: any) {
        if (err?.status === 409) {
          message.info('Question pattern already exists for this set (marked as analyzed).');
        } else {
          throw err;
        }
      }
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Analysis failed. Please retry when the AI service is available.');
    } finally {
      setAnalyzingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        className="!rounded-xl"
        message="Error Loading Question Bank"
        description="There was an error loading the question data."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>
            <QuestionCircleOutlined className="mr-2.5" />
            Question Bank
          </h2>
          <p className="text-sm text-[#5F6B64] mt-1 mb-0">
            Browse every stored question set, then open one to manage its questions.
          </p>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate('/admin/questions')}
            className="!rounded-lg"
          >
            Upload Questions
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch} loading={isFetching} className="!rounded-lg">
            Refresh
          </Button>
        </Space>
      </div>

      <QuestionBankStats {...stats} />

      <QuestionBankFilters
        values={filters}
        activeCount={activeFilterCount}
        resultCount={stats.documents}
        examOptions={lookups.examOptions}
        boardOptions={lookups.boardOptions}
        getVersionOptions={lookups.versionsForExam}
        getSubjectOptions={lookups.subjectsForExam}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      <Card style={{ borderRadius: 12, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <QuestionBankTable
          questions={questions ?? []}
          isFetching={isFetching}
          analyzingId={analyzingId}
          getExamName={lookups.getExamName}
          getVersionName={lookups.getVersionName}
          getSubjectName={lookups.getSubjectName}
          onManage={(record) => navigate(`/admin/question-bank/${record._id}`)}
          onAnalyze={handleAnalyzePattern}
          onDeleteDocument={handleDeleteDocument}
        />
      </Card>

      <Text className="block mt-3 text-xs text-[#5F6B64]">
        Tip: click <strong className="text-[#9BA8A0]">Manage</strong> on a row to edit its individual questions,
        add explanations, or fix images.
      </Text>
    </div>
  );
};

export default QuestionBank;
