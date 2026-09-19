import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Menu } from 'lucide-react';
import { navItemConfigs } from './navItems';
import { useTheme } from '../theme/ThemeContext';
import { useNavigationMode } from './NavigationContext';

/**
 * NavigationHub — an alternative "menu page" navigation system.
 * Instead of a persistent sidebar, users land here to jump to any section.
 * Renders inside the App shell (Outlet) like every other page.
 */
const NavigationHub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { setMode } = useNavigationMode();

  const handleSwitchToSidebar = () => {
    setMode('sidebar');
    navigate('/dashboard');
  };

  return (
    <div className={`p-4 sm:p-6 md:p-8 space-y-6 min-h-full ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark
              ? 'bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3]'
              : 'bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9]'
          }`}
        >
          <Compass size={20} />
        </div>
        <div>
          <h1 className={`text-2xl ${isDark ? 'font-bold' : 'font-black font-serif'}`}>
            Navigation Hub
          </h1>
          <p className={`text-sm ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
            Everything in one place — pick a section to jump to
          </p>
        </div>
      </div>

      {/* Switch back to sidebar */}
      <button
        onClick={handleSwitchToSidebar}
        className={`w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-all ${
          isDark
            ? 'border border-[#23262D] bg-[#161920] text-[#F5F7FA] hover:border-[#323742]'
            : 'border border-[#d8d4cb] bg-[#f2efe9] text-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isDark ? 'bg-[#2F80ED]/10 text-[#2F80ED]' : 'bg-[#e0dcd5] text-[#1a1a1a]'
            }`}
          >
            <Menu size={18} />
          </span>
          <div className="text-left">
            <div className={`text-sm ${isDark ? 'font-bold' : 'font-black font-serif'}`}>
              Switch back to the sidebar layout
            </div>
            <div className={`text-xs ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
              Prefer the classic side menu? One click restores it.
            </div>
          </div>
        </div>
        <ArrowRight size={18} className={isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'} />
      </button>

      {/* Navigation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {navItemConfigs.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group relative text-left rounded-2xl p-5 transition-all duration-200 border ${
                isDark
                  ? isActive
                    ? 'bg-[#161920] border-[#00E5B3]/60'
                    : 'bg-[#161920] border-[#23262D] hover:border-[#323742] hover:bg-[#181B23]'
                  : isActive
                  ? 'bg-[#f2efe9] border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                  : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#d8d4cb] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    isDark
                      ? 'bg-[#1D2029] text-[#A1A8B3] ring-1 ring-[#23262D] group-hover:text-[#F5F7FA]'
                      : 'bg-[#e0dcd5] text-[#4a4a4a] group-hover:bg-[#1a1a1a] group-hover:text-[#f2efe9]'
                  }`}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm ${isDark ? 'font-semibold text-[#F5F7FA]' : 'font-black font-serif text-[#1a1a1a]'}`}>
                    {item.label}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isDark ? 'text-[#8A919E]' : 'text-[#4a4a4a] font-serif italic'}`}>
                    {item.description}
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className={`shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${
                    isDark ? 'text-[#6B7280] group-hover:text-[#00E5B3]' : 'text-[#7a7a7a] group-hover:text-[#b91c1c]'
                  }`}
                />
              </div>

              {isActive && (
                <span
                  className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                    isDark ? 'text-[#00E5B3] bg-[#00E5B3]/10' : 'text-[#b91c1c] bg-[#e0dcd5] border border-[#b91c1c]/40'
                  }`}
                >
                  Current
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationHub;
