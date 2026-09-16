import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider, Layout, theme as antdTheme } from 'antd';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Bot,
  Library,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Search,
  NotebookPen,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  useAppDispatch,
  useAppSelector,
  logout,
  setAuthToken,
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  clearAiReport,
  clearCurrentReport,
} from '@my-monorepo/store';
import { clearPersistedAuth } from './auth/AuthInitializer';
import { useGetOrGenerateAiPerformanceMutation } from '@my-monorepo/store/src/redux/api/userPerformanceApi';
import NotificationBell from './(components)/MainPages/notifications/NotificationBell';

const { Content, Sider } = Layout;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  glowClass?: string;
  activeColorClass?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'My Courses', icon: <BookOpen size={18} />, path: '/courses', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'AI Assistant', icon: <Bot size={18} />, path: '/ai-assistant', glowClass: 'glow-ai', activeColorClass: 'bg-[#00E5B3] text-black font-semibold' },
  { label: 'Mock Exam', icon: <FileCheck size={18} />, path: '/mock-exam', glowClass: 'glow-purple', activeColorClass: 'bg-[#9B51E0] text-white' },
  { label: 'Question Analysis', icon: <Library size={18} />, path: '/question-bank', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Performance', icon: <BarChart3 size={18} />, path: '/performance', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Question Center', icon: <BarChart3 size={18} />, path: '/question-center', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Notebook', icon: <NotebookPen size={18} />, path: '/notebook', glowClass: 'glow-purple', activeColorClass: 'bg-[#9B51E0] text-white' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings', glowClass: 'glow-primary', activeColorClass: 'bg-[#23262D] text-[#F5F7FA]' },
];

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  const [getOrGenerateAiPerformance] = useGetOrGenerateAiPerformanceMutation();
  const lastSentKey = useRef<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (!user?._id) {
      lastSentKey.current = null;
      dispatch(clearAiReport());
      return;
    }

    if (lastSentKey.current === user._id) return;
    lastSentKey.current = user._id;

    const sendData = async () => {
      try {
        dispatch(setAiReportLoading({ scope: 'all', isLoading: true }));
        const res = await getOrGenerateAiPerformance({ userId: user._id }).unwrap();
        if (res.empty || !res.stats || !res.ai_report) {
          dispatch(clearCurrentReport({ scope: 'all' }));
          return;
        }
        dispatch(
          setAiReport({
            scope: 'all',
            report: {
              success: res.success,
              stats: res.stats,
              ai_report: res.ai_report,
            },
            previous: res.previous,
            isCached: res.cached,
            generatedAt: res.generatedAt,
          })
        );
      } catch (err) {
        console.error(err);
        lastSentKey.current = null;
        dispatch(setAiReportError({ scope: 'all', error: 'Failed to load AI performance report' }));
      }
    };
    sendData();
  }, [user?._id, getOrGenerateAiPerformance, dispatch]);

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
          fontFamily: "'Space Grotesk', 'Geist', 'Inter', sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <Layout className="h-dvh bg-[#0B0D12] text-[#F5F7FA]">
        <Sider
          width={260}
          breakpoint="lg"
          collapsedWidth={0}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          onBreakpoint={(broken) => setIsMobile(broken)}
          zeroWidthTriggerStyle={isMobile ? { top: '50%', transform: 'translateY(-50%)' } : undefined}
          style={{ background: '#111318', borderRight: '1px solid #23262D' }}
        >
          {/* FIX: Changed to h-full flex flex-col with proper overflow handling */}
          <aside className="w-full h-full bg-[#111318] text-[#F5F7FA] flex flex-col">
            {/* Logo Section - Fixed height */}
            <div className="p-6 pb-4 shrink-0">
              <div className="flex items-center gap-1">
                <img className='w-24' src="/a.png" alt="" />
                <div>
                  <h1 className="font-bold text-lg text-[#F5F7FA] tracking-wide" style={{ fontFeatureSettings: '"ss01"' }}>Geneseon</h1>
                  <p className="text-xs text-[#A1A8B3]">AI LMS Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation - Flexible height with scroll */}
            <nav className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar min-h-0">
              {navItems.map((item, index) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setCollapsed(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${active
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

            {/* Bottom Section - Fixed height */}
            <div className="p-6 pt-4 shrink-0">
              <div className="bg-[#161920] border border-[#23262D] rounded-2xl p-1 mt-3 flex items-center gap-3 group">
                <div className="h-9 w-9 rounded-full bg-[#2F80ED]/20 text-[#2F80ED] font-semibold flex items-center justify-center border border-[#2F80ED]/40 shrink-0">
                  {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#F5F7FA] truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-[#A1A8B3] truncate capitalize">
                    {user?.role || 'Student'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(logout());
                    setAuthToken(null);
                    clearPersistedAuth();
                    navigate('/login', { replace: true });
                  }}
                  className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#EB5757] hover:bg-[#EB5757]/10 transition-all"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
        </Sider>

        <Layout className="bg-transparent">
          <Content className="bg-transparent md:p-4">
            <div
              data-scroll-container
              className="overflow-y-auto h-[calc(100dvh-0.5rem)] md:h-[calc(100dvh-2rem)] border border-[#23262D] rounded-2xl p-1"
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