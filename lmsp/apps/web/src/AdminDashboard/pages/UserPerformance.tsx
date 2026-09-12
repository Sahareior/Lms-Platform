import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Select,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Progress,
  Empty,
  Avatar,
  Typography,
  Tooltip,
  DatePicker,
  Button,
  Space,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleFilled,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import {
  useGetAllQuizAttemptsQuery,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAttemptByIdQuery,
} from "@my-monorepo/store";
import { BANGLADESH_BOARDS } from "@my-monorepo/store";
import type { AdminQuizAttempt, AdminQuizAttemptQuestion } from "@my-monorepo/store";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const UserPerformance: React.FC = () => {
  // ─── Filter states ──────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [examFilter, setExamFilter] = useState<string>("");
  const [examVersionFilter, setExamVersionFilter] = useState<string>("");
  const [boardFilter, setBoardFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [page, setPage] = useState(1);
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  // ─── Derived filter params ──────────────────────────────────
  const filterParams = useMemo(() => ({
    type: typeFilter || undefined,
    examId: examFilter || undefined,
    examVersionId: examVersionFilter || undefined,
    board: boardFilter || undefined,
    startDate: dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
    endDate: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
    page,
    limit: 20,
  }), [typeFilter, examFilter, examVersionFilter, boardFilter, dateRange, page]);

  // ─── Data queries ───────────────────────────────────────────
  const { data, isLoading, error, refetch } = useGetAllQuizAttemptsQuery(filterParams);
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();

  // Fetch full attempt details when a row is expanded
  const { data: expandedAttempt, isLoading: detailLoading } = useGetAttemptByIdQuery(
    expandedRowKey!,
    { skip: !expandedRowKey }
  );

  const attempts = (data?.attempts || []).filter((a: AdminQuizAttempt) => a.isCompleted);
  const summary = data?.summary || {
    totalAttempts: 0,
    avgPercentage: 0,
    completedAttempts: 0,
  };

  // ─── Filtered exam versions (dependent on selected exam) ────
  const filteredExamVersions = useMemo(() => {
    if (!examVersions) return [];
    if (!examFilter) return examVersions;
    return examVersions.filter((v) => v.exam === examFilter);
  }, [examVersions, examFilter]);

  // ─── Active filter count ────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter) count++;
    if (examFilter) count++;
    if (examVersionFilter) count++;
    if (boardFilter) count++;
    if (dateRange) count++;
    return count;
  }, [typeFilter, examFilter, examVersionFilter, boardFilter, dateRange]);

  // ─── Clear all filters ──────────────────────────────────────
  const clearAllFilters = () => {
    setTypeFilter("");
    setExamFilter("");
    setExamVersionFilter("");
    setBoardFilter("");
    setDateRange(null);
    setPage(1);
  };

  // ─── When exam changes, reset version filter ────────────────
  const handleExamChange = (val: string) => {
    setExamFilter(val || "");
    setExamVersionFilter(""); // reset version when exam changes
    setPage(1);
  };

  // ─── Helpers ────────────────────────────────────────────────
  const formatDuration = (seconds: number) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  const getTypeTag = (type: string, source: string) => {
    if (type === "mock_exam" || source === "mock_exam") {
      return <Tag color="blue" className="!text-xs !font-medium">Mock Exam</Tag>;
    }
    return <Tag color="green" className="!text-xs !font-medium">Practice</Tag>;
  };

  const getStatusTag = (isCompleted: boolean, percentage: number) => {
    if (!isCompleted) return <Tag color="default" className="!text-xs">In Progress</Tag>;
    if (percentage >= 80) return <Tag color="success" className="!text-xs !font-semibold">Excellent</Tag>;
    if (percentage >= 60) return <Tag color="processing" className="!text-xs !font-semibold">Good</Tag>;
    if (percentage >= 40) return <Tag color="warning" className="!text-xs !font-semibold">Average</Tag>;
    return <Tag color="error" className="!text-xs !font-semibold">Needs Work</Tag>;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "#4ADE80";
    if (pct >= 60) return "#22C55E";
    if (pct >= 40) return "#A3E635";
    return "#ff4d4f";
  };

  // ─── Table columns ──────────────────────────────────────────
  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 200,
      fixed: "left" as const,
      render: (user: AdminQuizAttempt["user"]) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            size={36}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#14532D", flexShrink: 0 }}
          />
          <div className="min-w-0">
            <Text
              strong
              style={{ fontSize: 13, display: "block", lineHeight: 1.3 }}
              className="!text-[#E8F5EC] truncate"
            >
              {user?.name || user?.username || "Unknown"}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }} className="truncate block">
              {user?.email || user?.district || "—"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Exam",
      key: "examInfo",
      width: 200,
      render: (_: any, record: AdminQuizAttempt) => (
        <div className="min-w-0">
          <Text style={{ fontSize: 13 }} className="!text-[#E8F5EC] font-medium block truncate">
            {record.exam?.name || "N/A"}
          </Text>
          {record.examVersion?.examVersion && (
            <Text type="secondary" style={{ fontSize: 11 }} className="block truncate">
              v: {record.examVersion.examVersion}
            </Text>
          )}
        </div>
      ),
    },
    // {
    //   title: "Type",
    //   key: "type",
    //   width: 110,
    //   render: (_: any, record: AdminQuizAttempt) => getTypeTag(record.type, record.source),
    // },
    // {
    //   title: "Board",
    //   dataIndex: "board",
    //   key: "board",
    //   width: 100,
    //   render: (board: string | null) =>
    //     board ? (
    //       <Tag color="purple" className="!text-xs">{board}</Tag>
    //     ) : (
    //       <span className="text-xs text-[#5F6B64]">—</span>
    //     ),
    // },
    {
      title: "Score",
      key: "score",
      width: 90,
      render: (_: any, record: AdminQuizAttempt) => (
        <div className="text-center">
          <span className="text-sm font-bold text-[#E8F5EC] font-mono">
            {record.correctCount}
          </span>
          <span className="text-xs text-[#5F6B64]">/</span>
          <span className="text-xs text-[#9BA8A0] font-mono">
            {record.totalQuestions}
          </span>
        </div>
      ),
    },
    {
      title: "Percentage",
      key: "percentage",
      width: 160,
      render: (_: any, record: AdminQuizAttempt) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={record.percentage}
            size="small"
            strokeColor={getScoreColor(record.percentage)}
            style={{ width: 90, margin: 0 }}
            format={(val) => (
              <span className="text-xs font-semibold" style={{ color: getScoreColor(val || 0) }}>
                {val}%
              </span>
            )}
          />
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_: any, record: AdminQuizAttempt) =>
        getStatusTag(record.isCompleted, record.percentage),
    },
    {
      title: "Duration",
      key: "timeTaken",
      width: 90,
      render: (_: any, record: AdminQuizAttempt) => (
        <Tooltip title={record.timeTaken ? `${record.timeTaken} seconds` : "No data"}>
          <Text type="secondary" style={{ fontSize: 12 }} className="flex items-center gap-1">
            <ClockCircleOutlined className="text-[10px]" />
            {formatDuration(record.timeTaken)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (date: string) => (
        <div className="text-xs">
          <div className="text-[#E8F5EC] font-medium">
            {date ? dayjs(date).format("DD MMM YYYY") : "—"}
          </div>
          {date && (
            <div className="text-[#5F6B64]">
              {dayjs(date).format("hh:mm A")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Details",
      key: "details",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: AdminQuizAttempt) =>
        record.isCompleted ? (
          <Button
            type="link"
            size="small"
            style={{ fontSize: 12 }}
            icon={expandedRowKey === record._id ? <MinusCircleFilled /> : <SearchOutlined />}
            onClick={() => {
              setExpandedRowKey(expandedRowKey === record._id ? null : record._id);
            }}
          >
            {expandedRowKey === record._id ? "Hide" : "View"}
          </Button>
        ) : (
          <span className="text-xs text-[#5F6B64]">—</span>
        ),
    },
  ];

  // ─── Expanded row: per-question breakdown ─────────────────────
  const renderExpandedRow = (record: AdminQuizAttempt) => {
    const rawQuestions = expandedAttempt?.questions || [];
    const seen = new Set<number>();
    const questions = rawQuestions
      .filter((q) => {
        const num = Number(q.questionNumber);
        if (seen.has(num)) return false;
        seen.add(num);
        return true;
      })
      .sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber));

    if (detailLoading) {
      return (
        <div className="py-8 flex items-center justify-center">
          <Spin size="small" tip="Loading question details..." />
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-[#5F6B64]">
          No question-level data available for this attempt.
        </div>
      );
    }

    return (
      <div className="px-4 py-4 bg-[#0A0A0A]">
        {/* Summary bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Tag color="green" className="!text-xs !px-3 !py-1">
            ✓ Correct: {record.correctCount}
          </Tag>
          <Tag color="red" className="!text-xs !px-3 !py-1">
            ✗ Incorrect: {record.incorrectCount}
          </Tag>
          <Tag color="default" className="!text-xs !px-3 !py-1">
            — Unanswered: {record.unansweredCount}
          </Tag>
          <Tag color="blue" className="!text-xs !px-3 !py-1">
            <TrophyOutlined /> {record.percentage}%
          </Tag>
          {record.timeTaken > 0 && (
            <span className="text-xs text-[#5F6B64] flex items-center gap-1">
              <ClockCircleOutlined /> {formatDuration(record.timeTaken)}
            </span>
          )}
        </div>

        {/* Question table */}
        <Table
          dataSource={questions}
          rowKey="questionNumber"
          pagination={false}
          size="small"
          columns={[
            {
              title: "#",
              dataIndex: "questionNumber",
              key: "questionNumber",
              width: 50,
              render: (n: number) => (
                <span className="font-mono text-xs font-bold text-[#A1A8B3] bg-[#1A1A1A] px-2 py-0.5 rounded">
                  {String(n).padStart(2, "0")}
                </span>
              ),
            },
            {
              title: "Question",
              dataIndex: "questionText",
              key: "questionText",
              render: (text: string) => (
                <span className="text-xs text-[#C9D0DA] line-clamp-2 leading-relaxed">
                  {text || "—"}
                </span>
              ),
            },
            {
              title: "Selected",
              dataIndex: "selectedOption",
              key: "selected",
              width: 90,
              render: (opt: string | null) =>
                opt ? (
                  <Tag color="purple" className="!font-mono !text-xs">{opt}</Tag>
                ) : (
                  <Tag color="default" className="!text-xs">—</Tag>
                ),
            },
            {
              title: "Correct",
              dataIndex: "correctAnswer",
              key: "correctAnswer",
              width: 90,
              render: (opt: string | null) =>
                opt ? (
                  <Tag color="green" className="!font-mono !text-xs">{opt}</Tag>
                ) : (
                  <span className="text-xs text-[#5F6B64]">—</span>
                ),
            },
            {
              title: "Result",
              dataIndex: "isCorrect",
              key: "isCorrect",
              width: 70,
              align: "center" as const,
              render: (val: boolean | null) => {
                if (val === true)
                  return <CheckCircleFilled className="text-[#00E5B3] text-lg" />;
                if (val === false)
                  return <CloseCircleFilled className="text-[#EB5757] text-lg" />;
                return <MinusCircleFilled className="text-[#5F6B64] text-lg" />;
              },
            },
            {
              title: "Time",
              dataIndex: "timeTaken",
              key: "timeTaken",
              width: 70,
              render: (t: number) => (
                <span className="text-xs text-[#5F6B64] font-mono">
                  {t ? `${t}s` : "—"}
                </span>
              ),
            },
          ]}
          scroll={{ x: 700 }}
          className="!bg-transparent"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* ─── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} style={{ margin: 0, color: "#E8F5EC" }} className="!flex !items-center !gap-2">
            <BarChartOutlined className="!text-[#22C55E]" />
            User Performance
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            View and analyze all user quiz attempts across exams and practice sessions
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          className="!border-[#2A2F3D] !text-[#9BA8A0] hover:!text-[#E8F5EC]"
        >
          Refresh
        </Button>
      </div>

      {/* ─── Stats Cards ──────────────────────────── */}
      {/* <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #22C55E",
              background: "#0B0B0B",
            }}
            className="!shadow-[0_0_0_1px_#1A1A1A]"
          >
            <Statistic
              title={<span style={{ color: "#9BA8A0", fontSize: 14 }}>Total Attempts</span>}
              value={summary.totalAttempts}
              prefix={<FileTextOutlined style={{ color: "#22C55E" }} />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #3B82F6",
              background: "#0B0B0B",
            }}
            className="!shadow-[0_0_0_1px_#1A1A1A]"
          >
            <Statistic
              title={<span style={{ color: "#9BA8A0", fontSize: 14 }}>Avg. Score</span>}
              value={summary.avgPercentage}
              suffix="%"
              precision={1}
              prefix={<RiseOutlined style={{ color: "#3B82F6" }} />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #A855F7",
              background: "#0B0B0B",
            }}
            className="!shadow-[0_0_0_1px_#1A1A1A]"
          >
            <Statistic
              title={<span style={{ color: "#9BA8A0", fontSize: 14 }}>Completed</span>}
              value={summary.completedAttempts}
              prefix={<CheckCircleOutlined style={{ color: "#A855F7" }} />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row> */}

      {/* ─── Filters ──────────────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
          background: "#0B0B0B",
        }}
        className="!shadow-[0_0_0_1px_#1A1A1A]"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-[#22C55E]" />
              <span className="text-sm font-semibold text-[#E8F5EC]">Filters</span>
              {activeFilterCount > 0 && (
                <Tag color="green" className="!text-xs !ml-1">{activeFilterCount} active</Tag>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearAllFilters}
                className="!text-[#9BA8A0] hover:!text-[#EB5757]"
              >
                Clear all
              </Button>
            )}
          </div>
        }
        styles={{ header: { borderBottom: "1px solid #1A1A1A", padding: "12px 16px" } }}
      >
        <Row gutter={[12, 12]}>
          {/* Quiz Type */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Quiz Type</label>
            <Select
              allowClear
              placeholder="All Types"
              style={{ width: "100%" }}
              value={typeFilter || undefined}
              onChange={(val) => { setTypeFilter(val || ""); setPage(1); }}
              options={[
                { label: "Mock Exam", value: "mock_exam" },
                { label: "Practice", value: "practice" },
              ]}
              size="middle"
            />
          </Col>

          {/* Exam */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Exam</label>
            <Select
              allowClear
              showSearch
              placeholder="All Exams"
              style={{ width: "100%" }}
              value={examFilter || undefined}
              onChange={handleExamChange}
              optionFilterProp="label"
              options={(exams || []).map((e) => ({
                label: e.name,
                value: e._id,
              }))}
              size="middle"
            />
          </Col>

          {/* Exam Version */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">
              Exam Version
              {!examFilter && (
                <span className="text-[#5F6B64] font-normal ml-1">(select exam first)</span>
              )}
            </label>
            <Select
              allowClear
              showSearch
              placeholder="All Versions"
              style={{ width: "100%" }}
              value={examVersionFilter || undefined}
              onChange={(val) => { setExamVersionFilter(val || ""); setPage(1); }}
              disabled={!examFilter}
              optionFilterProp="label"
              options={filteredExamVersions.map((v) => ({
                label: v.examVersion,
                value: v._id,
              }))}
              size="middle"
            />
          </Col>

          {/* Board */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Board</label>
            <Select
              allowClear
              showSearch
              placeholder="All Boards"
              style={{ width: "100%" }}
              value={boardFilter || undefined}
              onChange={(val) => { setBoardFilter(val || ""); setPage(1); }}
              optionFilterProp="label"
              options={BANGLADESH_BOARDS.map((b) => ({
                label: b,
                value: b,
              }))}
              size="middle"
            />
          </Col>

          {/* Date Range */}
          <Col xs={24} sm={16} md={12} lg={5}>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Date Range</label>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange as any}
              onChange={(dates) => {
                setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                setPage(1);
              }}
              format="DD MMM YYYY"
              placeholder={["Start date", "End date"]}
              size="middle"
              allowClear
            />
          </Col>

          {/* Result count */}
          <Col xs={24} sm={8} md={12} lg={1}>
            <div className="flex items-center justify-end h-full pt-5">
              <Text type="secondary" style={{ fontSize: 12 }} className="whitespace-nowrap">
                <strong className="text-[#E8F5EC]">{data?.total || 0}</strong> results
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ─── Data Table ────────────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          background: "#0B0B0B",
        }}
        className="!shadow-[0_0_0_1px_#1A1A1A]"
        styles={{ body: { padding: 0 } }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spin size="large" />
            <Text type="secondary" className="text-sm">Loading performance data...</Text>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert
              message="Error Loading Performance Data"
              description="There was an error loading the quiz performance data. Please try again."
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
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
                      ? `Try changing the filters (${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""})`
                      : "Users haven't taken any quizzes yet"}
                  </Text>
                </div>
              }
            >
              {activeFilterCount > 0 && (
                <Button type="primary" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <Table
            dataSource={attempts}
            columns={columns}
            rowKey="_id"
            expandable={{
              expandedRowRender: renderExpandedRow,
              expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
              onExpand: (expanded, record) => {
                setExpandedRowKey(expanded ? record._id : null);
              },
              rowExpandable: (record: AdminQuizAttempt) => record.isCompleted,
            }}
            pagination={{
              current: page,
              pageSize: 20,
              total: data?.total || 0,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total} attempts`,
              size: "default",
            }}
            scroll={{ x: 1300 }}
            size="middle"
            className="!bg-transparent"
          />
        )}
      </Card>
    </div>
  );
};

export default UserPerformance;
