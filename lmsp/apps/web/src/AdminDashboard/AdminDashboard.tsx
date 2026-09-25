import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Space,
  Typography,
  ConfigProvider,
  theme as antdTheme,
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
  SunOutlined,
  MoonOutlined,
  AppstoreOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_COLORS } from './theme';
import { AdminThemeProvider, useAdminTheme } from './ThemeContext';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminDashboardInner: React.FC = () => {
  const { isDark, setTheme, toggleTheme } = useAdminTheme();
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
    if (path.includes('/admin/creative-questions')) return 'creative-questions';
    if (path.includes('/admin/subjects')) return 'subjects';
    if (path.includes('/admin/exam-control')) return 'exam-control';
    if (path.includes('/admin/featured-exam')) return 'featured-exam';
    if (path.includes('/admin/study-section')) {
      const child = path.split('/').pop();
      return ['study-section', child === 'new' || child === 'edit' ? 'blog-posts' : child];
    }
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
      label: 'Upload Documents',
      onClick: () => navigate('/admin/questions'),
    },
    {
      key: 'question-bank',
      icon: <BookOutlined />,
      label: 'Question Bank',
      onClick: () => navigate('/admin/question-bank'),
    },
    {
      key: 'creative-questions',
      icon: <FileAddOutlined />,
      label: 'Creative Questions',
      onClick: () => navigate('/admin/creative-questions'),
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
      key: 'study-section',
      icon: <AppstoreOutlined />,
      label: 'Study Section',
      children: [
        { key: 'study-pdfs', label: 'Study PDFs', onClick: () => navigate('/admin/study-section/pdf') },
        { key: 'blog-posts', label: 'Blog Posts', onClick: () => navigate('/admin/study-section/blog') },
        { key: 'study-groups', label: 'Study Groups', onClick: () => navigate('/admin/study-section/groups') },
      ],
    },
    {
      key: 'user-performance',
      icon: <BarChartOutlined />,
      label: 'User Performance',
      onClick: () => navigate('/admin/user-performance'),
    },
  ];

  const handleBackToApp = () => {
    navigate('/dashboard');
  };

  const selectedKey = getSelectedKey();

  const sidebarBg = isDark ? '#000000' : '#f2efe9';
  const sidebarBorder = isDark ? '#171717' : '#e0dcd5';
  const layoutBg = isDark ? '#000000' : '#f2efe9';
  const headerBg = isDark ? '#000000' : '#f2efe9';
  const headerBorder = isDark ? '#171717' : '#e0dcd5';
  const contentBg = isDark ? '#000000' : '#f2efe9';
  const contentBorder = isDark ? '#171717' : '#e0dcd5';
  const textPrimary = isDark ? '#E8F5EC' : '#1a1a1a';
  const textSecondary = isDark ? '#9BA8A0' : '#4a4a4a';
  const textMuted = isDark ? '#5F6B64' : '#7a7a7a';
  const accentGreen = '#22C55E';
  const accentGreenDim = '#14532D';
  const accentRed = '#b91c1c';

  const dynamicTheme = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: accentGreen,
      colorInfo: accentGreen,
      colorSuccess: '#4ADE80',
      colorBgBase: layoutBg,
      colorBgContainer: isDark ? ADMIN_COLORS.bgContainer : '#f2efe9',
      colorBgElevated: isDark ? ADMIN_COLORS.bgElevated : '#ffffff',
      colorBorder: isDark ? ADMIN_COLORS.border : '#d8d4cb',
      colorBorderSecondary: isDark ? ADMIN_COLORS.borderSubtle : '#e0dcd5',
      colorText: textPrimary,
      colorTextSecondary: textSecondary,
      colorTextDescription: textSecondary,
      colorTextDisabled: textMuted,
      colorSplit: isDark ? ADMIN_COLORS.borderSubtle : '#e0dcd5',
      borderRadius: 12,
      fontFamily: "'Space Grotesk', 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    components: {
      Layout: {
        bodyBg: layoutBg,
        headerBg: headerBg,
        siderBg: sidebarBg,
      },
      Menu: {
        darkItemBg: sidebarBg,
        darkSubMenuItemBg: isDark ? ADMIN_COLORS.bgContainer : '#e8e4db',
        darkItemColor: textSecondary,
        darkItemHoverBg: isDark ? ADMIN_COLORS.bgHover : '#e8e4db',
        darkItemHoverColor: textPrimary,
        darkItemSelectedBg: accentGreenDim,
        darkItemSelectedColor: '#4ADE80',
        itemBorderRadius: 10,
        itemMarginInline: 8,
      },
      Table: {
        headerBg: isDark ? '#0F0F0F' : '#f2efe9',
        headerColor: isDark ? '#4ADE80' : accentRed,
        headerSplitColor: isDark ? ADMIN_COLORS.borderSubtle : '#d8d4cb',
        rowHoverBg: isDark ? 'rgba(34, 197, 94, 0.06)' : 'rgba(185, 28, 28, 0.06)',
        borderColor: isDark ? ADMIN_COLORS.borderSubtle : '#d8d4cb',
        cellPaddingBlock: 12,
      },
      Button: {
        primaryColor: isDark ? '#04150B' : '#f2efe9',
        primaryShadow: isDark ? '0 6px 16px -4px rgba(34, 197, 94, 0.35)' : '0 6px 16px -4px rgba(185, 28, 28, 0.35)',
        defaultBg: isDark ? ADMIN_COLORS.bgElevated : '#ffffff',
        defaultBorderColor: isDark ? '#2A2A2A' : '#d8d4cb',
        defaultColor: textPrimary,
        defaultHoverBg: isDark ? ADMIN_COLORS.bgHover : '#e8e4db',
        fontWeight: 500,
      },
      Modal: {
        contentBg: isDark ? ADMIN_COLORS.bgElevated : '#ffffff',
        headerBg: isDark ? ADMIN_COLORS.bgElevated : '#f2efe9',
        titleColor: textPrimary,
        titleFontSize: 17,
      },
      Card: { colorBgContainer: isDark ? ADMIN_COLORS.bgContainer : '#f2efe9' },
      Select: {
        optionSelectedBg: isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(185, 28, 28, 0.18)',
        optionSelectedColor: isDark ? '#4ADE80' : accentRed,
      },
      Input: { colorBgContainer: isDark ? '#0F0F0F' : '#ffffff' },
      InputNumber: { colorBgContainer: isDark ? '#0F0F0F' : '#ffffff' },
      DatePicker: { colorBgContainer: isDark ? '#0F0F0F' : '#ffffff' },
      Tag: { defaultBg: isDark ? ADMIN_COLORS.bgElevated : '#e8e4db', defaultColor: textSecondary },
      Spin: { colorPrimary: accentGreen },
      Progress: { defaultColor: accentGreen },
      Statistic: { contentFontSize: 30 },
      Descriptions: {
        labelBg: isDark ? '#0F0F0F' : '#f2efe9',
      },
      Popconfirm: { colorBgElevated: isDark ? ADMIN_COLORS.bgElevated : '#ffffff' },
    },
  };

  return (
    <ConfigProvider theme={dynamicTheme}>
      <Layout className="h-screen" style={{ background: layoutBg }}>
        {/* Fixed sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: sidebarBg,
            borderRight: `1px solid ${sidebarBorder}`,
          }}
        >
          {/* Logo area */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${sidebarBorder}`,
              padding: '0 16px',
            }}
          >
            <Space>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${accentGreen} 0%, ${accentGreenDim} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#04150B',
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                  boxShadow: `0 0 18px -2px rgba(34, 197, 94, 0.45)`,
                }}
              >
                <SafetyOutlined />
              </div>
              {!collapsed && (
                <div>
                  <Text strong style={{ color: textPrimary, fontSize: 16, display: 'block', lineHeight: 1.2 }}>
                    Admin Panel
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 11 }}>
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
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              marginTop: 8,
            }}
          />

          {/* Back to app button */}
          <div
            style={{
              padding: '12px 16px 16px',
              borderTop: `1px solid ${sidebarBorder}`,
              background: sidebarBg,
              flexShrink: 0,
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToApp}
              style={{
                color: textSecondary,
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                height: 'auto',
                borderRadius: 10,
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
            background: layoutBg,
            minHeight: '100vh',
          }}
        >
          {/* Header with menu toggle button */}
          <Header
            style={{
              background: headerBg,
              borderBottom: `1px solid ${headerBorder}`,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              height: 64,
              justifyContent: 'space-between',
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                color: textSecondary,
                fontSize: 16,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{
                color: textSecondary,
                fontSize: 16,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            />
          </Header>

          {/* Main content area */}
          <Content style={{ padding: '1rem', flex: 1 }}>
            <div
              data-scroll-container
              className="h-[80vh] overflow-y-auto border rounded-2xl p-1"
              style={{
                background: contentBg,
                borderColor: contentBorder,
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

const AdminDashboard: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminDashboardInner />
    </AdminThemeProvider>
  );
};

export default AdminDashboard;