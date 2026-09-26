import React, { useEffect, useRef, useState, Suspense } from 'react';
import { ConfigProvider, Layout, theme as antdTheme } from 'antd';
import { useTheme } from './theme/ThemeContext';
import {
  LogOut,
  LayoutGrid,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { prefetchRoute, prefetchAllRoutes } from './routePrefetch';
// Lazy-load SweetAlert2 — only pulled in when the user actually clicks logout
const getSwal = () => import('sweetalert2').then(m => m.default);
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
import { navItemConfigs } from './navigation/navItems';
import { useNavigationMode } from './navigation/NavigationContext';
import { useGetOrGenerateAiPerformanceMutation } from '@my-monorepo/store/src/redux/api/userPerformanceApi';
import NotificationBell from './(components)/MainPages/notifications/NotificationBell';

const { Content, Sider } = Layout;

// Single source of truth shared with the Navigation Hub page and the Settings picker
const navItems = navItemConfigs;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, isDark, setTheme } = useTheme();
  const { isHub } = useNavigationMode();
  const { user } = useAppSelector((state) => state.user);
  const [getOrGenerateAiPerformance] = useGetOrGenerateAiPerformanceMutation();
  const lastSentKey = useRef<string | null>(null);

  // ─── Prefetch all route chunks after 3s idle ────────────────
  useEffect(() => {
    const timer = setTimeout(prefetchAllRoutes, 3000);
    return () => clearTimeout(timer);
  }, []);

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

  // ─── Shell colors (theme-aware) ────────────────────────────
  const shellColors = isDark
    ? {
        pageBg: '#0B0D12',
        sidebarBg: '#111318',
        surfaceBg: '#161920',
        contentBg: '#0B0D12',
        border: '#23262D',
        textPrimary: '#F5F7FA',
        textSecondary: '#A1A8B3',
        hoverBg: '#161920',
        subtlePanel: '#161920',
      }
    : {
        pageBg: '#e8e4db',
        sidebarBg: '#f2efe9',
        surfaceBg: '#e0dcd5',
        contentBg: '#e8e4db',
        border: '#d8d4cb',
        textPrimary: '#1a1a1a',
        textSecondary: '#4a4a4a',
        hoverBg: '#e0dcd5',
        subtlePanel: '#e0dcd5',
      };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark
          ? {
              colorBgBase: '#0B0D12',
              colorBgContainer: '#111318',
              colorBgElevated: '#161920',
              colorBorder: '#23262D',
              colorPrimary: '#2F80ED',
              colorText: '#F5F7FA',
              colorTextDescription: '#A1A8B3',
              fontFamily: "'Space Grotesk', 'Geist', 'Inter', sans-serif",
              borderRadius: 12,
            }
          : {
              colorBgBase: '#e8e4db',
              colorBgContainer: '#f2efe9',
              colorBgElevated: '#f2efe9',
              colorBorder: '#d8d4cb',
              colorPrimary: '#1a1a1a',
              colorText: '#1a1a1a',
              colorTextDescription: '#4a4a4a',
              fontFamily: "'Space Grotesk', 'Geist', 'Inter', serif",
              borderRadius: 8,
            },
      }}
    >
      <Layout className="h-dvh" style={{ background: shellColors.pageBg, color: shellColors.textPrimary }}>
        {/* Sidebar hidden entirely in hub navigation mode */}
        {!isHub && (
        <Sider
          width={260}
          breakpoint="lg"
          collapsedWidth={0}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          onBreakpoint={(broken) => setIsMobile(broken)}
          zeroWidthTriggerStyle={isMobile ? { top: '50%', transform: 'translateY(-50%)' } : undefined}
          style={{
            background: shellColors.sidebarBg,
            
          }}
        >
          <aside
            className="w-full h-full flex flex-col"
            style={{
              background: shellColors.sidebarBg,
              color: shellColors.textPrimary,
              ...(isDark ? {} : {
                backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }),
            }}
          >
            <div className="p-6 pb-4 shrink-0">
              <div className="flex items-center gap-1">
               {
                !isDark? (<img className="w-24" src="/a2.webp" alt="" />):(<img className="w-24" src="/a.webp" alt="" />)
               }
                <div>
                  <h1
                    className={`text-lg tracking-wide ${isDark ? 'font-bold' : 'font-black font-serif'}`}
                    style={{ color: shellColors.textPrimary, fontFeatureSettings: '"ss01"' }}
                  >
                    Geneseon
                  </h1>
                  <p className={`text-xs ${isDark ? '' : 'font-serif italic'}`} style={{ color: shellColors.textSecondary }}>
                    AI LMS Platform
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar min-h-0">
              {navItems.map((item, index) => {
                const active = isActive(item.path);

                // Light mode active colors (monochrome vintage)
                const lightActiveClass = 'bg-[#1a1a1a] text-[#f2efe9] font-black font-serif border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]';
                const lightInactiveClass = 'bg-[#f2efe9] text-[#4a4a4a] hover:bg-[#e0dcd5] hover:text-[#1a1a1a] border border-[#d8d4cb] shadow-[1px_1px_0px_0px_#d8d4cb] font-serif font-bold';

                return (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setCollapsed(true);
                    }}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onTouchStart={() => prefetchRoute(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                      isDark
                        ? active
                          ? `${item.activeColorClass} ${item.glowClass} border-transparent`
                          : `bg-transparent border-transparent text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]`
                        : active
                        ? lightActiveClass
                        : lightInactiveClass
                    }`}
                  >
                    {item.icon}
                    <span className={`text-sm ${isDark ? 'font-medium' : 'font-serif font-bold'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="p-6 pt-4 shrink-0">
              <div
                className="rounded-2xl p-1 mt-3 flex items-center gap-3 group"
                style={{
                  background: shellColors.subtlePanel,
                  
                  boxShadow: isDark ? 'none' : '2px 2px 0px 0px #1a1a1a',
                }}
              >
                <div
                  className={`h-9 w-9 rounded-full font-black flex items-center justify-center shrink-0 border ${
                    isDark
                      ? 'bg-[#2F80ED]/20 text-[#2F80ED] border-[#2F80ED]/40'
                      : 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-serif'
                  }`}
                >
                  {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${isDark ? 'font-semibold' : 'font-black font-serif'}`}
                    style={{ color: shellColors.textPrimary }}
                  >
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p
                    className={`text-xs truncate capitalize ${isDark ? '' : 'font-serif italic'}`}
                    style={{ color: shellColors.textSecondary }}
                  >
                    {user?.role || 'Student'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const Swal = await getSwal();
                    Swal.fire({
                      title: 'Are you sure?',
                      text: 'You will be logged out from your current session.',
                      icon: 'warning',
                      iconColor: isDark ? '#10B981' : '#b91c1c',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, log out',
                      cancelButtonText: 'Cancel',
                      reverseButtons: true,
                      background: isDark ? '#111318' : '#f2efe9',
                      color: isDark ? '#F5F7FA' : '#1a1a1a',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.55)' : '#1a1a1a'}`,
                      customClass: {
                        popup: isDark
                          ? 'rounded-2xl z-[9999999] shadow-[0_20px_60px_rgba(15,23,42,0.2)] border border-emerald-500/40'
                          : 'rounded-lg z-[9999999] shadow-[4px_4px_0px_0px_#1a1a1a] border border-[#1a1a1a]',
                        title: isDark
                          ? 'text-[1.15rem] font-semibold text-[#F5F7FA]'
                          : 'text-[1.15rem] font-black font-serif text-[#1a1a1a]',
                        confirmButton: isDark
                          ? 'bg-[#0F172A] text-[#D1FAE5] border border-[#34D399] px-4 py-2 rounded-xl font-medium hover:bg-[#0B1F17] transition-colors'
                          : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-serif font-black shadow-[2px_2px_0px_0px_#b91c1c] px-4 py-2 rounded-md transition-colors',
                        cancelButton: isDark
                          ? 'bg-[#161920] text-[#F5F7FA] border border-[#2A2F3A] px-4 py-2 rounded-xl font-medium'
                          : 'bg-[#f2efe9] text-[#1a1a1a] border border-[#d8d4cb] font-serif font-bold px-4 py-2 rounded-md shadow-[1px_1px_0px_0px_#1a1a1a]',
                        actions: 'gap-3 mt-2',
                        htmlContainer: isDark ? 'text-[#A1A8B3] text-sm' : 'text-[#4a4a4a] text-sm font-serif italic',
                      },
                      buttonsStyling: false,
                    }).then((result) => {
                      if (!result.isConfirmed) return;

                      dispatch(logout());
                      setAuthToken(null);
                      clearPersistedAuth();
                      navigate('/login', { replace: true });
                    });
                  }}
                  className={`p-2 rounded-lg transition-all ${isDark ? '' : 'hover:bg-[#e0dcd5]'}`}
                  style={{
                    color: shellColors.textSecondary,
                    background: 'transparent',
                  }}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
        </Sider>
        )}

        <Layout className="bg-transparent">
          <Content className="bg-transparent p-1">
            <div
              data-scroll-container
              className={`overflow-y-auto h-[calc(100dvh-0.5rem)] border ${
                isDark ? 'rounded-2xl' : 'rounded-lg'
              }`}
              style={{
                background: shellColors.contentBg,
                borderColor: isDark ? shellColors.border : '#1a1a1a',
                color: shellColors.textPrimary,
                ...(isDark ? {} : {
                  backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  boxShadow: '3px 3px 0px 0px #1a1a1a',
                }),
              }}
            >
              {/* Floating menu button in hub mode — quick access to the hub page */}
              {isHub && (
                <div className="fixed bottom-32 right-5 z-50">
                  <button
                    onClick={() => navigate('/navigate')}
                    title="Open Navigation Hub"
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-90 ${
                      isDark
                        ? 'bg-[#161920] border border-[#00E5B3]/40 text-[#00E5B3] shadow-[0_8px_24px_-8px_rgba(0,229,179,0.5)] hover:bg-[#1D2029]'
                        : 'bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9] shadow-[3px_3px_0px_0px_#b91c1c] hover:shadow-[4px_4px_0px_0px_#b91c1c]'
                    }`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                </div>
              )}
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-32">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;