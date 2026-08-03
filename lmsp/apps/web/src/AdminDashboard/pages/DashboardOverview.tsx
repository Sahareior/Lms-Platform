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
import { useGetAdminUsersQuery, useGetAdminExamsQuery, useGetAdminCoursesQuery, useGetAdminQuestionsQuery } from '@my-monorepo/store';

const DashboardOverview: React.FC = () => {
  const { data: users, isLoading: usersLoading, error: usersError } = useGetAdminUsersQuery();
  const { data: exams, isLoading: examsLoading, error: examsError } = useGetAdminExamsQuery();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useGetAdminCoursesQuery();
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useGetAdminQuestionsQuery();

  const isLoading = usersLoading || examsLoading || coursesLoading || questionsLoading;
  const error = usersError || examsError || coursesError || questionsError;

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
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
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
                        {(user.username || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm m-0" style={{ color: '#E8F5EC' }}>{user.username || 'N/A'}</p>
                        <p className="text-xs m-0" style={{ color: '#9BA8A0' }}>{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: '#5F6B64' }}>
                      {user.division || user.district || '—'}
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
            title={<span style={{ color: '#4ADE80', fontSize: 15 }}>Recent Exams</span>}
            style={{ borderRadius: 14, border: '1px solid #1F1F1F' }}
          >
            {exams && exams.length > 0 ? (
              <div className="space-y-3">
                {exams.slice(0, 5).map((exam) => (
                  <div key={exam._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#171717' }}>
                    <div className="flex items-center gap-3">
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
                        }}
                      >
                        {(exam.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm m-0" style={{ color: '#E8F5EC' }}>{exam.name}</p>
                        <p className="text-xs m-0" style={{ color: '#9BA8A0' }}>{exam.applicants || '0'} applicants</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 m-0" style={{ color: '#5F6B64' }}>No exams found</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
