// client/src/pages/OwnerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Badge, Button, Card, Dialog, Input, Label, Select, Textarea } from '../components/ui/shadcn';
import {
  Plus,
  Trash2,
  Edit3,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  BedDouble,
  Users,
  MapPin,
  UserCheck,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

const FACILITY_OPTIONS = [
  'Parking',
  'Camera',
  'AC',
  'Cooler',
  'Washing Machine',
  'RO',
  'WiFi',
  'Geyser',
  'Fridge',
  'Power Backup',
  'Kitchen',
  'Lift',
];

const SUITABLE_FOR_OPTIONS = [
  'Students',
  'Job Employees',
  'Women',
  'Family',
  'Anyone',
];

const initialFormState = {
  title: '',
  description: '',
  roomType: '1RK',
  rent: '',
  securityDeposit: '',
  electricityIncluded: false,
  electricityRatePerUnit: '8',
  furnishingStatus: 'Semi-Furnished',
  bedConfiguration: '1 Bed',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  facilities: ['Parking', 'RO'],
  suitableFor: ['Anyone'],
  rules: {
    drinkingAllowed: false,
    smokingAllowed: false,
    lateNightAllowed: false,
    visitorsAllowed: true,
    petsAllowed: false,
    nonVegAllowed: true,
  },
};

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [showModal, setShowModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Images state for local file picker & Cloudinary upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(initialFormState);

  const fetchLandlordData = async () => {
    try {
      setLoading(true);
      const [roomsRes, bookingsRes] = await Promise.all([
        API.get('/rooms/my-rooms'),
        API.get('/payments/my-bookings').catch(() => ({ data: { landlordBookings: [] } })),
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data?.landlordBookings || []);
    } catch (err) {
      console.error('Failed to load landlord dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, []);

  const openCreateModal = () => {
    setEditingRoomId(null);
    setFormData(initialFormState);
    setSelectedFiles([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoomId(room._id);
    setFormData({
      title: room.title || '',
      description: room.description || '',
      roomType: room.roomType || '1RK',
      rent: room.rent || '',
      securityDeposit: room.securityDeposit || '',
      electricityIncluded: Boolean(room.electricityIncluded),
      electricityRatePerUnit: room.electricityRatePerUnit ?? 8,
      furnishingStatus: room.furnishingStatus || 'Semi-Furnished',
      bedConfiguration: room.bedConfiguration || '1 Bed',
      address: room.location?.address || '',
      landmark: room.location?.landmark || '',
      city: room.location?.city || '',
      state: room.location?.state || '',
      pincode: room.location?.pincode || '',
      facilities:
        room.facilities?.length > 0 ? room.facilities : room.amenities || [],
      suitableFor:
        room.suitableFor?.length > 0 ? room.suitableFor : ['Anyone'],
      rules: {
        drinkingAllowed: Boolean(room.rules?.drinkingAllowed),
        smokingAllowed: Boolean(room.rules?.smokingAllowed),
        lateNightAllowed: Boolean(room.rules?.lateNightAllowed),
        visitorsAllowed:
          room.rules?.visitorsAllowed !== undefined
            ? Boolean(room.rules.visitorsAllowed)
            : true,
        petsAllowed: Boolean(room.rules?.petsAllowed),
        nonVegAllowed:
          room.rules?.nonVegAllowed !== undefined
            ? Boolean(room.rules.nonVegAllowed)
            : true,
      },
    });
    setExistingImages(room.images || []);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this room listing?')) return;
    try {
      await API.delete(`/rooms/${id}`);
      setRooms(rooms.filter((room) => room._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting room');
    }
  };

  const toggleArrayItem = (field, value) => {
    const current = formData[field] || [];
    const exists = current.includes(value);
    const updated = exists
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const toggleRule = (ruleKey) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        [ruleKey]: !formData.rules[ruleKey],
      },
    });
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let uploadedUrls = [...existingImages];

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadFormData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          uploadFormData.append('images', selectedFiles[i]);
        }

        const { data: uploadRes } = await API.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        uploadedUrls = [...uploadedUrls, ...(uploadRes.imageUrls || [])];
        setUploading(false);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        roomType: formData.roomType,
        rent: Number(formData.rent),
        securityDeposit: Number(formData.securityDeposit || 0),
        electricityIncluded: Boolean(formData.electricityIncluded),
        electricityRatePerUnit: formData.electricityIncluded
          ? 0
          : Number(formData.electricityRatePerUnit || 8),
        furnishingStatus: formData.furnishingStatus,
        bedConfiguration: formData.bedConfiguration,
        location: {
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        facilities: formData.facilities,
        amenities: formData.facilities,
        suitableFor:
          formData.suitableFor.length > 0 ? formData.suitableFor : ['Anyone'],
        rules: formData.rules,
        images: uploadedUrls,
      };

      if (editingRoomId) {
        const { data } = await API.put(`/rooms/${editingRoomId}`, payload);
        setRooms(rooms.map((r) => (r._id === editingRoomId ? data : r)));
      } else {
        const { data } = await API.post('/rooms', payload);
        setRooms([data, ...rooms]);
      }

      setShowModal(false);
      setSelectedFiles([]);
      setFormData(initialFormState);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save room listing');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Live to Users
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3.5 h-3.5" /> Rejected by Admin (Hidden)
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <Clock className="w-3.5 h-3.5" /> Sent to Admin (Pending Approval)
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Owner Dashboard
            </h1>
            <Badge variant="purple">Owner & User Role</Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Publish your rooms for rent with 0% broker fee. New listings go directly to Admin for approval before appearing to users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/profile">
            <Button variant="secondary" size="sm">
              <UserCheck className="w-4 h-4 text-emerald-400" /> KYC & Bank Details
            </Button>
          </Link>
          <Button variant="default" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Publish New Room
          </Button>
        </div>
      </div>

      {/* Info Banner about Admin Verification */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold">
            How Room Verification Works:
          </strong>{' '}
          When you publish or edit a room, it is sent exclusively to the{' '}
          <strong>Admin Control Center</strong> (`status: pending`) and is not shown on the Home/User page. Once the Admin accepts your listing, it immediately becomes live for all users!
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400">Total Posted Rooms</p>
          <p className="text-2xl font-extrabold text-white mt-1">{rooms.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-emerald-400">Approved (Live to Users)</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {rooms.filter((r) => r.status === 'approved').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-amber-400">Pending Admin Review</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {rooms.filter((r) => r.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-sky-400">Tenant Bookings (Razorpay)</p>
          <p className="text-2xl font-extrabold text-sky-400 mt-1">{bookings.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <Button
          variant={activeTab === 'rooms' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('rooms')}
        >
          My Posted Rooms ({rooms.length})
        </Button>
        <Button
          variant={activeTab === 'bookings' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('bookings')}
        >
          <CreditCard className="w-3.5 h-3.5" /> Received Tenant Payments ({bookings.length})
        </Button>
      </div>

      {activeTab === 'rooms' ? (
        loading ? (
          <p className="text-slate-400 py-12 text-center">Loading your properties...</p>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-slate-300 font-medium">
              You have not published any rooms yet.
            </p>
            <Button variant="default" onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Publish Your First Room
            </Button>
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
                    <div className="relative h-44 bg-slate-950">
                      <img
                        src={
                          room.images?.[0] ||
                          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs">
                          {room.roomType || '1RK'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(room.status)}
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
                        <h3 className="font-bold text-white text-base truncate">
                          {room.title}
                        </h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {room.location?.address}, {room.location?.city},{' '}
                          {room.location?.state}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <Badge variant="secondary">
                          <BedDouble className="w-3 h-3" /> {room.furnishingStatus} •{' '}
                          {room.bedConfiguration}
                        </Badge>
                        <Badge variant="purple">
                          <Users className="w-3 h-3" />{' '}
                          {(room.suitableFor || ['Anyone']).join(', ')}
                        </Badge>
                      </div>

                      {facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {facilities.slice(0, 5).map((f, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {room.status === 'rejected' && room.rejectionReason && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-xs text-rose-300">
                          <strong>Admin Note:</strong> {room.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-800 flex justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(room)}
                      className="flex-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(room._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400">No tenant payments received yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <Card key={b._id} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="success">Paid via Razorpay</Badge>
                <span className="text-lg font-bold text-emerald-400">
                  ₹{Number(b.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <h4 className="font-bold text-white">{b.room?.title || 'Room Booking'}</h4>
              <p className="text-xs text-slate-400">
                Tenant: <strong className="text-slate-200">{b.tenant?.name}</strong> (
                {b.tenant?.phone || b.tenant?.email})
              </p>
              <p className="text-xs text-slate-500">
                Order ID: {b.razorpayOrderId} • Payment ID: {b.razorpayPaymentId}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Publish / Edit Room Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoomId ? 'Edit Room Listing' : 'Publish a Room for Rent'}
        subtitle="Provide complete room specifications. Your listing will go to Admin for approval before showing to users."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveRoom} className="space-y-5 text-sm">
          {/* Row 1: Title & Room Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label>Room Title *</Label>
              <Input
                required
                placeholder="e.g. Spacious Sunny 1BHK Near Metro Station"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Room Type (1RK / 1BHK / 2BHK) *</Label>
              <Select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              >
                <option value="1RK">1RK</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="Single Room">Single Room</option>
                <option value="PG/Shared">PG / Shared</option>
              </Select>
            </div>
          </div>

          {/* Row 2: Price & Electricity Bill */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Pricing & Electricity Bill Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Monthly Rent (₹) *</Label>
                <Input
                  type="number"
                  required
                  placeholder="8500"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                />
              </div>
              <div>
                <Label>Security Deposit (₹)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.securityDeposit}
                  onChange={(e) =>
                    setFormData({ ...formData, securityDeposit: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Electricity Bill Included?</Label>
                <Select
                  value={formData.electricityIncluded ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      electricityIncluded: e.target.value === 'yes',
                    })
                  }
                >
                  <option value="no">No (Charge per Unit in INR)</option>
                  <option value="yes">Yes (Included in Monthly Rent)</option>
                </Select>
              </div>
            </div>

            {!formData.electricityIncluded && (
              <div className="max-w-xs">
                <Label className="text-amber-400">
                  Electricity Rate (INR / Unit) *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.5"
                    required
                    placeholder="8"
                    value={formData.electricityRatePerUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        electricityRatePerUnit: e.target.value,
                      })
                    }
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    ₹ / unit
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Furnishing Status & Beds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Furnishing Status *</Label>
              <Select
                value={formData.furnishingStatus}
                onChange={(e) =>
                  setFormData({ ...formData, furnishingStatus: e.target.value })
                }
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </Select>
            </div>
            <div>
              <Label>Bed Configuration (1 Bed / 2 Beds / 3 Beds) *</Label>
              <Select
                value={formData.bedConfiguration}
                onChange={(e) =>
                  setFormData({ ...formData, bedConfiguration: e.target.value })
                }
              >
                <option value="1 Bed">1 Bed</option>
                <option value="2 Beds">2 Beds</option>
                <option value="3 Beds">3 Beds</option>
                <option value="4+ Beds">4+ Beds</option>
                <option value="No Bed">No Bed (Unfurnished)</option>
              </Select>
            </div>
          </div>

          {/* Row 4: Location */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Location Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Street Address / House No *</Label>
                <Input
                  required
                  placeholder="House 42, Sector 15"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Landmark</Label>
                <Input
                  placeholder="Near City Mall / Metro Gate 2"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>City *</Label>
                <Input
                  required
                  placeholder="e.g. Noida / Haridwar / Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  required
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <Label>Pincode *</Label>
                <Input
                  required
                  placeholder="249401"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Row 5: Facilities (Parking, Camera, AC, Cooler, Washing Machine, RO, etc.) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Facilities Available (Select all that apply)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FACILITY_OPTIONS.map((fac) => {
                const selected = formData.facilities.includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleArrayItem('facilities', fac)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      selected
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      readOnly
                      className="rounded accent-sky-500"
                    />
                    {fac}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Other Facilities / Rules (Drinking Allow, Smoking Allow, Late Night Allow, etc.) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Other Facilities & House Permissions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'drinkingAllowed', label: 'Drinking Allowed' },
                { key: 'smokingAllowed', label: 'Smoking Allowed' },
                { key: 'lateNightAllowed', label: 'Late Night Entry Allowed' },
                { key: 'visitorsAllowed', label: 'Visitors Allowed' },
                { key: 'petsAllowed', label: 'Pets Allowed' },
                { key: 'nonVegAllowed', label: 'Non-Veg Food Allowed' },
              ].map((rule) => {
                const active = Boolean(formData.rules[rule.key]);
                return (
                  <button
                    key={rule.key}
                    type="button"
                    onClick={() => toggleRule(rule.key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{rule.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        active
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {active ? 'YES' : 'NO'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 7: Suitable For Whom (Students, Job Employees, Women, Family, Anyone) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              For Whom is this Room Suitable? *
            </h4>
            <div className="flex flex-wrap gap-2">
              {SUITABLE_FOR_OPTIONS.map((option) => {
                const selected = formData.suitableFor.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayItem('suitableFor', option)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      selected
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 8: Description & Photos */}
          <div>
            <Label>Detailed Room Description *</Label>
            <Textarea
              required
              rows={3}
              placeholder="Describe room ventilation, nearby markets/colleges, water timing, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Upload Room Photos to Cloudinary (Max 5)</Label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer bg-slate-950 border border-slate-800 rounded-lg p-1.5"
            />
            {uploading && (
              <p className="text-xs text-sky-400 mt-1 animate-pulse">
                Uploading room photos to Cloudinary...
              </p>
            )}
            {selectedFiles.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {selectedFiles.length} new file(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploading}>
              {submitting
                ? 'Submitting to Admin...'
                : editingRoomId
                ? 'Save & Submit for Admin Approval'
                : 'Publish Room (Send to Admin)'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}