import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Space,
  Typography,
  ConfigProvider,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  TagsOutlined,
  CalendarOutlined,
  BarChartOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { adminTheme } from './theme';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/exams')) return 'exams';
    if (path.includes('/admin/courses')) return 'courses';
    if (path.includes('/admin/questions')) return 'questions';
    if (path.includes('/admin/question-bank')) return 'question-bank';
    if (path.includes('/admin/subjects')) return 'subjects';
    if (path.includes('/admin/exam-control')) return 'exam-control';
    if (path.includes('/admin/featured-exam')) return 'featured-exam';
    if (path.includes('/admin/user-performance')) return 'user-performance';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'exams',
      icon: <FileTextOutlined />,
      label: 'Exams',
      onClick: () => navigate('/admin/exams'),
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: 'Courses',
      onClick: () => navigate('/admin/courses'),
    },
    {
      key: 'questions',
      icon: <QuestionCircleOutlined />,
      label: 'Upload Questions',
      onClick: () => navigate('/admin/questions'),
    },
    {
      key: 'question-bank',
      icon: <BookOutlined />,
      label: 'Question Bank',
      onClick: () => navigate('/admin/question-bank'),
    },
    {
      key: 'subjects',
      icon: <TagsOutlined />,
      label: 'Subjects',
      onClick: () => navigate('/admin/subjects'),
    },
    {
      key: 'exam-control',
      icon: <CalendarOutlined />,
      label: 'Exam Control',
      onClick: () => navigate('/admin/exam-control'),
    },
    {
      key: 'featured-exam',
      icon: <StarOutlined />,
      label: 'Featured Mock Exam',
      onClick: () => navigate('/admin/featured-exam'),
    },
    {
      key: 'user-performance',
      icon: <BarChartOutlined />,
      label: 'User Performance',
      onClick: () => navigate('/admin/user-performance'),
    },
  ];

  const handleBackToApp = () => {
    navigate('/');
  };

  const selectedKey = getSelectedKey();

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout className="h-screen bg-black">
        {/* Fixed sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: '#000000',
            borderRight: '1px solid #171717',
          }}
        >
          {/* Logo area */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #171717',
              padding: '0 16px',
            }}
          >
            <Space>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #22C55E 0%, #14532D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#04150B',
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                  boxShadow: '0 0 18px -2px rgba(34, 197, 94, 0.45)',
                }}
              >
                <SafetyOutlined />
              </div>
              {!collapsed && (
                <div>
                  <Text strong style={{ color: '#E8F5EC', fontSize: 16, display: 'block', lineHeight: 1.2 }}>
                    Admin Panel
                  </Text>
                  <Text style={{ color: '#5F6B64', fontSize: 11 }}>
                    Management Dashboard
                  </Text>
                </div>
              )}
            </Space>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{
              background: 'transparent',
              borderRight: 0,
              marginTop: 8,
            }}
          />

          {/* Back to app button */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              borderTop: '1px solid #171717',
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToApp}
              style={{
                color: '#9BA8A0',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                height: 'auto',
              }}
            >
              {!collapsed && 'Back to App'}
            </Button>
          </div>
        </Sider>

        {/* Right side layout with header and content */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            transition: 'margin-left 0.2s',
            background: '#000000',
            minHeight: '100vh',
          }}
        >
          {/* Header with menu toggle button */}
          <Header
            style={{
              background: '#000000',
              borderBottom: '1px solid #171717',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              height: 64,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                color: '#9BA8A0',
                fontSize: 16,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Header>

          {/* Main content area */}
          <Content style={{ padding: '1rem', flex: 1 }}>
            <div
              className="h-full overflow-y-auto border rounded-2xl p-1"
              style={{
                background: '#000000',
                borderColor: '#171717',
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminDashboard;