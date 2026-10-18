// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Avatar, Badge, Button, Card, Dialog, Input, Label } from '../components/ui/shadcn';
import AdminSidebar from '../components/admin/AdminSidebar';
import {
  Check,
  X,
  Users,
  Building2,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  RefreshCw,
  Eye,
  CreditCard,
  FileText,
  Landmark,
  Phone,
  Mail,
  MapPin,
  Zap,
  Trash2,
  Search,
  Shield,
  Settings,
  Upload,
  Menu,
  Sparkles,
  BarChart3,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard({ defaultTab = 'rooms' }) {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL or defaultTab prop
  const getTabFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/stats')) return 'stats';
    if (path.includes('/admin/settings')) return 'settings';
    if (path.includes('/admin/rooms')) return 'rooms';
    return defaultTab || 'rooms';
  };

  const [mainTab, setMainTab] = useState(getTabFromPath());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'owner' | 'user'
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Full Profile / KYC Inspector Modal state
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Admin Self Profile / Credentials state
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    profilePic: user?.profilePic || '',
  });
  const [uploadingAdminPic, setUploadingAdminPic] = useState(false);
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });

  // Sync tab with URL
  useEffect(() => {
    setMainTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setMainTab(tabId);
    navigate(`/admin/${tabId}`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, roomsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get(`/admin/rooms${filterStatus ? `?status=${filterStatus}` : ''}`),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus]);

  // Sync admin form with auth user
  useEffect(() => {
    if (user) {
      setAdminForm((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePic: user.profilePic || '',
      }));
    }
  }, [user]);

  const openAdminSettings = () => {
    setAdminForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      phone: user?.phone || '',
      profilePic: user?.profilePic || '',
    });
    setShowAdminProfileModal(true);
  };

  const handleAdminPicUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingAdminPic(true);
      const fd = new FormData();
      fd.append('images', file);
      const { data } = await API.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.url || data.imageUrls?.[0];
      if (url) {
        setAdminForm((prev) => ({ ...prev, profilePic: url }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAdminPic(false);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    setAdminMsg({ type: '', text: '' });
    try {
      const payload = {
        name: adminForm.name,
        email: adminForm.email,
        phone: adminForm.phone,
        profilePic: adminForm.profilePic,
      };
      if (adminForm.password && adminForm.password.trim().length > 0) {
        payload.password = adminForm.password.trim();
      }
      await updateProfile(payload);
      setShowAdminProfileModal(false);
      setAdminMsg({ type: 'success', text: 'Admin credentials & profile updated successfully!' });
      fetchDashboardData();
    } catch (err) {
      setAdminMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update admin profile',
      });
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const handleStatusUpdate = async (roomId, newStatus) => {
    let rejectionReason = '';
    if (newStatus === 'rejected') {
      rejectionReason =
        window.prompt(
          'Optional: Enter reason for rejecting this room listing:',
          'Incomplete details or unverified photos'
        ) || 'Rejected by Admin';
    }

    try {
      const { data } = await API.patch(`/admin/rooms/${roomId}/status`, {
        status: newStatus,
        rejectionReason,
      });

      setRooms((prev) =>
        filterStatus && filterStatus !== newStatus
          ? prev.filter((r) => r._id !== roomId)
          : prev.map((r) => (r._id === roomId ? data.room : r))
      );

      if (selectedProfile) {
        setSelectedProfile((prev) => ({
          ...prev,
          rooms: (prev.rooms || []).map((r) =>
            r._id === roomId ? { ...r, status: newStatus, rejectionReason } : r
          ),
        }));
      }

      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to permanently delete this room?')) return;
    try {
      await API.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      const statsRes = await API.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const inspectUserProfile = async (userId) => {
    if (!userId) return;
    try {
      setProfileLoading(true);
      const { data } = await API.get(`/admin/users/${userId}`);
      setSelectedProfile(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this account and all associated rooms?'
      )
    )
      return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (selectedProfile?._id === userId) {
        setSelectedProfile(null);
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const roleMatch =
      userRoleFilter === 'all' ? true : u.role === userRoleFilter;
    const q = userSearch.trim().toLowerCase();
    const searchMatch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.aadharDetails?.number?.toLowerCase().includes(q) ||
      u.panDetails?.number?.toLowerCase().includes(q);
    return roleMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#f9f6f0] dark:bg-[#0a0b0d] text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Left Navigation Bar - Exactly matches OwnerSidebar */}
      <AdminSidebar
        activeTab={mainTab}
        setActiveTab={handleTabChange}
        counts={{
          pendingRooms: stats?.pendingRooms || 0,
          totalUsers: users.length || 0,
          totalRooms: stats?.totalRooms || 0,
        }}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenSettings={() => handleTabChange('settings')}
      />

      {/* Main Content Area (offset by left navbar width on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Mobile Top Header with Hamburger Toggle */}
        <div className="lg:hidden bg-white dark:bg-[#0d0e12] border-b border-[#e2dbcf] dark:border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              aria-label="Open Admin Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">Admin Control</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Super Admin
              </span>
            </div>
          </div>

          <span className="text-xs font-bold capitalize text-neutral-600 dark:text-neutral-400">
            {mainTab}
          </span>
        </div>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Banner Header */}
          <div className="bg-white dark:bg-[#111217] border border-[#e2dbcf] dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar
                src={user?.profilePic}
                name={user?.name || 'Admin'}
                size="lg"
                className="border-2 border-amber-500/50 flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white">
                    Super Admin Control Center
                  </h1>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">
                  Logged in as <strong className="text-neutral-950 dark:text-white">{user?.name}</strong> ({user?.email}) • Verify listings, inspect KYC & bank profiles, and oversee users.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
              </Button>
              <Button variant="warning" size="sm" onClick={() => navigate('/profile?section=edit-profile')}>
                <Settings className="w-3.5 h-3.5" /> Edit Credentials
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card
                onClick={() => {
                  handleTabChange('users');
                  setUserRoleFilter('user');
                }}
                className="p-3.5 cursor-pointer hover:border-sky-500/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-7 h-7 text-sky-600 dark:text-sky-400 p-1.5 bg-sky-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Total Users</p>
                    <p className="text-xl font-extrabold text-neutral-950 dark:text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => {
                  handleTabChange('users');
                  setUserRoleFilter('owner');
                }}
                className="p-3.5 cursor-pointer hover:border-indigo-500/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400 p-1.5 bg-indigo-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Total Owners</p>
                    <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {stats.totalOwners}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => {
                  handleTabChange('rooms');
                  setFilterStatus('pending');
                }}
                className="p-3.5 cursor-pointer hover:border-amber-500/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400 p-1.5 bg-amber-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Pending</p>
                    <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                      {stats.pendingRooms}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => {
                  handleTabChange('rooms');
                  setFilterStatus('approved');
                }}
                className="p-3.5 cursor-pointer hover:border-emerald-500/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Accepted</p>
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {stats.approvedRooms}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => {
                  handleTabChange('rooms');
                  setFilterStatus('rejected');
                }}
                className="p-3.5 cursor-pointer hover:border-rose-500/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 p-1.5 bg-rose-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Rejected</p>
                    <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                      {stats.rejectedRooms || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => {
                  handleTabChange('rooms');
                  setFilterStatus('');
                }}
                className="p-3.5 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-7 h-7 text-purple-600 dark:text-purple-400 p-1.5 bg-purple-500/10 rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">All Rooms</p>
                    <p className="text-xl font-extrabold text-neutral-950 dark:text-white">{stats.totalRooms}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 1: ROOMS VERIFICATION QUEUE */}
          {mainTab === 'rooms' && (
            <div className="space-y-5">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111217] border border-[#e2dbcf] dark:border-neutral-800 p-3 rounded-2xl shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mr-1 pl-1">
                    Filter Queue:
                  </span>
                  {[
                    { key: 'pending', label: `Pending Approval (${stats?.pendingRooms || 0})` },
                    { key: 'approved', label: `Accepted / Live (${stats?.approvedRooms || 0})` },
                    { key: 'rejected', label: `Rejected (${stats?.rejectedRooms || 0})` },
                    { key: '', label: `All Rooms (${stats?.totalRooms || 0})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterStatus(tab.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        filterStatus === tab.key
                          ? 'bg-neutral-950 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                          : 'bg-[#f8f5ee] hover:bg-[#ede5da] text-neutral-800 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-neutral-200 border border-[#e2dbcf] dark:border-neutral-750'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  Showing <strong className="text-neutral-950 dark:text-white">{rooms.length}</strong> listings
                </div>
              </div>

              {/* Rooms Grid */}
              {loading ? (
                <div className="text-center py-16 bg-white dark:bg-[#111217] border border-[#e2dbcf] dark:border-neutral-800 rounded-2xl">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Loading room listings...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#111217] border border-[#e2dbcf] dark:border-neutral-800 rounded-2xl space-y-2">
                  <Home className="w-10 h-10 text-neutral-400 mx-auto mb-2 opacity-50" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">No rooms in this queue</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    There are no room listings matching the "{filterStatus || 'all'}" filter. Try selecting a different filter above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => {
                    const facilities =
                      room.facilities?.length > 0 ? room.facilities : room.amenities || [];
                    return (
                      <Card
                        key={room._id}
                        className="overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition"
                      >
                        <div>
                          <div className="relative h-48 bg-neutral-200 dark:bg-neutral-900">
                            <img
                              src={
                                room.images?.[0] ||
                                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={room.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-neutral-950 font-black text-xs shadow-xs">
                                {room.roomType || '1RK'}
                              </span>
                              <span className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs font-medium">
                                {room.furnishingStatus} • {room.bedConfiguration}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge
                                variant={
                                  room.status === 'approved'
                                    ? 'success'
                                    : room.status === 'rejected'
                                    ? 'destructive'
                                    : 'warning'
                                }
                              >
                                {room.status === 'approved'
                                  ? 'Accepted (Live)'
                                  : room.status === 'rejected'
                                  ? 'Rejected (Hidden)'
                                  : 'Pending Decision'}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 flex items-center">
                                <IndianRupee className="w-4 h-4" />
                                {Number(room.rent).toLocaleString('en-IN')}/mo
                              </span>
                              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5" />
                                {room.electricityIncluded
                                  ? 'Elec. Included'
                                  : `₹${room.electricityRatePerUnit || 8}/unit`}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-neutral-950 dark:text-white text-base line-clamp-1">
                                {room.title}
                              </h3>
                              <p className="text-neutral-500 dark:text-neutral-400 text-xs flex items-center gap-1 mt-1 line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                                {room.location?.address}, {room.location?.city},{' '}
                                {room.location?.state} ({room.location?.pincode})
                              </p>
                            </div>

                            <p className="text-neutral-600 dark:text-neutral-400 text-xs line-clamp-2">
                              {room.description}
                            </p>

                            {/* Suitable For & Facilities */}
                            <div className="space-y-1.5 pt-1 text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400">
                                <strong className="text-neutral-900 dark:text-neutral-200">Suitable:</strong>{' '}
                                {(room.suitableFor || ['Anyone']).join(', ')}
                              </p>
                              <p className="text-neutral-600 dark:text-neutral-400 truncate">
                                <strong className="text-neutral-900 dark:text-neutral-200">Facilities:</strong>{' '}
                                {facilities.length > 0 ? facilities.join(', ') : 'Standard'}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1">
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                    room.rules?.drinkingAllowed
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                  }`}
                                >
                                  Drinking: {room.rules?.drinkingAllowed ? 'Yes' : 'No'}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                    room.rules?.smokingAllowed
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                  }`}
                                >
                                  Smoking: {room.rules?.smokingAllowed ? 'Yes' : 'No'}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                    room.rules?.lateNightAllowed
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                  }`}
                                >
                                  Late Night: {room.rules?.lateNightAllowed ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>

                            {/* Owner Info Box */}
                            <div className="mt-3 pt-3 border-t border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar
                                  src={room.owner?.profilePic}
                                  name={room.owner?.name || 'O'}
                                  size="sm"
                                  className="flex-shrink-0"
                                />
                                <div className="text-xs min-w-0">
                                  <p className="font-bold text-neutral-900 dark:text-white truncate">
                                    {room.owner?.name || 'Owner'}
                                  </p>
                                  <p className="text-neutral-500 dark:text-neutral-400 truncate">
                                    {room.owner?.phone || room.owner?.email}
                                  </p>
                                </div>
                              </div>
                              {room.owner?._id && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => inspectUserProfile(room.owner._id)}
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-500" /> Owner KYC
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Accept / Reject Action Controls */}
                        <div className="p-4 pt-3 border-t border-[#e2dbcf] dark:border-neutral-800 flex items-center gap-2 bg-[#f8f5ee]/70 dark:bg-[#0a0b0d]/50">
                          {room.status !== 'approved' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStatusUpdate(room._id, 'approved')}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4" /> Accept (Go Live)
                            </Button>
                          )}
                          {room.status !== 'rejected' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusUpdate(room._id, 'rejected')}
                              className="flex-1"
                            >
                              <X className="w-4 h-4" /> Reject (Hide)
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Room"
                            onClick={() => handleDeleteRoom(room._id)}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USERS & OWNERS DIRECTORY */}
          {mainTab === 'users' && (
            <div className="space-y-5">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111217] border border-[#e2dbcf] dark:border-neutral-800 p-4 rounded-2xl shadow-xs">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: `All Accounts (${users.length})` },
                    {
                      key: 'owner',
                      label: `Owners (${users.filter((u) => u.role === 'owner').length})`,
                    },
                    {
                      key: 'user',
                      label: `Tenants / Users (${users.filter((u) => u.role === 'user').length})`,
                    },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setUserRoleFilter(t.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        userRoleFilter === t.key
                          ? 'bg-neutral-950 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                          : 'bg-[#f8f5ee] hover:bg-[#ede5da] text-neutral-700 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-neutral-300 border border-[#e2dbcf] dark:border-neutral-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <Input
                    placeholder="Search name, email, phone, Aadhaar, PAN..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Users & Owners Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUsers.map((u) => (
                  <Card
                    key={u._id}
                    className="p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={u.profilePic} name={u.name} size="lg" className="flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-neutral-950 dark:text-white text-base truncate">
                              {u.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="w-3 h-3 text-sky-500 flex-shrink-0" /> {u.email}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                              <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />{' '}
                              {u.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'warning'
                              : u.role === 'owner'
                              ? 'purple'
                              : 'default'
                          }
                          className="capitalize flex-shrink-0"
                        >
                          {u.role}
                        </Badge>
                      </div>

                      {/* Quick Summary of KYC & Account Details */}
                      <div className="bg-[#f8f5ee] dark:bg-neutral-900/90 border border-[#e2dbcf] dark:border-neutral-800 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500 dark:text-neutral-400">Aadhaar No:</span>
                          <span className="text-neutral-900 dark:text-neutral-200 font-mono font-semibold">
                            {u.aadharDetails?.number || 'Not added'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500 dark:text-neutral-400">PAN No:</span>
                          <span className="text-neutral-900 dark:text-neutral-200 font-mono font-semibold">
                            {u.panDetails?.number || 'Not added'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500 dark:text-neutral-400">Bank A/C:</span>
                          <span className="text-neutral-900 dark:text-neutral-200 font-mono truncate max-w-[170px] text-right">
                            {u.accountDetails?.accountNumber
                              ? `${u.accountDetails.bankName || 'Bank'} • ${u.accountDetails.accountNumber}`
                              : 'Not added'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#e2dbcf] dark:border-neutral-800 pt-1.5">
                          <span className="text-neutral-500 dark:text-neutral-400">Rooms Posted:</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {u.postedRoomsCount || 0} total ({u.approvedRoomsCount || 0} live, {u.pendingRoomsCount || 0} pending)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#e2dbcf] dark:border-neutral-800">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => inspectUserProfile(u._id)}
                        className="flex-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Profile & KYC
                      </Button>
                      {u.role !== 'admin' && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PLATFORM ANALYTICS & STATS */}
          {mainTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      User Base
                    </span>
                    <Users className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-neutral-950 dark:text-white">
                      {stats?.totalUsers || 0}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Registered tenants and room seekers looking for verified spaces.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      handleTabChange('users');
                      setUserRoleFilter('user');
                    }}
                  >
                    View Tenants Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Property Landlords
                    </span>
                    <Building2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {stats?.totalOwners || 0}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Verified property owners publishing listings with zero brokerage.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      handleTabChange('users');
                      setUserRoleFilter('owner');
                    }}
                  >
                    View Landlords Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Pending Approvals
                    </span>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {stats?.pendingRooms || 0}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Room listings submitted by owners waiting for your verification decision.
                    </p>
                  </div>
                  <Button
                    variant="warning"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      handleTabChange('rooms');
                      setFilterStatus('pending');
                    }}
                  >
                    Review Queue Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Card>
              </div>

              {/* Listings Health Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                  <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" /> Listing Status Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Live / Accepted Rooms
                      </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {stats?.approvedRooms || 0}
                      </strong>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${
                            stats?.totalRooms
                              ? ((stats.approvedRooms || 0) / stats.totalRooms) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Pending Inspection
                      </span>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">
                        {stats?.pendingRooms || 0}
                      </strong>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full"
                        style={{
                          width: `${
                            stats?.totalRooms
                              ? ((stats.pendingRooms || 0) / stats.totalRooms) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
                        <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Rejected / Hidden
                      </span>
                      <strong className="text-rose-600 dark:text-rose-400 font-bold">
                        {stats?.rejectedRooms || 0}
                      </strong>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full"
                        style={{
                          width: `${
                            stats?.totalRooms
                              ? ((stats.rejectedRooms || 0) / stats.totalRooms) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" /> Super Admin Security Guidelines
                  </h3>
                  <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>
                      • Always verify that the owner has uploaded a valid government ID (Aadhaar or PAN) before approving high-rent rooms.
                    </p>
                    <p>
                      • Inspect room photos for accurate dimensions, natural lighting, and verify that contact phone numbers match genuine landlords.
                    </p>
                    <p>
                      • When rejecting rooms, supply a constructive rejection reason so landlords can correct their listing details and re-apply.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN PROFILE & CREDENTIALS SETTINGS */}
          {mainTab === 'settings' && (
            <Card className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 border-b border-[#e2dbcf] dark:border-neutral-800 pb-4">
                <Shield className="w-6 h-6 text-amber-500" />
                <div>
                  <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">
                    Super Admin Profile & Security
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Update your administrative login credentials, name, phone, and avatar.
                  </p>
                </div>
              </div>

              {adminMsg.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    adminMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {adminMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveAdminProfile} className="space-y-5 text-sm">
                <div className="flex items-center gap-4 pb-4 border-b border-[#e2dbcf] dark:border-neutral-800">
                  <Avatar
                    src={adminForm.profilePic}
                    name={adminForm.name || 'Admin'}
                    size="xl"
                    className="border-2 border-amber-500/50 flex-shrink-0"
                  />
                  <div>
                    <Label>Admin Profile Picture</Label>
                    <label className="mt-1 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f8f5ee] hover:bg-[#ede5da] dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-[#e2dbcf] dark:border-neutral-800 text-xs font-bold cursor-pointer transition">
                      <Upload className="w-4 h-4 text-amber-500" />
                      {uploadingAdminPic ? 'Uploading...' : 'Upload New Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAdminPicUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Admin Full Name *</Label>
                  <Input
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Admin Login Email (User ID) *</Label>
                  <Input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Admin Contact Phone</Label>
                  <Input
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label>New Admin Password (leave blank to keep current)</Label>
                  <Input
                    type="password"
                    minLength={6}
                    placeholder="Enter new password (min 6 characters)"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={savingAdminProfile || uploadingAdminPic}
                  >
                    {savingAdminProfile ? 'Saving...' : 'Save Admin Credentials'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </main>
      </div>

      {/* ADMIN SELF PROFILE & CREDENTIALS EDIT MODAL */}
      <Dialog
        open={showAdminProfileModal}
        onClose={() => setShowAdminProfileModal(false)}
        title="Edit Admin Profile & Credentials"
        subtitle="Update Super Admin Name, Email, Password, and Profile Picture"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-sm">
          <div className="flex items-center gap-4 pb-3 border-b border-[#e2dbcf] dark:border-neutral-800">
            <Avatar src={adminForm.profilePic} name={adminForm.name || 'Admin'} size="xl" />
            <div>
              <Label>Admin Profile Picture</Label>
              <label className="mt-1 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f8f5ee] hover:bg-[#ede5da] dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-[#e2dbcf] dark:border-neutral-800 text-xs font-bold cursor-pointer transition">
                <Upload className="w-4 h-4 text-amber-500" />
                {uploadingAdminPic ? 'Uploading...' : 'Upload New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAdminPicUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <Label>Admin Name *</Label>
            <Input
              required
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Admin Email (Login User ID) *</Label>
            <Input
              type="email"
              required
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Admin Phone Number</Label>
            <Input
              value={adminForm.phone}
              onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>New Admin Password (leave blank to keep current)</Label>
            <Input
              type="password"
              minLength={6}
              placeholder="Enter new password (min 6 characters)"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2dbcf] dark:border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdminProfileModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="warning"
              disabled={savingAdminProfile || uploadingAdminPic}
            >
              {savingAdminProfile ? 'Saving...' : 'Save Admin Credentials'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DETAILED USER / OWNER PROFILE & KYC INSPECTOR MODAL */}
      <Dialog
        open={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
        title={
          selectedProfile
            ? `${selectedProfile.name} — Complete Profile & KYC Inspector`
            : 'Profile Details'
        }
        subtitle="Identity verification, Aadhaar, PAN, Bank Account details, and all rooms posted"
        maxWidth="max-w-4xl"
      >
        {profileLoading || !selectedProfile ? (
          <p className="text-center py-10 text-neutral-500">Loading full profile...</p>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Top Identity Banner */}
            <div className="bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedProfile.profilePic}
                  name={selectedProfile.name}
                  size="xl"
                  className="flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                      {selectedProfile.name}
                    </h3>
                    <Badge variant="purple" className="uppercase">
                      {selectedProfile.role}
                    </Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" /> {selectedProfile.email}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />{' '}
                    {selectedProfile.phone || 'No phone number provided'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Joined:{' '}
                    {selectedProfile.createdAt
                      ? new Date(selectedProfile.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedProfile.profilePic && (
                <a
                  href={selectedProfile.profilePic}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  Open Original Profile Photo ↗
                </a>
              )}
            </div>

            {/* KYC Details: Aadhaar & PAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Aadhaar Card Details
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Aadhaar Number:{' '}
                  <strong className="text-neutral-950 dark:text-white font-mono text-sm">
                    {selectedProfile.aadharDetails?.number || 'Not submitted'}
                  </strong>
                </p>
                {selectedProfile.aadharDetails?.documentUrl ? (
                  <div className="space-y-1.5">
                    <img
                      src={selectedProfile.aadharDetails.documentUrl}
                      alt="Aadhaar Document"
                      className="w-full h-36 object-cover rounded-lg border border-[#e2dbcf] dark:border-neutral-800"
                    />
                    <a
                      href={selectedProfile.aadharDetails.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-block"
                    >
                      View Full Aadhaar Document ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    No Aadhaar photo uploaded yet.
                  </p>
                )}
              </div>

              <div className="bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> PAN Card Details
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  PAN Number:{' '}
                  <strong className="text-neutral-950 dark:text-white font-mono text-sm">
                    {selectedProfile.panDetails?.number || 'Not submitted'}
                  </strong>
                </p>
                {selectedProfile.panDetails?.documentUrl ? (
                  <div className="space-y-1.5">
                    <img
                      src={selectedProfile.panDetails.documentUrl}
                      alt="PAN Document"
                      className="w-full h-36 object-cover rounded-lg border border-[#e2dbcf] dark:border-neutral-800"
                    />
                    <a
                      href={selectedProfile.panDetails.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-block"
                    >
                      View Full PAN Document ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    No PAN photo uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4" /> Bank Account & Payout Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Account Holder</p>
                  <p className="font-semibold text-neutral-950 dark:text-white mt-0.5">
                    {selectedProfile.accountDetails?.accountHolderName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Bank Name</p>
                  <p className="font-semibold text-neutral-950 dark:text-white mt-0.5">
                    {selectedProfile.accountDetails?.bankName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Account Number</p>
                  <p className="font-semibold text-neutral-950 dark:text-white font-mono mt-0.5">
                    {selectedProfile.accountDetails?.accountNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">IFSC Code</p>
                  <p className="font-semibold text-neutral-950 dark:text-white font-mono mt-0.5">
                    {selectedProfile.accountDetails?.ifscCode || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">UPI ID</p>
                  <p className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    {selectedProfile.accountDetails?.upiId || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* All Rooms Posted by this Owner */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-500" />
                All Rooms Posted by {selectedProfile.name} ({selectedProfile.rooms?.length || 0})
              </h4>

              {!selectedProfile.rooms || selectedProfile.rooms.length === 0 ? (
                <p className="text-xs text-neutral-500 bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-4 rounded-xl">
                  This account has not posted any rooms.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.rooms.map((r) => (
                    <div
                      key={r._id}
                      className="bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                            {r.roomType || '1RK'} • ₹{r.rent}/mo
                          </span>
                          <Badge
                            variant={
                              r.status === 'approved'
                                ? 'success'
                                : r.status === 'rejected'
                                ? 'destructive'
                                : 'warning'
                            }
                          >
                            {r.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-neutral-950 dark:text-white text-sm">{r.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {r.location?.address}, {r.location?.city}, {r.location?.state}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {r.furnishingStatus} ({r.bedConfiguration}) •{' '}
                          {r.electricityIncluded
                            ? 'Elec. Included'
                            : `₹${r.electricityRatePerUnit || 8}/unit`}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#e2dbcf] dark:border-neutral-800">
                        {r.status !== 'approved' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStatusUpdate(r._id, 'approved')}
                            className="flex-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(r._id, 'rejected')}
                            className="flex-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}