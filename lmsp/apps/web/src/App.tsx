import React from 'react';
import { ConfigProvider, Layout, theme as antdTheme } from 'antd';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Bot,
  Library,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Content, Sider } = Layout;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  glowClass?: string;
  activeColorClass?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'My Courses', icon: <BookOpen size={18} />, path: '/courses', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'AI Assistant', icon: <Bot size={18} />, path: '/ai-assistant', glowClass: 'glow-ai', activeColorClass: 'bg-[#00E5B3] text-black font-semibold' },
  { label: 'Mock Exam', icon: <FileCheck size={18} />, path: '/mock-exam', glowClass: 'glow-purple', activeColorClass: 'bg-[#9B51E0] text-white' },
  { label: 'Question Analysis', icon: <Library size={18} />, path: '/question-bank', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Performance', icon: <BarChart3 size={18} />, path: '/performance', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Question Center', icon: <BarChart3 size={18} />, path: '/question-center', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings', glowClass: 'glow-primary', activeColorClass: 'bg-[#23262D] text-[#F5F7FA]' },
];

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorBgBase: '#0B0D12',
          colorBgContainer: '#111318',
          colorBgElevated: '#161920',
          colorBorder: '#23262D',
          colorPrimary: '#2F80ED',
          colorText: '#F5F7FA',
          colorTextDescription: '#A1A8B3',
          fontFamily: "'Geist', 'Inter', sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <Layout className="h-screen bg-[#0B0D12] text-[#F5F7FA]">
        <Sider
          width={260}
          breakpoint="lg"
          collapsedWidth="0"
          style={{ background: '#111318', borderRight: '1px solid #23262D' }}
        >
          <aside className="w-full h-full bg-[#111318] text-[#F5F7FA] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-16 w-16 rounded-xl flex items-center justify-center glow-primary">
                <img src="/logo.png" alt="" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-[#F5F7FA] tracking-wide">BrainForge</h1>
                  <p className="text-xs text-[#A1A8B3]">AI LMS Platform</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item, index) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                        active
                          ? `${item.activeColorClass} ${item.glowClass} border-transparent`
                          : 'bg-transparent text-[#A1A8B3] border-transparent hover:bg-[#161920] hover:text-[#F5F7FA]'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-[#161920] border border-[#23262D] rounded-2xl p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#2F80ED]/20 text-[#2F80ED] font-semibold flex items-center justify-center border border-[#2F80ED]/40">
                SR
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-[#F5F7FA] truncate">Sahareior</p>
                <p className="text-xs text-[#A1A8B3] truncate">BCS Candidate</p>
              </div>
            </div>
          </aside>
        </Sider>

        <Layout className="bg-transparent">
          <Content className="bg-transparent p-4">
            <div
              className="overflow-y-auto h-[calc(100vh-2rem)] border border-[#23262D] rounded-2xl p-6"
              style={{
                background: '#0B0D12',
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

export default App;