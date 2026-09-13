import React, { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAttemptByIdQuery, type AdminQuizAttempt } from '@my-monorepo/store';
import AttemptQuestionCard from './_components/AttemptQuestionCard';
import {
  computeBreakdown,
  filterAttemptQuestions,
  formatDuration,
  getScoreColor,
  getStatusTone,
  getTypeTone,
  normalizeQuestions,
  type AttemptResultFilter,
} from './_components/performanceUtils';

const { Text, Title } = Typography;

const PAGE_SIZE = 10;

/**
 * Attempt review — everything about one student's attempt in one place.
 *
 * Replaces the expand-in-table breakdown: the header summarizes the attempt,
 * then each question gets a card that colour-codes the student's pick against
 * the correct answer.
 */
const AttemptDetail: React.FC = () => {
  const { attemptId = '' } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useGetAttemptByIdQuery(attemptId, {
    skip: !attemptId,
  });

  // The detail endpoint returns the full attempt document — including board,
  // subject and per-question option maps — while the RTK Query type is a
  // narrower subset, so widen it once here instead of casting at every use.
  const attempt = data as AdminQuizAttempt | undefined;

  const [search, setSearch] = useState('');
  const [result, setResult] = useState<AttemptResultFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const questions = useMemo(() => normalizeQuestions(attempt?.questions), [attempt]);

  const breakdown = useMemo(() => computeBreakdown(questions), [questions]);
  const visible = useMemo(
    () => filterAttemptQuestions(questions, result, search),
    [questions, result, search]
  );

  // Deleting/narrowing can leave `page` past the end; clamp instead of
  // rendering an empty page.
  const maxPage = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, maxPage);
  const pageItems = useMemo(
    () => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [visible, currentPage, pageSize]
  );

  const filterOptions = useMemo(
    () => [
      { value: 'all', label: `All questions (${breakdown.total})` },
      { value: 'correct', label: `Correct (${breakdown.correct})` },
      { value: 'incorrect', label: `Incorrect (${breakdown.incorrect})` },
      { value: 'unanswered', label: `Unanswered (${breakdown.unanswered})` },
    ],
    [breakdown]
  );

  // ── Loading / error states ─────────────────────────────────
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
        message="Could not load this attempt"
        description="The attempt detail could not be fetched. Please retry."
        action={
          <Space>
            <Button size="small" onClick={() => refetch()}>Retry</Button>
            <Button size="small" onClick={() => navigate('/admin/user-performance')}>Back</Button>
          </Space>
        }
      />
    );
  }

  if (!attempt) {
    return (
      <Card className="!rounded-2xl" style={{ background: '#0B0B0B' }}>
        <Empty description={<span className="text-[#9BA8A0]">This attempt no longer exists.</span>}>
          <Button type="primary" onClick={() => navigate('/admin/user-performance')} className="!rounded-lg">
            Back to User Performance
          </Button>
        </Empty>
      </Card>
    );
  }

  const student = attempt.user || {};
  const typeTone = getTypeTone(attempt.type, attempt.source);
  const statusTone = getStatusTone(attempt.percentage);

  const statCards = [
    {
      key: 'score',
      label: 'Score',
      value: `${attempt.correctCount}/${attempt.totalQuestions}`,
      icon: <CheckCircleOutlined />,
      accent: 'text-emerald-400 bg-emerald-500/15',
    },
    {
      key: 'correct',
      label: 'Correct',
      value: attempt.correctCount,
      icon: <CheckCircleOutlined />,
      accent: 'text-emerald-400 bg-emerald-500/15',
    },
    {
      key: 'incorrect',
      label: 'Incorrect',
      value: attempt.incorrectCount,
      icon: <CloseCircleOutlined />,
      accent: 'text-red-400 bg-red-500/15',
    },
    {
      key: 'unanswered',
      label: 'Unanswered',
      value: attempt.unansweredCount,
      icon: <MinusCircleOutlined />,
      accent: 'text-[#9BA8A0] bg-[#1A1A1A]',
    },
    {
      key: 'time',
      label: 'Time Taken',
      value: formatDuration(attempt.timeTaken),
      icon: <ClockCircleOutlined />,
      accent: 'text-blue-400 bg-blue-500/15',
    },
  ];

  return (
    <div className="p-1">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-5 bg-[#0B0B0B] border border-emerald-500/15 rounded-2xl p-5">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/user-performance')}
          className="!mb-3 !p-0 !text-emerald-400 hover:!text-emerald-300 !font-medium"
        >
          Back to User Performance
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Student */}
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: '#14532D', flexShrink: 0 }} />
            <div className="min-w-0">
              <Title level={4} style={{ margin: 0, color: '#E8F5EC' }} className="!truncate">
                {student.name || student.username || 'Unknown user'}
              </Title>
              <div className="text-xs text-[#9BA8A0] flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {student.email && <span>{student.email}</span>}
                {student.phone && <span>{student.phone}</span>}
                {student.district && <span>{student.district}{student.division ? `, ${student.division}` : ''}</span>}
              </div>
            </div>
          </div>

          {/* Score ring */}
          <div className="flex items-center gap-5">
            <Progress
              type="circle"
              percent={attempt.percentage}
              size={92}
              strokeColor={getScoreColor(attempt.percentage)}
              format={(val) => (
                <span className="text-lg font-bold" style={{ color: getScoreColor(val || 0) }}>{val}%</span>
              )}
            />
            <div className="flex flex-col gap-1.5 items-start">
              <Tag color={statusTone.color} className="!m-0 !font-semibold">{statusTone.label}</Tag>
              <Tag color={typeTone.color} className="!m-0">{typeTone.label}</Tag>
              <span className="text-[11px] text-[#5F6B64] flex items-center gap-1">
                <CalendarOutlined />
                {attempt.createdAt ? dayjs(attempt.createdAt).format('DD MMM YYYY, hh:mm A') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Exam context */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          {attempt.scheduleExam?.title && (
            <Tag color="gold" className="!m-0 font-semibold">
              {attempt.scheduleExam.title}
              {attempt.scheduleExam.startDate
                ? ` · ${dayjs(attempt.scheduleExam.startDate).format('DD MMM YYYY')}`
                : ''}
            </Tag>
          )}
          <Tag color="blue" className="!m-0 font-medium">{attempt.exam?.name || 'No exam'}</Tag>
          {attempt.examVersion?.examVersion && (
            <Tag color="purple" className="!m-0">v: {attempt.examVersion.examVersion}</Tag>
          )}
          {attempt.subject && <Tag color="cyan" className="!m-0">{attempt.subject}</Tag>}
          {attempt.board && <Tag color="orange" className="!m-0">{attempt.board}</Tag>}
          {!attempt.isCompleted && <Tag color="default" className="!m-0">In progress</Tag>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {statCards.map((card) => (
            <div key={card.key} className="flex items-center gap-3 bg-[#0F0F0F] border border-[#1E2B21] rounded-xl px-3.5 py-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.accent}`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-[#E8F5EC] leading-tight">{card.value}</div>
                <div className="text-[11px] text-[#7A8A80] font-medium">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <Card
        className="!rounded-2xl !mb-4"
        style={{ background: '#0B0B0B' }}
        styles={{ body: { padding: '14px 16px' } }}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Input
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search questions, options, answers…"
            prefix={<SearchOutlined className="text-emerald-400" />}
            className="w-full sm:w-80"
          />
          <Select
            value={result}
            onChange={(value) => {
              setResult(value);
              setPage(1);
            }}
            options={filterOptions}
            className="w-full sm:w-56"
          />
          <div className="sm:ml-auto flex items-center gap-3">
            <Text className="text-xs text-[#7A8A80]">
              <span className="font-semibold text-emerald-400">{visible.length}</span> of {breakdown.total} questions
            </Text>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
              className="!rounded-lg !border-emerald-500/30 !text-emerald-400"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Question review ────────────────────────────────── */}
      {visible.length === 0 ? (
        <Card className="!rounded-2xl" style={{ background: '#0B0B0B' }}>
          <Empty
            description={
              <span className="text-[#9BA8A0]">
                {breakdown.total === 0
                  ? 'No question-level data was recorded for this attempt.'
                  : 'No questions match your search or filter.'}
              </span>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((question) => (
            <AttemptQuestionCard key={question.questionNumber} question={question} />
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
    </div>
  );
};

export default AttemptDetail;
