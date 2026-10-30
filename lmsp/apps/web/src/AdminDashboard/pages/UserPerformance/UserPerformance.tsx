import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Spin, Typography } from 'antd';
import { BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useGetAllQuizAttemptsQuery,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetScheduleExamsQuery,
  type AdminQuizAttempt,
  type ScheduleExam,
} from '@my-monorepo/store';
import PerformanceStats from './_components/PerformanceStats';
import PerformanceFilters, {
  EMPTY_PERFORMANCE_FILTERS,
  countActiveFilters,
  type PerformanceFilterValues,
} from './_components/PerformanceFilters';
import PerformanceTable from './_components/PerformanceTable';

const { Text, Title } = Typography;

const PAGE_SIZE = 20;

/** Sentinel the API understands: attempts that belong to no scheduled exam. */
export const UNSCHEDULED_VALUE = 'none';

/** `ScheduleExam.exam` / `.examVersion` may arrive populated or as raw ids. */
const relId = (value: { _id: string } | string | null | undefined): string =>
  !value ? '' : typeof value === 'object' ? value._id : value;

/**
 * Option label for a scheduled exam: its title plus the exam/board/date
 * context, so two similarly named mocks stay distinguishable in the dropdown.
 */
const scheduleExamLabel = (scheduled: ScheduleExam, examName?: string): string => {
  const parts = [scheduled.title || 'Untitled exam'];
  if (examName) parts.push(examName);
  if (scheduled.board) parts.push(scheduled.board);
  if (scheduled.startDate) parts.push(dayjs(scheduled.startDate).format('DD MMM YYYY'));
  return parts.join(' · ');
};

/**
 * User Performance — the overview of every completed quiz attempt.
 *
 * This page only lists and filters attempts. The per-question review moved to
 * its own route (`/admin/user-performance/:attemptId`) so reviewing a student's
 * paper no longer means unfolding a table inside a table.
 */
const UserPerformance: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PerformanceFilterValues>(EMPTY_PERFORMANCE_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useGetAllQuizAttemptsQuery(
    useMemo(
      () => ({
        type: filters.type || undefined,
        examId: filters.exam || undefined,
        examVersionId: filters.examVersion || undefined,
        board: filters.board || undefined,
        scheduleExamId: filters.scheduleExam || undefined,
        startDate: filters.dateRange?.[0] ? filters.dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: filters.dateRange?.[1] ? filters.dateRange[1].format('YYYY-MM-DD') : undefined,
        page,
        limit: PAGE_SIZE,
      }),
      [filters, page]
    )
  );

  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: scheduleExams } = useGetScheduleExamsQuery();

  // Newest scheduled exams first — that's what admins look for after running one.
  const orderedScheduleExams = useMemo(
    () =>
      [...(scheduleExams ?? [])].sort(
        (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()
      ),
    [scheduleExams]
  );

  const attempts = useMemo(
    () => (data?.attempts || []).filter((a: AdminQuizAttempt) => a.isCompleted),
    [data]
  );

  const summary = data?.summary || { totalAttempts: 0, avgPercentage: 0, completedAttempts: 0 };
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const examOptions = useMemo(
    () => (exams || []).map((e) => ({ label: e.name, value: e._id })),
    [exams]
  );

  const versionOptions = useMemo(() => {
    if (!examVersions) return [];
    const source = filters.exam ? examVersions.filter((v) => v.exam === filters.exam) : examVersions;
    return source.map((v) => ({ label: v.examVersion, value: v._id }));
  }, [examVersions, filters.exam]);

  const scheduleExamOptions = useMemo(() => {
    const examName = (id: string) => (exams || []).find((e) => e._id === id)?.name;
    return [
      { label: 'Unscheduled (free practice)', value: UNSCHEDULED_VALUE },
      ...orderedScheduleExams.map((s) => ({
        label: scheduleExamLabel(s, examName(relId(s.exam))),
        value: s._id,
      })),
    ];
  }, [orderedScheduleExams, exams]);

  const handleFilterChange = useCallback(
    (key: keyof PerformanceFilterValues, value: PerformanceFilterValues[keyof PerformanceFilterValues]) => {
      setFilters((prev) => {
        // Changing the exam invalidates the version that belonged to the old one.
        if (key === 'exam') {
          return { ...prev, exam: value as string, examVersion: '' };
        }

        // Picking a scheduled exam also pins the exam context it was created
        // with (exam / version / board), so the visible filters always explain
        // the results below them. 'Unscheduled'/'Any' leave those untouched.
        if (key === 'scheduleExam' && value && value !== UNSCHEDULED_VALUE) {
          const scheduled = orderedScheduleExams.find((s) => s._id === value);
          if (scheduled) {
            return {
              ...prev,
              scheduleExam: value as string,
              exam: relId(scheduled.exam),
              examVersion: relId(scheduled.examVersion),
              board: scheduled.board || '',
            };
          }
        }

        return { ...prev, [key]: value };
      });
      setPage(1);
    },
    [orderedScheduleExams]
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_PERFORMANCE_FILTERS);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen p-1">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <Title level={4} style={{ margin: 0, color: '#E8F5EC' }} className="!flex !items-center !gap-2">
            <BarChartOutlined className="!text-[#22C55E]" />
            User Performance
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            View and analyze user quiz attempts across exams and practice sessions
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          className="!rounded-lg !border-[#2A2F3D] !text-[#9BA8A0] hover:!text-[#E8F5EC]"
        >
          Refresh
        </Button>
      </div>

      <PerformanceStats
        totalAttempts={summary.totalAttempts}
        avgPercentage={summary.avgPercentage}
        completedAttempts={summary.completedAttempts}
      />

      <PerformanceFilters
        values={filters}
        activeCount={activeFilterCount}
        resultCount={data?.total || 0}
        examOptions={examOptions}
        versionOptions={versionOptions}
        scheduleExamOptions={scheduleExamOptions}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      {/* ── Attempts ───────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 12, background: '#0B0B0B' }}
        className="!shadow-[0_0_0_1px_#1A1A1A]"
        styles={{ body: { padding: 0 } }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spin size="large" />
            <Text type="secondary" className="text-sm">Loading performance data…</Text>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert
              message="Error Loading Performance Data"
              description="There was an error loading the quiz performance data. Please try again."
              type="error"
              showIcon
              action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
            />
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <span className="text-[#9BA8A0]">No quiz attempts found</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activeFilterCount > 0
                      ? `Try changing the filters (${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''})`
                      : "Users haven't taken any quizzes yet"}
                  </Text>
                </div>
              }
            >
              {activeFilterCount > 0 && (
                <Button type="primary" onClick={clearFilters} className="!rounded-lg">
                  Clear Filters
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <PerformanceTable
            attempts={attempts}
            total={data?.total || 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onView={(attempt) => navigate(`/admin/user-performance/${attempt._id}`)}
          />
        )}
      </Card>

      <Text className="block mt-3 text-xs text-[#5F6B64]">
        Tip: press <strong className="text-[#9BA8A0]">Review</strong> on a row to open the full question-by-question
        breakdown for that attempt.
      </Text>
    </div>
  );
};

export default UserPerformance;
