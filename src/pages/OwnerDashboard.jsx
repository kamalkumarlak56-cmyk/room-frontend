// client/src/pages/OwnerDashboard.jsx
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, IndianRupee, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amenities: '',
    images: '',
  });

  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/rooms/my-rooms');
      setRooms(data);
    } catch (err) {
      console.error('Failed to load owner rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await API.delete(`/rooms/${id}`);
      setRooms(rooms.filter((room) => room._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting room');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
        images: formData.images.split(',').map((img) => img.trim()).filter(Boolean),
      };

      const { data } = await API.post('/rooms', payload);
      setRooms([data, ...rooms]);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        rent: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        amenities: '',
        images: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage your properties and monitor listing verification</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add New Room
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 py-12 text-center">Loading your properties...</p>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl mt-6">
          <p className="text-slate-400">You have not posted any rooms yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {rooms.map((room) => (
            <div key={room._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-sky-400 flex items-center">
                    <IndianRupee className="w-4 h-4" /> {room.rent}/mo
                  </span>
                  {getStatusBadge(room.status)}
                </div>
                <h3 className="font-semibold text-white text-lg">{room.title}</h3>
                <p className="text-slate-400 text-xs mt-1">{room.location.address}, {room.location.city}</p>
                <p className="text-slate-300 text-sm mt-3 line-clamp-2">{room.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(room._id)}
                  className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">List a New Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Room Title</label>
                <input
                  required
                  placeholder="e.g. Spacious 1BHK near Metro"
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
                  placeholder="Furnishing details, rules, etc."
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
                  placeholder="7500"
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
                    placeholder="Street / Area"
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
                  placeholder="WiFi, AC, RO Water, Parking"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Image URL (comma-separated)</label>
                <input
                  placeholder="https://example.com/room.jpg"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}