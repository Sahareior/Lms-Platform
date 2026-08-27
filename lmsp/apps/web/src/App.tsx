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
  // No logged-in user → drop any stale report (e.g. after logout)
  if (!user?._id) {
    lastSentKey.current = null;
    dispatch(clearAiReport());
    return;
  }

  // Avoid re-sending the same request on StrictMode double-invoke / refetches.
  // The backend caches the result for the whole day, so this only triggers the
  // expensive AI call at most once per day per user.
  if (lastSentKey.current === user._id) return;
  lastSentKey.current = user._id;

  const sendData = async () => {
    try {
      // The shell always loads the combined 'all exams' report. Per-exam
      // reports are owned by the Performance page under their own scope, so
      // drilling into one exam there never overwrites what the Dashboard shows.
      dispatch(setAiReportLoading({ scope: 'all', isLoading: true }));
      const res = await getOrGenerateAiPerformance({ userId: user._id }).unwrap();
      // No performance data yet → clear any stale report (keep saved history)
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
      // Allow a retry on the next mount / user change if loading failed
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
          // Track breakpoint; only show zero-width trigger and auto-collapse on mobile
          onBreakpoint={(broken) => setIsMobile(broken)}
          zeroWidthTriggerStyle={isMobile ? { top: '50%', transform: 'translateY(-50%)' } : undefined}
          style={{ background: '#111318', borderRight: '1px solid #23262D' }}
        >
          <aside className="w-full h-full bg-[#111318] text-[#F5F7FA] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-8">
              
                <img className='w-24' src="/a.png" alt="" />
             
                <div>
                  <h1 className="font-bold text-lg text-[#F5F7FA] tracking-wide" style={{ fontFeatureSettings: '"ss01"' }}>Geneseon</h1>
                  <p className="text-xs text-[#A1A8B3]">AI LMS Platform</p>
                </div>
              </div>

              <nav className="space-y-2 overflow-y-auto h-[85%] custom-scrollbar">
                {navItems.map((item, index) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        // collapse only on mobile/small screens
                        if (isMobile) setCollapsed(true);
                      }}
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

            {/* ── Bottom Section: Admin Panel + User Profile Card ── */}
            <div>
    

              {/* ── User Profile Card ───────────────────────── */}
              <div className="bg-[#161920] border border-[#23262D] rounded-2xl  p-1 mt-3 flex items-center gap-3 group">
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
              {/* ── Logout Button ──────────────────────────────── */}
              <button
                onClick={() => {
                  dispatch(logout());
                  setAuthToken(null);
                  clearPersistedAuth();
                  navigate('/login', { replace: true });
                }}
                className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#EB5757] hover:bg-[#EB5757]/10 transition-all "
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
              {/* ── Global top bar: search + notifications ── */}
              {/* <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#23262D] sticky top-0 z-40 bg-[#0B0D12]">
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    placeholder="Search courses, exams..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim().length >= 2) {
                        navigate(`/search?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111318] border border-[#23262D] text-xs text-[#F5F7FA] placeholder-[#6B7280] focus:outline-none focus:border-[#00C8FF]/50 focus:ring-1 focus:ring-[#00C8FF]/30 transition-all"
                  />
                </div>
                <NotificationBell />
              </div> */}
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;