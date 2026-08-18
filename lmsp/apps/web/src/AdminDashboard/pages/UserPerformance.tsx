import React, { useState } from "react";
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
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { message, Button } from "antd";
import {
  useGetAllQuizAttemptsQuery,
  useGetAdminExamsQuery,
} from "@my-monorepo/store";
import type { AdminQuizAttempt } from "@my-monorepo/store";
import { downloadCsv } from "../../reusable/downloadCsv";

const { Text, Title } = Typography;

const UserPerformance: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [examFilter, setExamFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetAllQuizAttemptsQuery({
    type: typeFilter || undefined,
    examId: examFilter || undefined,
    page,
    limit: 20,
  });

  const { data: exams } = useGetAdminExamsQuery();

  const attempts = data?.attempts || [];
  const summary = data?.summary || {
    totalAttempts: 0,
    avgPercentage: 0,
    completedAttempts: 0,
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getTypeTag = (type: string, source: string) => {
    if (type === "mock_exam" || source === "mock_exam") {
      return <Tag color="blue">Mock Exam</Tag>;
    }
    return <Tag color="green">Practice</Tag>;
  };

  const getStatusTag = (isCompleted: boolean, percentage: number) => {
    if (!isCompleted) return <Tag color="default">In Progress</Tag>;
    if (percentage >= 80) return <Tag color="success">Excellent</Tag>;
    if (percentage >= 60) return <Tag color="processing">Good</Tag>;
    if (percentage >= 40) return <Tag color="warning">Average</Tag>;
    return <Tag color="error">Needs Work</Tag>;
  };

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 200,
      render: (user: AdminQuizAttempt["user"]) => (
        <div className="flex items-center gap-2">
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#14532D", flexShrink: 0 }}
          />
          <div className="min-w-0">
            <Text
              strong
              style={{ fontSize: 13, display: "block", lineHeight: 1.2 }}
            >
              {user?.username || user?.email || "Unknown"}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {user?.division || user?.district || "—"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 120,
      render: (_: any, record: AdminQuizAttempt) =>
        getTypeTag(record.type, record.source),
    },
    {
      title: "Exam",
      dataIndex: "exam",
      key: "exam",
      width: 180,
      render: (exam: AdminQuizAttempt["exam"]) => (
        <Text style={{ fontSize: 13 }}>
          {exam?.name || "N/A"}
        </Text>
      ),
    },
    {
      title: "Score",
      key: "score",
      width: 100,
      render: (_: any, record: AdminQuizAttempt) => (
        <Text strong style={{ fontSize: 14 }}>
          {record.correctCount}/{record.totalQuestions}
        </Text>
      ),
    },
    {
      title: "Percentage",
      key: "percentage",
      width: 180,
      render: (_: any, record: AdminQuizAttempt) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={record.percentage}
            size="small"
            style={{ width: 100, margin: 0 }}
            strokeColor={
              record.percentage >= 80
                ? "#4ADE80"
                : record.percentage >= 60
                ? "#22C55E"
                : record.percentage >= 40
                ? "#A3E635"
                : "#ff4d4f"
            }
          />
          <Text style={{ fontSize: 12 }}>{record.percentage}%</Text>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, record: AdminQuizAttempt) =>
        getStatusTag(record.isCompleted, record.percentage),
    },
    {
      title: "Duration",
      key: "timeTaken",
      width: 100,
      render: (_: any, record: AdminQuizAttempt) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.timeTaken ? formatDuration(record.timeTaken) : "—"}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 130,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {date ? new Date(date).toLocaleDateString("en-BD") : "—"}
        </Text>
      ),
    },
  ];

  return (
    <div className="">
      {/* ─── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} style={{ margin: 0, color: "#E8F5EC" }}>
            User Performance
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            View and analyze all user quiz attempts across exams and practice
            sessions
          </Text>
        </div>
        <Button
          icon={<DownloadOutlined />}
          onClick={async () => {
            try {
              await downloadCsv("/quiz-attempts/export", "quiz-attempts.csv");
              message.success("Attempts exported");
            } catch (err: any) {
              message.error(err?.message || "Failed to export attempts");
            }
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* ─── Stats Cards ──────────────────────────── */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #22C55E",
              background: "#0B0B0B",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#9BA8A0", fontSize: 14 }}>
                  Total Attempts
                </span>
              }
              value={summary.totalAttempts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #22C55E",
              background: "#0B0B0B",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#9BA8A0", fontSize: 14 }}>
                  Avg. Score
                </span>
              }
              value={summary.avgPercentage}
              suffix="%"
              precision={1}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              borderLeft: "4px solid #22C55E",
              background: "#0B0B0B",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#9BA8A0", fontSize: 14 }}>
                  Completed
                </span>
              }
              value={summary.completedAttempts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#E8F5EC", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Filters ──────────────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: "0 0 0 1px #1A1A1A",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 12,
                color: "#9BA8A0",
                fontWeight: 600,
              }}
            >
              Quiz Type
            </label>
            <Select
              allowClear
              placeholder="All Types"
              style={{ width: "100%" }}
              value={typeFilter || undefined}
              onChange={(val) => {
                setTypeFilter(val || "");
                setPage(1);
              }}
              options={[
                { label: "Mock Exam", value: "mock_exam" },
                { label: "Practice", value: "practice" },
              ]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 12,
                color: "#9BA8A0",
                fontWeight: 600,
              }}
            >
              Exam
            </label>
            <Select
              allowClear
              placeholder="All Exams"
              style={{ width: "100%" }}
              value={examFilter || undefined}
              onChange={(val) => {
                setExamFilter(val || "");
                setPage(1);
              }}
              options={(exams || []).map((e) => ({
                label: e.name,
                value: e._id,
              }))}
            />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginTop: 22 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total: <strong>{data?.total || 0}</strong> results (Page{" "}
                {data?.page || 1} of {data?.totalPages || 1})
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ─── Data Table ────────────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 0 0 1px #1A1A1A",
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" tip="Loading performance data..." />
          </div>
        ) : error ? (
          <Alert
            message="Error Loading Performance Data"
            description="There was an error loading the quiz performance data. Please try again."
            type="error"
            showIcon
          />
        ) : attempts.length === 0 ? (
          <Empty
            description={
              <span>
                No quiz attempts found
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {typeFilter || examFilter
                    ? "Try changing the filters"
                    : "Users haven't taken any quizzes yet"}
                </Text>
              </span>
            }
          />
        ) : (
          <Table
            dataSource={attempts}
            columns={columns}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: 20,
              total: data?.total || 0,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} attempts`,
            }}
            scroll={{ x: 1200 }}
            style={{ fontSize: 13 }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserPerformance;
