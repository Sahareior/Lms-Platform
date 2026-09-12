import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Award, BookOpen, Info, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useAppSelector,
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type AppNotification,
} from '@my-monorepo/store';

const typeIcon = (type: string) => {
  switch (type) {
    case 'certificate':
      return <Award size={14} className="text-[#00E5B3]" />;
    case 'course':
      return <BookOpen size={14} className="text-[#2F80ED]" />;
    case 'warning':
      return <AlertTriangle size={14} className="text-[#F2C94C]" />;
    default:
      return <Info size={14} className="text-[#A1A8B3]" />;
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.user.user?._id) || '';
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const { data } = useGetMyNotificationsQuery(userId, { skip: !userId, pollingInterval: 60000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications: AppNotification[] = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close the panel when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleOpenNotification = (n: AppNotification) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] border border-transparent hover:border-[#23262D] transition-all"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EB5757] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-w-[85vw] bg-[#161920] border border-[#23262D] rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#23262D]">
            <span className="text-sm font-bold text-[#F5F7FA]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead(userId)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#00E5B3] hover:text-[#00C298] transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-[#6B7280] py-10">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleOpenNotification(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-[#23262D]/60 transition-colors hover:bg-[#111318] ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-[#111318] border border-[#23262D] flex items-center justify-center">
                    {typeIcon(n.type)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs ${n.read ? 'text-[#A1A8B3]' : 'text-[#F5F7FA] font-semibold'}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
