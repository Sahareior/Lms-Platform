import React from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useGetAdminUsersQuery, useGetAdminExamsQuery, useGetAdminCoursesQuery, useGetAdminQuestionsQuery, useGetScheduleExamsQuery } from '@my-monorepo/store';

const DashboardOverview: React.FC = () => {
  const { data: users, isLoading: usersLoading, error: usersError } = useGetAdminUsersQuery();
  const { data: exams, isLoading: examsLoading, error: examsError } = useGetAdminExamsQuery();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useGetAdminCoursesQuery();
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useGetAdminQuestionsQuery();
  const { data: mockExams, isLoading: mockExamsLoading, error: mockExamsError } = useGetScheduleExamsQuery();

  const isLoading = usersLoading || examsLoading || coursesLoading || questionsLoading || mockExamsLoading;
  const error = usersError || examsError || coursesError || questionsError || mockExamsError;

  // ── Recency helpers ────────────────────────────────────────
  // The backend sorts newest-first, but sort defensively here too so the
  // "Recent" lists stay correct even if an endpoint returns unsorted data.
  // ObjectId prefixes encode the creation timestamp (works for legacy rows
  // that predate the createdAt field).
  const objectIdTime = (id?: string) => (id ? parseInt(id.slice(0, 8), 16) * 1000 : 0);
  const recentTime = (x: { _id?: string; createdAt?: string }) =>
    (x.createdAt ? new Date(x.createdAt).getTime() : 0) || objectIdTime(x._id);
  const recentUsers = [...(users ?? [])].sort((a, b) => recentTime(b) - recentTime(a)).slice(0, 5);
  // Latest scheduled (mock) exams by start date — newest scheduled first
  

  const recentMockExams = [...(mockExams ?? [])]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  const formatDate = (x: { createdAt?: string; _id?: string }) =>
    new Date(recentTime(x)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading dashboard stats..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description="There was an error loading the dashboard statistics. Please check your connection and try again."
        type="error"
        showIcon
      />
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: users?.length ?? 0,
      icon: <UserOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
    {
      title: 'Total Exams',
      value: exams?.length ?? 0,
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
    {
      title: 'Total Courses',
      value: courses?.length ?? 0,
      icon: <BookOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
    {
      title: 'Question Banks',
      value: questions?.length ?? 0,
      icon: <QuestionCircleOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
    {
      title: 'Total Questions',
      value: questions?.reduce((acc, q) => acc + (q.data?.length ?? 0), 0) ?? 0,
      icon: <ExperimentOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
    {
      title: 'Avg Questions/Exam',
      value: exams?.length ? Math.round((questions?.reduce((acc, q) => acc + (q.data?.length ?? 0), 0) ?? 0) / exams.length) : 0,
      icon: <RiseOutlined style={{ fontSize: 28, color: '#4ADE80' }} />,
    },
  ];

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #14532D 100%)',
            color: '#04150B',
            boxShadow: '0 0 18px -4px rgba(34, 197, 94, 0.5)',
          }}
        >
          D
        </div>
        <div>
          <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>Admin Dashboard</h2>
          <p className="text-sm m-0" style={{ color: '#5F6B64' }}>
            Live overview of your platform
          </p>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {statsCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              hoverable
              className="transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderLeft: `3px solid #22C55E`,
                borderRadius: 14,
                background: '#0B0B0B',
                border: '1px solid #1F1F1F',
                boxShadow: '0 0 0 1px rgba(34,197,94,0.05), 0 8px 24px -12px rgba(0,0,0,0.8)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span style={{ color: '#9BA8A0', fontSize: 14 }}>{card.title}</span>}
                    value={card.value}
                    valueStyle={{ color: '#E8F5EC', fontSize: 32, fontWeight: 700 }}
                  />
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 12px rgba(34,197,94,0.08)',
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#4ADE80', fontSize: 15 }}>Recent Users</span>}
            style={{ borderRadius: 14, border: '1px solid #1F1F1F' }}
          >
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#171717' }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.14)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4ADE80',
                          fontWeight: 600,
                        }}
                      >
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm m-0" style={{ color: '#E8F5EC' }}>{user.name || 'N/A'}</p>
                        <p className="text-xs m-0" style={{ color: '#9BA8A0' }}>{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#5F6B64' }}>
                      Joined {formatDate(user)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 m-0" style={{ color: '#5F6B64' }}>No users found</p>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#4ADE80', fontSize: 15 }}>Recent Mock Exams</span>}
            style={{ borderRadius: 14, border: '1px solid #1F1F1F' }}
          >
            {recentMockExams.length > 0 ? (
              <div className="space-y-3">
                {recentMockExams.map((exam) => {
                  const parentExam =
                    typeof exam.exam === 'object' && exam.exam !== null
                      ? exam.exam
                      : null;
                  const parentName = parentExam?.name ?? '—';
                  const statusColor =
                    exam.status === 'active'
                      ? '#4ADE80'
                      : exam.status === 'upcoming'
                        ? '#F2C94C'
                        : exam.status === 'cancelled'
                          ? '#EB5757'
                          : '#9BA8A0';
                  return (
                    <div key={exam._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#171717' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'rgba(34, 197, 94, 0.14)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4ADE80',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {(exam.title || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm m-0 truncate" style={{ color: '#E8F5EC' }}>{exam.title}</p>
                          <p className="text-xs m-0" style={{ color: '#9BA8A0' }}>
                            {parentName !== '—' ? `${parentName} · ` : ''}
                            {exam.totalQuestions ?? 0} questions
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold m-0" style={{ color: statusColor, textTransform: 'capitalize' }}>
                          {exam.status}
                        </p>
                        <p className="text-[11px] m-0" style={{ color: '#5F6B64' }}>
                          {formatDateTime(exam.startDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-4 m-0" style={{ color: '#5F6B64' }}>No mock exams scheduled yet</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
