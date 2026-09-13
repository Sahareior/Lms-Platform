import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetAdminQuestionsQuery,
  useDeleteAdminSingleQuestionMutation,
  useUpdateAdminSingleQuestionMutation,
  useUpdateAdminQuestionExplanationMutation,
  useQuestionAnalyzerMutation,
} from '@my-monorepo/store';
import { usePostQuestionPatternMutation } from '@my-monorepo/store/src/redux/api/examApi';
import QuestionCard from './_components/QuestionCard';
import EditQuestionDrawer, {
  type QuestionEditPayload,
} from './_components/EditQuestionDrawer';
import ExplanationModal from './_components/ExplanationModal';
import { useQuestionBankLookups } from './_components/useQuestionBankLookups';
import {
  buildAnalyzerPayload,
  computeQuestionStats,
  filterQuestions,
  sortQuestions,
  type QuestionFlag,
  type QuestionItem,
} from './_components/questionBankUtils';

const { Text } = Typography;

const FLAG_OPTIONS: { value: QuestionFlag; label: string }[] = [
  { value: 'all', label: 'All questions' },
  { value: 'missing-explanation', label: 'Missing explanation' },
  { value: 'with-image', label: 'Has image' },
  { value: 'missing-answer', label: 'Missing answer' },
];

const STAT_CARDS = [
  { key: 'total', label: 'Questions', icon: <QuestionCircleOutlined />, accent: 'text-emerald-400 bg-emerald-500/15' },
  { key: 'withExplanation', label: 'With explanation', icon: <BookOutlined />, accent: 'text-teal-400 bg-teal-500/15' },
  { key: 'withImage', label: 'With image', icon: <PictureOutlined />, accent: 'text-purple-400 bg-purple-500/15' },
  { key: 'missingAnswer', label: 'Missing answer', icon: <CloseCircleOutlined />, accent: 'text-amber-400 bg-amber-500/15' },
] as const;

/**
 * Question Manager — one screen for every question inside a stored document.
 *
 * Replaces the old expand-nested-table flow: the paper reads top-to-bottom,
 * explaining/editing happens in a drawer that keeps the list in view, and the
 * URL is shareable (`/admin/question-bank/:documentId`).
 */
