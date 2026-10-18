// client/src/components/owner/OwnerRoomsView.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Avatar, Badge, Button, Card, Input } from '../ui/shadcn';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  IndianRupee,
  Zap,
  MapPin,
  BedDouble,
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  LogOut,
  DoorOpen,
  ExternalLink,
  UserCheck,
} from 'lucide-react';

export default function OwnerRoomsView({
  rooms = [],
  setRooms = () => {},
  bookings = [],
  setBookings = () => {},
  loading = false,
  onRefresh = () => {},
}) {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'available', 'booked'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Group rooms
  const availableRooms = rooms.filter((r) => r.isAvailable && r.status === 'approved');
  const bookedRooms = rooms.filter((r) => !r.isAvailable);

  // Filtered rooms
  const displayedRooms = rooms.filter((room) => {
    // Tab filter
    if (filterTab === 'available' && (!room.isAvailable || room.status !== 'approved')) {
      return false;
    }
    if (filterTab === 'booked' && room.isAvailable) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && room.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = room.title?.toLowerCase().includes(q);
      const matchCity = room.location?.city?.toLowerCase().includes(q);
      const matchAddress = room.location?.address?.toLowerCase().includes(q);
      const matchType = room.roomType?.toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchAddress && !matchType) return false;
    }

    return true;
  });

  // Get active tenant booking for a specific room
  const getActiveBooking = (roomId) => {
    return bookings.find(
      (b) =>
        (b.room?._id === roomId || b.room === roomId) &&
        b.status === 'paid' &&
        b.isCurrentTenant !== false
    );
  };

  // Toggle room availability
  const handleToggleAvailability = async (room) => {
    try {
      setActionLoadingId(room._id);
      const { data } = await API.patch(`/rooms/${room._id}/availability`, {
        isAvailable: !room.isAvailable,
      });
      setRooms((prev) =>
        prev.map((r) => (r._id === room._id ? { ...r, isAvailable: data.room.isAvailable } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle room availability');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark tenant as vacated & make room available
  const handleVacateTenant = async (bookingId, roomId) => {
    if (
      !window.confirm(
        'Are you sure the tenant has vacated this room? This will mark the room as Available for new tenants and save this user in Previous Tenants history.'
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(roomId);
      await API.put(`/payments/bookings/${bookingId}/vacate`);

      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, isAvailable: true } : r))
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: 'vacated', isCurrentTenant: false, vacatedAt: new Date() }
            : b
        )
      );

      alert('Tenant marked as vacated! The room is now available for new bookings.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vacate tenant');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room listing permanently?')) {
      return;
    }

    try {
      await API.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting room');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Live
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3.5 h-3.5" /> Rejected by Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <Clock className="w-3.5 h-3.5" /> Pending Admin Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Post Room Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2dbcf] dark:border-neutral-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-neutral-900 dark:text-[#f5efe6]" />
            Manage Your Properties
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            Monitor published listings, view available rooms, and see who booked occupied rooms.
          </p>
        </div>

        <Link to="/owner/post-room">
          <Button
            variant="default"
            size="default"
            className="font-black bg-neutral-950 hover:bg-neutral-850 text-white dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Post New Room
          </Button>
        </Link>
      </div>

      {/* Tabs: All Published, Available, Booked */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-[#e2dbcf] dark:border-neutral-800 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              filterTab === 'all'
                ? 'bg-neutral-950 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <span>Published Rooms</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filterTab === 'all'
                  ? 'bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white'
                  : 'bg-[#ede5da] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {rooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              filterTab === 'available'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Available Rooms</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filterTab === 'available'
                  ? 'bg-white text-emerald-800 dark:bg-neutral-950 dark:text-emerald-400'
                  : 'bg-[#ede5da] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {availableRooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('booked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              filterTab === 'booked'
                ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-neutral-950 shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Booked Rooms</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filterTab === 'booked'
                  ? 'bg-white text-sky-800 dark:bg-neutral-950 dark:text-sky-400'
                  : 'bg-[#ede5da] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {bookedRooms.length}
            </span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search title, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-white dark:bg-neutral-950 border-[#d8cdbf] dark:border-neutral-800 text-neutral-950 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-[#d8cdbf] dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Rooms List */}
      {loading ? (
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 text-sm">
          Loading your properties...
        </div>
      ) : displayedRooms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900/60 border border-[#e2dbcf] dark:border-neutral-800 rounded-3xl space-y-3 p-8 shadow-xs">
          <Building2 className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto" />
          <h3 className="text-base font-extrabold text-neutral-950 dark:text-white">No rooms found</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {filterTab === 'booked'
              ? 'None of your rooms are currently marked as booked. When tenants pay rent via Razorpay, they will appear here.'
              : filterTab === 'available'
              ? 'You do not have any approved available rooms right now.'
              : 'You have not published any rooms yet or no rooms match your search.'}
          </p>
          <Link to="/owner/post-room">
            <Button variant="default" size="sm" className="mt-2 font-bold">
              <Plus className="w-4 h-4 stroke-[3]" /> Post a Room Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedRooms.map((room) => {
            const activeBooking = getActiveBooking(room._id);
            const facilities =
              room.facilities?.length > 0 ? room.facilities : room.amenities || [];
            const isBooked = !room.isAvailable;

            return (
              <Card
                key={room._id}
                className="overflow-hidden flex flex-col justify-between bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800/90 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition"
              >
                <div>
                  {/* Image & Top Badges */}
                  <div className="relative h-48 sm:h-52 bg-neutral-900">
                    <img
                      src={
                        room.images?.[0] ||
                        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md text-white font-extrabold text-xs border border-white/20">
                        {room.roomType || '1RK'}
                      </span>
                      {isBooked ? (
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-black text-xs shadow-md flex items-center gap-1">
                          <Users className="w-3 h-3" /> Booked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-neutral-950 font-black text-xs shadow-md flex items-center gap-1">
                          <DoorOpen className="w-3 h-3" /> Available
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(room.status)}
                    </div>
                  </div>

                  {/* Room Details Content */}
                  <div className="p-5 space-y-3">
                    {/* Price & Electricity */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-neutral-950 dark:text-[#f5efe6] flex items-center">
                        <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {Number(room.rent).toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal ml-1">/ month</span>
                      </span>
                      <span className="text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1 font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        {room.electricityIncluded
                          ? 'Electricity Free'
                          : `₹${room.electricityRatePerUnit || 8}/unit`}
                      </span>
                    </div>

                    {/* Title & Location */}
                    <div>
                      <h3 className="font-extrabold text-neutral-950 dark:text-white text-base truncate">
                        {room.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">
                          {room.location?.address}, {room.location?.city},{' '}
                          {room.location?.state}
                        </span>
                      </p>
                    </div>

                    {/* Furnishing & Bed */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <Badge variant="secondary">
                        <BedDouble className="w-3 h-3 text-neutral-500" /> {room.furnishingStatus} •{' '}
                        {room.bedConfiguration}
                      </Badge>
                      <Badge variant="default">
                        <Users className="w-3 h-3" />{' '}
                        {(room.suitableFor || ['Anyone']).join(', ')}
                      </Badge>
                    </div>

                    {/* Facilities Chips */}
                    {facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {facilities.slice(0, 5).map((f, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#f8f5ee] dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 px-2 py-0.5 rounded-md text-neutral-800 dark:text-neutral-300 font-semibold"
                          >
                            {f}
                          </span>
                        ))}
                        {facilities.length > 5 && (
                          <span className="text-[11px] text-neutral-500 font-semibold self-center">
                            +{facilities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejection Note if Rejected */}
                    {room.status === 'rejected' && room.rejectionReason && (
                      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/25 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300">
                        <strong className="font-bold text-rose-700 dark:text-rose-400">Admin Rejection Reason:</strong>{' '}
                        {room.rejectionReason}
                      </div>
                    )}

                    {/* WHO BOOKED THAT ROOM (CRITICAL REQUIREMENT) */}
                    {isBooked && (
                      <div className="mt-3 p-4 rounded-2xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-950/40 dark:via-neutral-900 dark:to-neutral-900 border border-sky-300 dark:border-sky-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                            <UserCheck className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                            <span>Who Booked This Room:</span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-200 text-sky-950 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">
                            Active Tenant
                          </span>
                        </div>

                        {activeBooking ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={activeBooking.tenant?.profilePic}
                                name={activeBooking.tenant?.name || 'Tenant'}
                                size="md"
                                className="border-2 border-sky-500/50"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-neutral-950 dark:text-white truncate">
                                  {activeBooking.tenant?.name || 'Tenant'}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-700 dark:text-neutral-400 mt-0.5 font-medium">
                                  {activeBooking.tenant?.phone && (
                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                                      <Phone className="w-3 h-3" /> {activeBooking.tenant.phone}
                                    </span>
                                  )}
                                  {activeBooking.tenant?.email && (
                                    <span className="flex items-center gap-1 truncate text-neutral-600 dark:text-neutral-400">
                                      <Mail className="w-3 h-3 text-neutral-500" /> {activeBooking.tenant.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-sky-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-sky-700 dark:text-sky-400" />
                                <span>
                                  Booked:{' '}
                                  <strong className="text-neutral-950 dark:text-neutral-200 font-bold">
                                    {new Date(activeBooking.createdAt).toLocaleDateString([], {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                  </strong>
                                </span>
                              </div>
                              <div className="text-right">
                                <span>
                                  Rent Paid:{' '}
                                  <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                                    ₹{Number(activeBooking.amount).toLocaleString('en-IN')}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            {/* Button to Vacate Tenant and make room available again */}
                            <div className="pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoadingId === room._id}
                                onClick={() => handleVacateTenant(activeBooking._id, room._id)}
                                className="w-full text-xs font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 dark:bg-transparent dark:text-amber-300 dark:border-amber-500/40 dark:hover:bg-amber-500/15 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Mark as Vacated (Make Room Available)</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                            <p>
                              This room is marked as booked/occupied offline or through an earlier booking.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoadingId === room._id}
                              onClick={() => handleToggleAvailability(room)}
                              className="text-xs font-bold text-emerald-800 border-emerald-400 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-500/10 cursor-pointer"
                            >
                              <DoorOpen className="w-3.5 h-3.5 mr-1" /> Set Available for Rent
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="p-4 pt-3 border-t border-[#e2dbcf] dark:border-neutral-800 bg-[#fbf9f5] dark:bg-neutral-950/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/owner/edit-room/${room._id}`)}
                      className="text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-900 border border-[#d8cdbf] dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoadingId === room._id}
                      onClick={() => handleToggleAvailability(room)}
                      className="text-xs font-bold border-[#d8cdbf] dark:border-neutral-700 text-neutral-800 dark:text-neutral-300 hover:bg-[#ede5da] dark:hover:bg-neutral-800"
                    >
                      {room.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {room.status === 'approved' && (
                      <Link to={`/room/${room._id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-xs text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white" title="Preview Live Room">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRoom(room._id)}
                      className="text-xs font-bold"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
