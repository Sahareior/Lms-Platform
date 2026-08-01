import React, { useState } from 'react';
import {
  Layout,
  Menu,
  theme,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  TagsOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
    <Layout className="h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '0 16px',
          }}
        >
          <Space>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <SafetyOutlined />
            </div>
            {!collapsed && (
              <div>
                <Text strong style={{ color: 'white', fontSize: 16, display: 'block', lineHeight: 1.2 }}>
                  Admin Panel
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
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

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToApp}
            style={{
              color: 'rgba(255,255,255,0.65)',
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

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40 }}
            />
            <Text type="secondary" style={{ fontSize: 14 }}>
              {selectedKey === 'dashboard' && 'Dashboard Overview'}
              {selectedKey === 'users' && 'User Management'}
              {selectedKey === 'exams' && 'Exam Management'}
              {selectedKey === 'courses' && 'Course Management'}
              {selectedKey === 'questions' && 'Upload Questions'}
              {selectedKey === 'question-bank' && 'Question Bank'}
              {selectedKey === 'subjects' && 'Subject Management'}
              {selectedKey === 'exam-control' && 'Exam Control'}
              {selectedKey === 'user-performance' && 'User Performance'}
            </Text>
          </Space>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: 'Profile',
                },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Settings',
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  danger: true,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{
                  backgroundColor: '#667eea',
                  verticalAlign: 'middle',
                }}
                icon={<UserOutlined />}
              />
              <Text style={{ color: '#142347' }}>Admin</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 112px)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;