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
      icon: <UserOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
      color: '#e6f7ff',
      borderColor: '#1890ff',
    },
    {
      title: 'Total Exams',
      value: exams?.length ?? 0,
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      color: '#f6ffed',
      borderColor: '#52c41a',
    },
    {
      title: 'Total Courses',
      value: courses?.length ?? 0,
      icon: <BookOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
      color: '#f9f0ff',
      borderColor: '#722ed1',
    },
    {
      title: 'Question Banks',
      value: questions?.length ?? 0,
      icon: <QuestionCircleOutlined style={{ fontSize: 28, color: '#fa8c16' }} />,
      color: '#fff7e6',
      borderColor: '#fa8c16',
    },
    {
      title: 'Total Questions',
      value: questions?.reduce((acc, q) => acc + (q.data?.length ?? 0), 0) ?? 0,
      icon: <ExperimentOutlined style={{ fontSize: 28, color: '#eb2f96' }} />,
      color: '#fff0f6',
      borderColor: '#eb2f96',
    },
    {
      title: 'Avg Questions/Exam',
      value: exams?.length ? Math.round((questions?.reduce((acc, q) => acc + (q.data?.length ?? 0), 0) ?? 0) / exams.length) : 0,
      icon: <RiseOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
      color: '#e6fffb',
      borderColor: '#13c2c2',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#142347' }}>Admin Dashboard</h2>
      <Row gutter={[24, 24]}>
        {statsCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              hoverable
              style={{
                borderLeft: `4px solid ${card.borderColor}`,
                borderRadius: 12,
                background: card.color,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span style={{ color: '#555', fontSize: 14 }}>{card.title}</span>}
                    value={card.value}
                    valueStyle={{ color: '#142347', fontSize: 32, fontWeight: 700 }}
                  />
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
          <Card title="Recent Users" style={{ borderRadius: 12 }}>
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#e6f7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1890ff',
                          fontWeight: 600,
                        }}
                      >
                        {(user.username || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#142347' }}>{user.username || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {user.division || user.district || '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No users found</p>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Exams" style={{ borderRadius: 12 }}>
            {exams && exams.length > 0 ? (
              <div className="space-y-3">
                {exams.slice(0, 5).map((exam) => (
                  <div key={exam._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: '#f6ffed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#52c41a',
                          fontWeight: 600,
                        }}
                      >
                        {(exam.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#142347' }}>{exam.name}</p>
                        <p className="text-xs text-gray-500">{exam.applicants || '0'} applicants</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No exams found</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
