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
  StarOutlined,
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
    <Layout className="h-screen">
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


   
          <Content className="bg-transparent p-4">
           <div
              className="overflow-y-auto overflow-hidden h-[calc(100vh-2rem)] border border-[#23262D] rounded-2xl p-1"
              style={{
                background: '#0B0D12',
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