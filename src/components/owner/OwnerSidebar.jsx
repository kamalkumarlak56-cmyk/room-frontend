// client/src/components/owner/OwnerSidebar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/shadcn';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  MessageSquare,
  Star,
  LogOut,
  X,
} from 'lucide-react';

export default function OwnerSidebar({
  activeTab,
  setActiveTab,
  counts = { rooms: 0, payments: 0, unread: 0, reviews: 0 },
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/owner/dashboard',
      badge: null,
      description: 'Overview & key metrics',
    },
    {
      id: 'rooms',
      label: 'Rooms',
      icon: Building2,
      path: '/owner/rooms',
      badge: counts.rooms > 0 ? counts.rooms : null,
      description: 'Published, available & booked',
    },
    {
      id: 'payments',
      label: 'Payment',
      icon: CreditCard,
      path: '/owner/payments',
      badge: counts.payments > 0 ? counts.payments : null,
      description: 'Rent receipts & tenant history',
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageSquare,
      path: '/owner/chats',
      badge: counts.unread > 0 ? `${counts.unread} new` : null,
      badgeVariant: 'destructive',
      description: 'Tenant direct messages',
    },
    {
      id: 'reviews',
      label: 'Rating and Reviews',
      icon: Star,
      path: '/owner/reviews',
      badge: counts.reviews > 0 ? counts.reviews : null,
      description: 'Room-wise tenant ratings',
    },
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop - positioned below top navbar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[57px] bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - cleanly docked below top main navbar */}
      <aside
        className={`fixed top-[57px] bottom-0 left-0 z-40 w-72 h-[calc(100vh-57px)] bg-[#f9f6f0] dark:bg-[#0a0b0d] border-r border-[#e2dbcf] dark:border-neutral-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none overflow-y-auto p-3.5 space-y-3.5 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button Header */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[#e2dbcf] dark:border-neutral-800">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Owner Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card 1: User Profile Summary Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar
              src={user?.profilePic}
              name={user?.name || 'Owner'}
              size="lg"
              className="w-13 h-13 rounded-full border border-neutral-300 dark:border-neutral-700"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900 shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {user?.name || 'Owner'}
            </h3>
            <p className={`text-xs truncate ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {user?.email || 'owner@roomradar.com'}
            </p>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isDark
                  ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                  : 'bg-[#ede5da] text-neutral-800 border-[#d8cdbf]'
              }`}>
                OWNER
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Navigation Menu Card */}
        <div className="p-2 sm:p-2.5 rounded-2xl border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm transition cursor-pointer group ${
                    isSelected
                      ? isDark
                        ? 'bg-neutral-800 text-white border border-neutral-700 font-bold shadow-xs'
                        : 'bg-[#f5efe6] text-neutral-950 border border-[#d8cdbf] font-bold shadow-xs'
                      : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-transparent'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition ${
                        isSelected
                          ? isDark
                            ? 'text-white'
                            : 'text-neutral-950'
                          : isDark
                          ? 'text-neutral-400 group-hover:text-white'
                          : 'text-neutral-600 group-hover:text-neutral-950'
                      }`}
                    />
                    <div className="truncate">
                      <p
                        className={`truncate leading-tight font-bold ${
                          isSelected
                            ? isDark
                              ? 'text-white'
                              : 'text-neutral-950'
                            : isDark
                            ? 'text-neutral-200 group-hover:text-white'
                            : 'text-neutral-800 group-hover:text-neutral-950'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-[10px] font-normal truncate mt-0.5 ${
                          isSelected
                            ? isDark
                              ? 'text-neutral-300'
                              : 'text-neutral-600'
                            : isDark
                            ? 'text-neutral-400 group-hover:text-neutral-300'
                            : 'text-neutral-500 group-hover:text-neutral-700'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeVariant === 'destructive'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isSelected
                          ? isDark
                            ? 'bg-white text-neutral-950'
                            : 'bg-neutral-950 text-white'
                          : isDark
                          ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                          : 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="pt-1.5 border-t border-[#e2dbcf] dark:border-neutral-800 my-1" />

          {/* Pink Logout Button matching image design */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#fdf2f2] text-[#e02424] hover:bg-[#fde8e8] border border-[#fbd5d5] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-950/60 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#e02424] dark:text-rose-300" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
