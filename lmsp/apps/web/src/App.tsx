import React from 'react';
import { Layout, theme } from 'antd';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck,
  Bot,
  Library,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
  { label: 'My Courses', icon: <BookOpen size={18} />, path: '/courses' },
  { label: 'Practice Quiz', icon: <ClipboardList size={18} />, path: '/quiz' },
  { label: 'Mock Exam', icon: <FileCheck size={18} />, path: '/mock-exam' },
  { label: 'AI Assistant', icon: <Bot size={18} />, path: '/ai-assistant' },
  { label: 'Question Analysis', icon: <Library size={18} />, path: '/question-bank' },
  { label: 'Performance', icon: <BarChart3 size={18} />, path: '/performance' },
  { label: 'Question Center', icon: <BarChart3 size={18} />, path: '/question-center' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },

];

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Layout className="h-screen">
      <Sider
        width={260}
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: '#142347' }}
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <aside className="w-full h-full bg-[#142347] text-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-xl bg-green-500" />
              <div>
                <h1 className="font-bold text-lg">BanglaPrep</h1>
                <p className="text-sm text-gray-300">BCS Learning</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    isActive(item.path)
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <p className="font-semibold">Md. Rahim Uddin</p>
            <p className="text-sm text-gray-300">BCS 47th</p>
          </div>
        </aside>
      </Sider>

      <Layout>
        {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
        <Content>
          <div
            className="overflow-y-auto h-[calc(100vh-10px)]"
            style={{
              padding: 10,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet  />
          </div>
        </Content>
     
      </Layout>
    </Layout>
  );
};

export default App;