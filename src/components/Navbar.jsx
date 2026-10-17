// client/src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import { Avatar, Badge, Button } from './ui/shadcn';
import {
  Building2,
  Search,
  Heart,
  Shield,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/chat/conversations');
        const total = data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch {
        // Silent fail on poll
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 6000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const isOwner = user && (user.role === 'owner' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';
  const isTenantOrGuest = !user || user.role === 'user';
  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;

  return (
    <nav className="bg-[#0a0b0d]/95 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-40 transition-colors py-[4px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between relative">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center flex-shrink-0">
          <Link to={user?.role === 'owner' ? '/owner/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition border ${
                isDark
                  ? 'bg-neutral-900 border-[#d8cdbf]/30 group-hover:border-[#d8cdbf]/70 text-[#f5efe6]'
                  : 'bg-[#f3ede2] border-[#d8cdbf] group-hover:border-neutral-900 text-neutral-950'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-extrabold tracking-tight transition ${
                    isDark ? 'text-white group-hover:text-[#f5efe6]' : 'text-neutral-950 group-hover:text-neutral-700'
                  }`}
                >
                  Room Radar
                </span>
                <Badge variant="default" className="hidden sm:inline-flex text-[10px] px-2 py-0 bg-[#f5efe6]/10 text-[#f5efe6] border-[#f5efe6]/25">
                  <Sparkles className="w-2.5 h-2.5 text-[#f5efe6]" /> 0% Broker
                </Badge>
              </div>
              <span className="text-[10px] text-neutral-400 -mt-0.5 hidden sm:block">
                Direct Owner to User Room Rentals
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Middle of Navbar: "Available rooms" (for Tenants/Guests) OR "Owner Panel" (for Owners) */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          {isTenantOrGuest && (
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                isActive('/')
                  ? isDark
                    ? 'bg-[#f5efe6] text-neutral-950 border-[#d8cdbf] shadow-sm'
                    : 'bg-[#121316] text-[#f5efe6] border-neutral-900 shadow-sm'
                  : isDark
                  ? 'text-neutral-300 hover:text-white hover:bg-neutral-900/90 border-transparent'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] border-transparent'
              }`}
            >
              <Building2
                className={`w-4 h-4 ${
                  isActive('/')
                    ? isDark
                      ? 'text-neutral-950'
                      : 'text-[#f5efe6]'
                    : isDark
                    ? 'text-[#f5efe6]'
                    : 'text-neutral-900'
                }`}
              />
              <span>Available rooms</span>
            </Link>
          )}

          {isOwner && (
            <Link
              to="/owner/dashboard"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition border ${
                isActive('/owner/dashboard')
                  ? isDark
                    ? 'bg-[#f5efe6] text-neutral-950 border-[#d8cdbf] shadow-sm'
                    : 'bg-[#121316] text-[#f5efe6] border-neutral-900 shadow-sm'
                  : isDark
                  ? 'text-neutral-300 hover:text-white hover:bg-neutral-900/90 border-neutral-800'
                  : 'text-neutral-800 hover:text-neutral-950 hover:bg-[#ede5da] border-neutral-300'
              }`}
            >
              <Building2
                className={`w-4 h-4 ${
                  isActive('/owner/dashboard')
                    ? isDark
                      ? 'text-neutral-950'
                      : 'text-[#f5efe6]'
                    : 'text-emerald-500'
                }`}
              />
              <span>Owner Panel</span>
            </Link>
          )}
        </div>

        {/* Right Side of Navbar: Role-specific links & Profile */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {/* Search Rooms: Only for Tenants & Guests */}
          {isTenantOrGuest && (
            <Link
              to="/searchrooms"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                isActive('/searchrooms') || isActive('/search')
                  ? isDark
                    ? 'bg-[#f5efe6]/15 text-[#f5efe6] border-[#f5efe6]/30'
                    : 'bg-[#f5efe6] text-neutral-950 border-[#d8cdbf] shadow-xs'
                  : isDark
                  ? 'text-neutral-300 hover:text-white hover:bg-neutral-900 border-transparent'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] border-transparent'
              }`}
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span>Search Rooms</span>
            </Link>
          )}

          {/* Chat & Wishlist: Only for Logged-in Tenants */}
          {user && user.role === 'user' && (
            <>
              <Link
                to="/chat"
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                  isActive('/chat')
                    ? isDark
                      ? 'bg-[#f5efe6]/15 text-[#f5efe6] border-[#f5efe6]/30'
                      : 'bg-[#f5efe6] text-neutral-950 border-[#d8cdbf] shadow-xs'
                    : isDark
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-900 border-transparent'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-neutral-400" />
                <span>Chat</span>
                {unreadCount > 0 && (
                  <span className="ml-0.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/wishlist"
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                  isActive('/wishlist')
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : isDark
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-900 border-transparent'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] border-transparent'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                isActive('/admin/dashboard')
                  ? 'bg-amber-500/15 text-[#f5efe6] border-amber-500/30'
                  : 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10 border-transparent'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* User Profile Picture & Name ONLY (Clicking redirects to /profile) */}
          {user ? (
            <div className="pl-2 border-l border-neutral-800">
              <Link
                to="/profile"
                title="View Profile & Settings"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border transition ${
                  isActive('/profile')
                    ? isDark
                      ? 'bg-neutral-800 border-[#d8cdbf]/50 text-white shadow-sm'
                      : 'bg-[#ede5da] border-[#d8cdbf] text-neutral-950 shadow-sm'
                    : isDark
                    ? 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-200 hover:text-white'
                    : 'bg-[#f4eee5] border-[#d8cdbf]/70 hover:bg-[#ede5da] text-neutral-800'
                }`}
              >
                <Avatar
                  src={user.profilePic}
                  name={user.name}
                  size="sm"
                  className="w-8 h-8 border border-neutral-700"
                />
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className={`text-[10px] capitalize font-medium ${isDark ? 'text-[#d8cdbf]' : 'text-neutral-500'}`}>
                    {user.role}
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm" className="text-xs">
                  Register Free
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-amber-300 hover:bg-neutral-850 hover:border-neutral-700'
                : 'bg-[#f4eee5] border-[#d8cdbf] text-neutral-800 hover:bg-[#ede5da]'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-800" />}
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-300 hover:bg-neutral-800 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-5 space-y-2 transition-colors ${
            isDark ? 'bg-[#0e0f13] border-neutral-800' : 'bg-white border-[#e2dbcf] shadow-md'
          }`}
        >
          {/* User Preview Link in Mobile */}
          {user && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border mb-3 transition ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-white'
                  : 'bg-[#f4eee5] border-[#d8cdbf] hover:bg-[#ede5da] text-neutral-950'
              }`}
            >
              <Avatar
                src={user.profilePic}
                name={user.name}
                size="sm"
                className="w-9 h-9 border border-neutral-700"
              />
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className={`text-[11px] capitalize font-medium ${isDark ? 'text-[#d8cdbf]' : 'text-neutral-500'}`}>
                  {user.role} • Tap to view profile
                </p>
              </div>
            </Link>
          )}

          {/* Available Rooms Link - Only for Tenants & Guests */}
          {isTenantOrGuest && (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/')
                  ? isDark
                    ? 'bg-[#f5efe6] text-neutral-950 font-bold'
                    : 'bg-[#121316] text-[#f5efe6] font-bold'
                  : isDark
                  ? 'text-neutral-200 hover:bg-neutral-850'
                  : 'text-neutral-800 hover:bg-[#ede5da]'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isActive('/') ? (isDark ? 'text-neutral-950' : 'text-[#f5efe6]') : (isDark ? 'text-[#d8cdbf]' : 'text-neutral-900')}`} />
              <span>Available rooms</span>
            </Link>
          )}

          {/* Search Rooms Link - Only for Tenants & Guests */}
          {isTenantOrGuest && (
            <Link
              to="/searchrooms"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/searchrooms') || isActive('/search')
                  ? isDark
                    ? 'bg-[#f5efe6]/15 text-[#f5efe6] border border-[#f5efe6]/30'
                    : 'bg-[#f5efe6] text-neutral-950 border border-[#d8cdbf] font-bold'
                  : isDark
                  ? 'text-neutral-200 hover:bg-neutral-850'
                  : 'text-neutral-800 hover:bg-[#ede5da]'
              }`}
            >
              <Search className="w-4 h-4 text-[#d8cdbf]" />
              <span>Search Rooms</span>
            </Link>
          )}

          {/* Chat & Wishlist - Only for Logged-in Tenants */}
          {user && user.role === 'user' && (
            <>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  isDark ? 'text-neutral-200 hover:bg-neutral-850' : 'text-neutral-800 hover:bg-[#ede5da]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#d8cdbf]" /> Chat
                </span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} new</Badge>
                )}
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  isDark ? 'text-neutral-200 hover:bg-neutral-850' : 'text-neutral-800 hover:bg-[#ede5da]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-400" /> Wishlist
                </span>
                {wishlistCount > 0 && (
                  <Badge variant="destructive">{wishlistCount}</Badge>
                )}
              </Link>
            </>
          )}

          {/* Owner Panel - Only for Owners */}
          {isOwner && (
            <Link
              to="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bold transition ${
                isActive('/owner/dashboard')
                  ? isDark
                    ? 'bg-[#f5efe6] text-neutral-950 font-bold'
                    : 'bg-[#121316] text-[#f5efe6] font-bold'
                  : isDark
                  ? 'text-neutral-200 hover:bg-neutral-850'
                  : 'text-neutral-800 hover:bg-[#ede5da]'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Owner Panel</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-amber-300 hover:bg-neutral-850"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {user && (
            <div className="pt-2 border-t border-neutral-800">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs font-semibold cursor-pointer"
              >
                Sign Out
              </Button>
            </div>
          )}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 border-t border-neutral-850 dark:border-neutral-800 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Theme Appearance
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-amber-300'
                  : 'bg-[#f4eee5] border-[#d8cdbf] text-neutral-800'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-neutral-800" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}