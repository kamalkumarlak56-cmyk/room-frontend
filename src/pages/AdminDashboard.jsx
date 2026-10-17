// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Avatar, Badge, Button, Card, Dialog, Input, Label } from '../components/ui/shadcn';
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
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [mainTab, setMainTab] = useState('rooms'); // 'rooms' | 'users'
  const [filterStatus, setFilterStatus] = useState('pending');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'owner' | 'user'
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Full Profile / KYC Inspector Modal state
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Admin Self Profile / Credentials Modal state
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, roomsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get(`/admin/rooms${filterStatus ? `?status=${filterStatus}` : ''}`),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus]);

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
      fetchDashboardData();
      alert('Admin credentials & profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admin profile');
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
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <Avatar src={user?.profilePic} name={user?.name || 'Admin'} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                Super Admin Control Center
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email}) • Monitor users & owners, inspect KYC/Bank profiles, and accept or reject rooms.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button variant="warning" onClick={openAdminSettings}>
            <Settings className="w-4 h-4" /> Edit Admin Profile & Password
          </Button>
        </div>
      </div>

      {/* Metrics Row (Users count, Owners count, Pending/Approved/Rejected Rooms) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card
            onClick={() => {
              setMainTab('users');
              setUserRoleFilter('user');
            }}
            className="p-4 cursor-pointer hover:border-sky-500/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-8 h-8 text-sky-400 p-1.5 bg-sky-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">Total Users</p>
                <p className="text-2xl font-extrabold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => {
              setMainTab('users');
              setUserRoleFilter('owner');
            }}
            className="p-4 cursor-pointer hover:border-indigo-500/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-8 h-8 text-indigo-400 p-1.5 bg-indigo-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">Total Owners</p>
                <p className="text-2xl font-extrabold text-indigo-400">
                  {stats.totalOwners}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => {
              setMainTab('rooms');
              setFilterStatus('pending');
            }}
            className="p-4 cursor-pointer hover:border-amber-500/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-8 h-8 text-amber-400 p-1.5 bg-amber-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">Pending Rooms</p>
                <p className="text-2xl font-extrabold text-amber-400">
                  {stats.pendingRooms}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => {
              setMainTab('rooms');
              setFilterStatus('approved');
            }}
            className="p-4 cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">Accepted Rooms</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {stats.approvedRooms}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => {
              setMainTab('rooms');
              setFilterStatus('rejected');
            }}
            className="p-4 cursor-pointer hover:border-rose-500/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <XCircle className="w-8 h-8 text-rose-400 p-1.5 bg-rose-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">Rejected Rooms</p>
                <p className="text-2xl font-extrabold text-rose-400">
                  {stats.rejectedRooms || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => {
              setMainTab('rooms');
              setFilterStatus('');
            }}
            className="p-4 cursor-pointer hover:border-slate-600 transition"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-8 h-8 text-purple-400 p-1.5 bg-purple-400/10 rounded-lg" />
              <div>
                <p className="text-[11px] text-slate-400">All Listings</p>
                <p className="text-2xl font-extrabold text-white">{stats.totalRooms}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          <Button
            variant={mainTab === 'rooms' ? 'warning' : 'secondary'}
            onClick={() => setMainTab('rooms')}
          >
            <Home className="w-4 h-4" /> Room Verification Queue (
            {stats?.pendingRooms || 0} Pending)
          </Button>
          <Button
            variant={mainTab === 'users' ? 'warning' : 'secondary'}
            onClick={() => setMainTab('users')}
          >
            <Users className="w-4 h-4" /> Users & Owners Directory ({users.length})
          </Button>
        </div>

        {mainTab === 'rooms' && (
          <div className="flex items-center gap-2">
            {[
              { key: 'pending', label: 'Pending Approval' },
              { key: 'approved', label: 'Accepted (Live)' },
              { key: 'rejected', label: 'Rejected (Hidden)' },
              { key: '', label: 'All Rooms' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: ROOMS APPROVAL / REJECTION */}
      {mainTab === 'rooms' && (
        <>
          {loading ? (
            <p className="text-slate-400 py-12 text-center">Loading room listings...</p>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400">No rooms found under this status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const facilities =
                  room.facilities?.length > 0 ? room.facilities : room.amenities || [];
                return (
                  <Card
                    key={room._id}
                    className="overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-950">
                        <img
                          src={
                            room.images?.[0] ||
                            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs">
                            {room.roomType || '1RK'}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-slate-900/90 text-slate-200 text-xs">
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
                              ? 'Accepted (Shown to Users)'
                              : room.status === 'rejected'
                              ? 'Rejected (Hidden)'
                              : 'Pending Admin Decision'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-extrabold text-sky-400 flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {Number(room.rent).toLocaleString('en-IN')}/mo
                          </span>
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            {room.electricityIncluded
                              ? 'Elec. Included'
                              : `₹${room.electricityRatePerUnit || 8}/unit`}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base">{room.title}</h3>
                          <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            {room.location?.address}, {room.location?.city},{' '}
                            {room.location?.state} ({room.location?.pincode})
                          </p>
                        </div>

                        <p className="text-slate-300 text-xs line-clamp-2">
                          {room.description}
                        </p>

                        {/* Suitable For & Facilities */}
                        <div className="space-y-1.5 pt-1 text-xs">
                          <p className="text-slate-400">
                            <strong className="text-slate-200">Suitable For:</strong>{' '}
                            {(room.suitableFor || ['Anyone']).join(', ')}
                          </p>
                          <p className="text-slate-400">
                            <strong className="text-slate-200">Facilities:</strong>{' '}
                            {facilities.length > 0 ? facilities.join(', ') : 'Basic'}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded ${
                                room.rules?.drinkingAllowed
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Drinking: {room.rules?.drinkingAllowed ? 'Allowed' : 'No'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded ${
                                room.rules?.smokingAllowed
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Smoking: {room.rules?.smokingAllowed ? 'Allowed' : 'No'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded ${
                                room.rules?.lateNightAllowed
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Late Night: {room.rules?.lateNightAllowed ? 'Allowed' : 'No'}
                            </span>
                          </div>
                        </div>

                        {/* Owner Info Box */}
                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar
                              src={room.owner?.profilePic}
                              name={room.owner?.name || 'O'}
                              size="sm"
                            />
                            <div className="text-xs min-w-0">
                              <p className="font-semibold text-white truncate">
                                {room.owner?.name || 'Owner'}
                              </p>
                              <p className="text-slate-400 truncate">
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
                              <Eye className="w-3.5 h-3.5 text-amber-400" /> Owner KYC
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Accept / Reject Action Controls */}
                    <div className="p-4 pt-3 border-t border-slate-800 flex gap-2 bg-slate-950/50">
                      {room.status !== 'approved' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(room._id, 'approved')}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4" /> Accept (Show to Users)
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
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: ALL USERS & OWNERS DIRECTORY WITH FULL KYC/BANK/ROOMS INSPECTION */}
      {mainTab === 'users' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: `All Accounts (${users.length})` },
                {
                  key: 'owner',
                  label: `Owners (${
                    users.filter((u) => u.role === 'owner').length
                  })`,
                },
                {
                  key: 'user',
                  label: `Users (${
                    users.filter((u) => u.role === 'user').length
                  })`,
                },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setUserRoleFilter(t.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    userRoleFilter === t.key
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
                    <div className="flex items-center gap-3">
                      <Avatar src={u.profilePic} name={u.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-white text-base">{u.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-sky-400" /> {u.email}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" />{' '}
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
                      className="capitalize"
                    >
                      {u.role}
                    </Badge>
                  </div>

                  {/* Quick Summary of KYC & Account Details */}
                  <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aadhaar No:</span>
                      <span className="text-slate-200 font-mono">
                        {u.aadharDetails?.number || 'Not added'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAN No:</span>
                      <span className="text-slate-200 font-mono">
                        {u.panDetails?.number || 'Not added'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank A/C:</span>
                      <span className="text-slate-200 font-mono">
                        {u.accountDetails?.accountNumber
                          ? `${u.accountDetails.bankName || 'Bank'} • ${u.accountDetails.accountNumber}`
                          : 'Not added'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1.5">
                      <span className="text-slate-400">Rooms Posted:</span>
                      <span className="text-amber-400 font-bold">
                        {u.postedRoomsCount || 0} total ({u.approvedRoomsCount || 0}{' '}
                        accepted, {u.pendingRoomsCount || 0} pending)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => inspectUserProfile(u._id)}
                    className="flex-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Full Profile & Rooms
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

      {/* ADMIN SELF PROFILE & CREDENTIALS EDIT MODAL */}
      <Dialog
        open={showAdminProfileModal}
        onClose={() => setShowAdminProfileModal(false)}
        title="Edit Admin Profile, Login Email & Password"
        subtitle="Update your Super Admin Name, Email (User ID), Password, Phone, and Profile Picture"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-sm">
          <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
            <Avatar src={adminForm.profilePic} name={adminForm.name || 'Admin'} size="xl" />
            <div>
              <Label>Admin Profile Picture</Label>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium cursor-pointer transition">
                <Upload className="w-4 h-4 text-amber-400" />
                {uploadingAdminPic ? 'Uploading to Cloudinary...' : 'Upload New Photo'}
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
            <Label>New Admin Password (leave blank to keep current password)</Label>
            <Input
              type="password"
              minLength={6}
              placeholder="Enter new password (min 6 characters)"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
        subtitle="Admin view of personal identity, Aadhaar, PAN, Bank Account details, and all rooms posted"
        maxWidth="max-w-4xl"
      >
        {profileLoading || !selectedProfile ? (
          <p className="text-center py-10 text-slate-400">Loading full profile...</p>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Top Identity Banner */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedProfile.profilePic}
                  name={selectedProfile.name}
                  size="xl"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {selectedProfile.name}
                    </h3>
                    <Badge variant="purple" className="uppercase">
                      {selectedProfile.role}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" /> {selectedProfile.email}
                  </p>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />{' '}
                    {selectedProfile.phone || 'No phone number provided'}
                  </p>
                  <p className="text-[11px] text-slate-500">
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
                  className="text-xs text-sky-400 hover:underline"
                >
                  Open Original Profile Photo ↗
                </a>
              )}
            </div>

            {/* KYC Details: Aadhaar & PAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Aadhaar Card Details
                </h4>
                <p className="text-xs text-slate-400">
                  Aadhaar Number:{' '}
                  <strong className="text-white font-mono text-sm">
                    {selectedProfile.aadharDetails?.number || 'Not submitted'}
                  </strong>
                </p>
                {selectedProfile.aadharDetails?.documentUrl ? (
                  <div className="space-y-1.5">
                    <img
                      src={selectedProfile.aadharDetails.documentUrl}
                      alt="Aadhaar Document"
                      className="w-full h-36 object-cover rounded-lg border border-slate-800"
                    />
                    <a
                      href={selectedProfile.aadharDetails.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:underline inline-block"
                    >
                      View Full Aadhaar Document ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No Aadhaar photo uploaded yet.
                  </p>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> PAN Card Details
                </h4>
                <p className="text-xs text-slate-400">
                  PAN Number:{' '}
                  <strong className="text-white font-mono text-sm">
                    {selectedProfile.panDetails?.number || 'Not submitted'}
                  </strong>
                </p>
                {selectedProfile.panDetails?.documentUrl ? (
                  <div className="space-y-1.5">
                    <img
                      src={selectedProfile.panDetails.documentUrl}
                      alt="PAN Document"
                      className="w-full h-36 object-cover rounded-lg border border-slate-800"
                    />
                    <a
                      href={selectedProfile.panDetails.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:underline inline-block"
                    >
                      View Full PAN Document ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No PAN photo uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4" /> Bank Account & Payout Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Account Holder</p>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedProfile.accountDetails?.accountHolderName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Bank Name</p>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedProfile.accountDetails?.bankName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Account Number</p>
                  <p className="font-semibold text-white font-mono mt-0.5">
                    {selectedProfile.accountDetails?.accountNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">IFSC Code</p>
                  <p className="font-semibold text-white font-mono mt-0.5">
                    {selectedProfile.accountDetails?.ifscCode || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">UPI ID</p>
                  <p className="font-semibold text-sky-400 mt-0.5">
                    {selectedProfile.accountDetails?.upiId || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* All Rooms Posted by this Owner */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                All Rooms Posted by {selectedProfile.name} (
                {selectedProfile.rooms?.length || 0})
              </h4>

              {!selectedProfile.rooms || selectedProfile.rooms.length === 0 ? (
                <p className="text-xs text-slate-500 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  This account has not posted any rooms.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProfile.rooms.map((r) => (
                    <div
                      key={r._id}
                      className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-400 text-sm">
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
                        <p className="font-semibold text-white text-sm">{r.title}</p>
                        <p className="text-xs text-slate-400">
                          {r.location?.address}, {r.location?.city}, {r.location?.state}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {r.furnishingStatus} ({r.bedConfiguration}) •{' '}
                          {r.electricityIncluded
                            ? 'Elec. Included'
                            : `₹${r.electricityRatePerUnit || 8}/unit`}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
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