// client/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PlusCircle, Shield, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-sky-400">
          <Home className="w-6 h-6" />
          Room Radar
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
            Explore Rooms
          </Link>

          {user && (user.role === 'owner' || user.role === 'admin') && (
            <Link
              to="/owner/dashboard"
              className="flex items-center gap-1 text-slate-300 hover:text-white px-3 py-2 text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Owner Panel
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 px-3 py-2 text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-sky-400" />
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-3 py-1.5 rounded transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}