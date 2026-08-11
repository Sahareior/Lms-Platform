import React, { useEffect, useRef } from 'react';
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
  const dispatch = useAppDispatch();
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
      dispatch(setAiReportLoading(true));
      const res = await getOrGenerateAiPerformance({ userId: user._id }).unwrap();
      // No performance data yet → clear any stale report (keep saved history)
      if (res.empty || !res.stats || !res.ai_report) {
        dispatch(clearCurrentReport());
        return;
      }
      dispatch(
        setAiReport({
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
      dispatch(setAiReportError('Failed to load AI performance report'));
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
          fontFamily: "'Geist', 'Inter', sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <Layout className="h-dvh bg-[#0B0D12] text-[#F5F7FA]">
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

              <nav className="space-y-2 overflow-y-auto h-[75%] custom-scrollbar">
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

            {/* ── Bottom Section: Admin Panel + User Profile Card ── */}
            <div>
              {user?.role === 'admin' && (
                <div className="mb-3">
                  <div className="h-px bg-[#23262D] mb-3" />
                  <button
                    onClick={() => navigate('/admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                      isActive('/admin')
                        ? 'bg-[#22C55E] text-black glow-ai border-transparent font-semibold'
                        : 'bg-transparent text-[#A1A8B3] border-transparent hover:bg-[#161920] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <ShieldCheck size={18} className={isActive('/admin') ? 'text-black' : 'text-[#22C55E]'} />
                    <span className="font-medium text-sm">Admin Panel</span>
                    {!isActive('/admin') && (
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-wide text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-1.5 py-0.5 rounded-md">
                        Admin
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* ── User Profile Card ───────────────────────── */}
              <div className="bg-[#161920] border border-[#23262D] rounded-2xl p-4 flex items-center gap-3 group">
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