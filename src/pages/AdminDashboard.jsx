// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Check, 
  X, 
  Users, 
  Home, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  Plus, 
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amenities: '',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, roomsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get(`/admin/rooms${filterStatus ? `?status=${filterStatus}` : ''}`),
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus]);

  const handleStatusUpdate = async (roomId, newStatus) => {
    try {
      await API.patch(`/admin/rooms/${roomId}/status`, { status: newStatus });
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r))
      );
      const statsRes = await API.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update room status');
    }
  };

  const handleAdminCreateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let uploadedUrls = [];

      // Upload selected files to Cloudinary via backend
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadFormData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          uploadFormData.append('images', selectedFiles[i]);
        }

        const { data: uploadRes } = await API.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls = uploadRes.imageUrls;
        setUploading(false);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        rent: Number(formData.rent),
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        images: uploadedUrls,
      };

      await API.post('/rooms', payload);
      setShowAddModal(false);
      setSelectedFiles([]);
      setFormData({
        title: '',
        description: '',
        rent: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        amenities: '',
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish room listing');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Admin Control Center</h1>
          <p className="text-slate-400 text-sm">Review incoming listings and oversee platform activity</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" /> Post Own Room
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400 p-1.5 bg-amber-400/10 rounded-lg" />
            <div>
              <p className="text-xs text-slate-400">Pending Review</p>
              <p className="text-xl font-bold">{stats.pendingRooms}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-400/10 rounded-lg" />
            <div>
              <p className="text-xs text-slate-400">Approved Rooms</p>
              <p className="text-xl font-bold">{stats.approvedRooms}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Home className="w-8 h-8 text-sky-400 p-1.5 bg-sky-400/10 rounded-lg" />
            <div>
              <p className="text-xs text-slate-400">Total Listings</p>
              <p className="text-xl font-bold">{stats.totalRooms}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400 p-1.5 bg-indigo-400/10 rounded-lg" />
            <div>
              <p className="text-xs text-slate-400">Total Users</p>
              <p className="text-xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['pending', 'approved', 'rejected', ''].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filterStatus === tab
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab === '' ? 'All Listings' : tab}
          </button>
        ))}
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <p className="text-slate-400 py-12 text-center">Loading listings...</p>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">No rooms found under this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-sky-400 flex items-center">
                    <IndianRupee className="w-4 h-4" /> {room.rent}/mo
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded capitalize ${
                      room.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : room.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <h3 className="font-semibold text-white text-base">{room.title}</h3>
                <p className="text-slate-400 text-xs mt-1">
                  {room.location.address}, {room.location.city}, {room.location.state}
                </p>
                <p className="text-slate-300 text-xs mt-3 line-clamp-2">{room.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <p>
                    <strong className="text-slate-300">Owner:</strong> {room.owner?.name}
                  </p>
                  <p>
                    <strong className="text-slate-300">Email:</strong> {room.owner?.email}
                  </p>
                  <p>
                    <strong className="text-slate-300">Phone:</strong> {room.owner?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
                {room.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(room._id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded-lg transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {room.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(room._id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-xs py-2 rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Direct Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1 text-amber-400">Post Room (As Admin)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Rooms created from this panel are published and approved automatically.
            </p>

            <form onSubmit={handleAdminCreateRoom} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Room Title</label>
                <input
                  required
                  placeholder="e.g. Luxury Studio Apartment"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of the listing..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Monthly Rent (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="12000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Address</label>
                  <input
                    required
                    placeholder="Street / Flat No"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">City</label>
                  <input
                    required
                    placeholder="City"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">State</label>
                  <input
                    required
                    placeholder="State"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Pincode</label>
                  <input
                    required
                    placeholder="Pincode"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Amenities (comma-separated)</label>
                <input
                  placeholder="Geyser, Balcony, Modular Kitchen, Power Backup"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              {/* Direct File Selector */}
              <div>
                <label className="block text-slate-300 mb-1">Upload Room Photos (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer bg-slate-800 border border-slate-700 rounded-lg p-1.5"
                />
                {uploading && (
                  <p className="text-xs text-amber-400 mt-1 animate-pulse">Uploading photos to Cloudinary...</p>
                )}
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">{selectedFiles.length} file(s) selected</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-sm font-semibold"
                >
                  {submitting ? 'Publishing...' : 'Publish Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}