const QuestionManager: React.FC = () => {
  const { documentId = '' } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const lookups = useQuestionBankLookups();

  // There is no single-document endpoint, so we reuse the (cached) full list
  // and pick our document out of it.
  const { data: documents, isLoading, isFetching, error, refetch } = useGetAdminQuestionsQuery();
  const questionDoc = useMemo(
    () => documents?.find((doc) => doc._id === documentId),
    [documents, documentId]
  );

  const [updateQuestion, { isLoading: isSavingEdit }] = useUpdateAdminSingleQuestionMutation();
  const [updateExplanation, { isLoading: isSavingExplanation }] = useUpdateAdminQuestionExplanationMutation();
  const [deleteQuestion] = useDeleteAdminSingleQuestionMutation();
  const [questionAnalyzer] = useQuestionAnalyzerMutation();
  const [postQuestionPattern] = usePostQuestionPatternMutation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── Toolbar state ──────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [flag, setFlag] = useState<QuestionFlag>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Dialog state ───────────────────────────────────────────
  const [editing, setEditing] = useState<QuestionItem | null>(null);
  const [explaining, setExplaining] = useState<QuestionItem | null>(null);

  const ordered = useMemo(() => sortQuestions(questionDoc?.data ?? []), [questionDoc]);
  const visible = useMemo(() => filterQuestions(ordered, search, flag), [ordered, search, flag]);
  const stats = useMemo(() => computeQuestionStats(ordered), [ordered]);

  // Clamp the page so deleting the last row of the last page (or narrowing the
  // filters) can never leave the list stuck on a page that no longer exists.
  const maxPage = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, maxPage);

  const pageItems = useMemo(
    () => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [visible, currentPage, pageSize]
  );

  // Any filter change must send the list back to page 1, otherwise the user
  // can land on an empty page after narrowing the results.
  const resetToFirstPage = () => setPage(1);

  // ── Handlers ───────────────────────────────────────────────
  const handleEditSubmit = async (payload: QuestionEditPayload) => {
    if (!questionDoc || !editing) return;
    try {
      await updateQuestion({
        questionId: questionDoc._id,
        questionNumber: editing.question_number,
        data: payload,
      }).unwrap();
      message.success(`Question #${editing.question_number} updated`);
      setEditing(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update question');
    }
  };

  const handleExplanationSubmit = async (explanation: string) => {
    if (!questionDoc || !explaining) return;
    try {
      await updateExplanation({
        questionId: questionDoc._id,
        questionNumber: explaining.question_number,
        explanation,
      }).unwrap();
      message.success(`Explanation for question #${explaining.question_number} saved`);
      setExplaining(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to save explanation');
    }
  };

  const handleDeleteQuestion = async (question: QuestionItem) => {
    if (!questionDoc) return;
    try {
      await deleteQuestion({
        questionId: questionDoc._id,
        questionNumber: question.question_number,
      }).unwrap();
      message.success(`Question #${question.question_number} deleted`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete question');
    }
  };

  const handleAnalyzePattern = async () => {
    if (!questionDoc?.data?.length) {
      message.warning('This question set has no questions to analyze.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await questionAnalyzer(
        buildAnalyzerPayload(questionDoc.data, new Date().getFullYear())
      ).unwrap();

      const patternPayload: Record<string, unknown> = {
        exam: questionDoc.exam,
        res,
        questionDocumentId: questionDoc._id,
      };
      if (questionDoc.examVersion) patternPayload.examVersion = questionDoc.examVersion;
      if (questionDoc.subject) patternPayload.subject = questionDoc.subject;
      if (questionDoc.board) patternPayload.board = questionDoc.board;

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
      setIsAnalyzing(false);
    }
  };

  // ── Loading / error / not-found ────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        className="!rounded-xl"
        type="error"
        showIcon
        message="Error loading this question set"
        description="The question bank could not be loaded. Please retry."
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  if (!questionDoc) {
    return (
      <Card className="!rounded-2xl" style={{ background: '#0B0B0B' }}>
        <Empty description={<span className="text-[#9BA8A0]">This question set no longer exists.</span>}>
          <Button type="primary" onClick={() => navigate('/admin/question-bank')} className="!rounded-lg">
            Back to Question Bank
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="p-1">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-5 bg-[#0B0B0B] border border-emerald-500/15 rounded-2xl p-5">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/question-bank')}
          className="!mb-3 !p-0 !text-emerald-400 hover:!text-emerald-300 !font-medium"
        >
          Back to Question Bank
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#E8F5EC] m-0 flex items-center gap-2">
              <FileTextOutlined className="text-emerald-400" />
              Manage Questions
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Tag color="blue" className="!m-0 font-medium">{lookups.getExamName(questionDoc.exam)}</Tag>
              {questionDoc.examVersion && <Tag color="purple" className="!m-0">{lookups.getVersionName(questionDoc.examVersion)}</Tag>}
              {questionDoc.subject && <Tag color="cyan" className="!m-0">{lookups.getSubjectName(questionDoc.subject)}</Tag>}
              {questionDoc.board && <Tag color="orange" className="!m-0">{questionDoc.board}</Tag>}
              {questionDoc.analyzed ? (
                <Tag color="green" className="!m-0">Analyzed</Tag>
              ) : (
                <Tag color="red" className="!m-0">Not analyzed</Tag>
              )}
            </div>
          </div>

          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={isFetching}
              className="!rounded-lg !border-emerald-500/30 !text-emerald-400"
            >
              Refresh
            </Button>
            <Button
              icon={<RobotOutlined />}
              loading={isAnalyzing}
              onClick={handleAnalyzePattern}
              className="!rounded-lg !border-emerald-500/30 !text-emerald-400"
            >
              Analyze &amp; Save
            </Button>
          </Space>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {STAT_CARDS.map((card) => (
            <div key={card.key} className="flex items-center gap-3 bg-[#0F0F0F] border border-[#1E2B21] rounded-xl px-3.5 py-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.accent}`}>
                {card.icon}
              </div>
              <div>
                <div className="text-lg font-bold text-[#E8F5EC] leading-tight">{stats[card.key]}</div>
                <div className="text-[11px] text-[#7A8A80] font-medium">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <Card className="!rounded-2xl !mb-4" style={{ background: '#0B0B0B' }} styles={{ body: { padding: '14px 16px' } }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Input
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Search questions, options, explanations…"
            prefix={<SearchOutlined className="text-emerald-400" />}
            className="w-full sm:w-80"
          />
          <Select
            value={flag}
            onChange={(value) => {
              setFlag(value);
              resetToFirstPage();
            }}
            options={FLAG_OPTIONS}
            className="w-full sm:w-52"
          />
          <div className="sm:ml-auto">
            <Text className="text-xs text-[#7A8A80]">
              <span className="font-semibold text-emerald-400">{visible.length}</span> of {stats.total} questions
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Question list ──────────────────────────────────── */}
      {visible.length === 0 ? (
        <Card className="!rounded-2xl" style={{ background: '#0B0B0B' }}>
          <Empty
            description={
              <span className="text-[#9BA8A0]">
                {stats.total === 0
                  ? 'This question set has no questions yet.'
                  : 'No questions match your search or filter.'}
              </span>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((question) => (
            <QuestionCard
              key={question.question_number}
              question={question}
              onEdit={setEditing}
              onExplain={setExplaining}
              onDelete={handleDeleteQuestion}
            />
          ))}
        </div>
      )}

      {visible.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={visible.length}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} questions`}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              if (nextPageSize !== pageSize) setPageSize(nextPageSize);
            }}
          />
        </div>
      )}

      {/* ── Editors ────────────────────────────────────────── */}
      <EditQuestionDrawer
        open={!!editing}
        question={editing}
        saving={isSavingEdit}
        onClose={() => setEditing(null)}
        onSubmit={handleEditSubmit}
      />

      <ExplanationModal
        open={!!explaining}
        questionNumber={explaining?.question_number}
        questionText={explaining?.question_text}
        initialExplanation={explaining?.explanation}
        saving={isSavingExplanation}
        onClose={() => setExplaining(null)}
        onSubmit={handleExplanationSubmit}
      />
    </div>
  );
};

export default QuestionManager;
