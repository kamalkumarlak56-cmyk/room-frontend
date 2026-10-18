// client/src/components/owner/OwnerPaymentsView.jsx
import { useState } from 'react';
import API from '../../api/axios';
import { Avatar, Badge, Button, Card, Input } from '../ui/shadcn';
import {
  CreditCard,
  IndianRupee,
  Calendar,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  History,
  Phone,
  Mail,
  LogOut,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function OwnerPaymentsView({
  rooms = [],
  bookings = [],
  setBookings = () => {},
  setRooms = () => {},
  loading = false,
  onOpenChatWithUser = () => {},
}) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [vacatingId, setVacatingId] = useState(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    // Room filter
    if (selectedRoomFilter !== 'all') {
      const bRoomId = b.room?._id || b.room;
      if (bRoomId !== selectedRoomFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTenant = b.tenant?.name?.toLowerCase().includes(q);
      const matchRoom = b.room?.title?.toLowerCase().includes(q);
      const matchOrder = b.razorpayOrderId?.toLowerCase().includes(q);
      if (!matchTenant && !matchRoom && !matchOrder) return false;
    }

    return true;
  });

  // Calculate totals
  const totalRevenue = bookings.reduce(
    (sum, b) => (b.status === 'paid' || b.status === 'vacated' ? sum + Number(b.amount || 0) : sum),
    0
  );
  const activeTenantsCount = bookings.filter(
    (b) => b.status === 'paid' && b.isCurrentTenant !== false
  ).length;
  const pastTenantsCount = bookings.filter(
    (b) => b.status === 'vacated' || b.isCurrentTenant === false
  ).length;

  // Handle vacating a tenant
  const handleVacate = async (bookingId, roomId) => {
    if (
      !window.confirm(
        'Mark this tenant as vacated? The user will be moved to "Previous Users Who Lived Before" and the room will be marked Available again.'
      )
    ) {
      return;
    }

    try {
      setVacatingId(bookingId);
      await API.put(`/payments/bookings/${bookingId}/vacate`);

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: 'vacated', isCurrentTenant: false, vacatedAt: new Date() }
            : b
        )
      );

      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, isAvailable: true } : r))
      );

      alert('Tenant marked as vacated! Successfully updated room history.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tenant status');
    } finally {
      setVacatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#e2dbcf] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Rent Payments & Tenant History
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Track which user paid rent, the exact payment date, the room paid for, and past tenants who lived there before.
          </p>
        </div>

        {/* 0% Broker Tag */}
        <Badge variant="success" className="self-start sm:self-center px-3 py-1 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Direct Razorpay Payouts
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Rent Collected</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">0% broker commission</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Transactions</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{bookings.length}</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Rent receipts issued</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Current Active Tenants</p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{activeTenantsCount}</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Currently living</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Past Residents</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{pastTenantsCount}</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Who lived before</p>
        </Card>
      </div>

      {/* View Switcher Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f8f5ee] dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-[#e2dbcf] dark:border-neutral-800">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-[#ede5da] dark:hover:bg-neutral-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Rent Payments Log</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'transactions'
                  ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
                  : 'bg-[#e2dbcf] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-[#ede5da] dark:hover:bg-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Previous Users Who Lived Before (Room-Wise)</span>
          </button>
        </div>

        {/* Filter by Room & Search Tenant */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <Input
              placeholder="Search tenant name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-white dark:bg-neutral-950 border-[#e2dbcf] dark:border-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none max-w-[150px] truncate cursor-pointer"
          >
            <option value="all">All Rooms</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: TRANSACTIONS LOG */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 text-sm">
              Loading rent payments...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-900/60 border border-[#e2dbcf] dark:border-neutral-800 rounded-3xl p-8 space-y-3">
              <CreditCard className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">No rent payments found</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                When a user books a room and pays rent through Razorpay, full transaction records with user and date will be displayed here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => {
                const isVacated = b.status === 'vacated' || b.isCurrentTenant === false;
                const formattedDate = new Date(b.createdAt).toLocaleDateString([], {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = new Date(b.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Card
                    key={b._id}
                    className="p-5 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800/90 hover:border-[#d8cdbf] dark:hover:border-neutral-700 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Tenant Profile Pic, Name & Room Details */}
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Tenant Small Profile Pic */}
                        <Avatar
                          src={b.tenant?.profilePic}
                          name={b.tenant?.name || 'User'}
                          size="lg"
                          className="border-2 border-emerald-500/40 mt-0.5"
                        />

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-extrabold text-neutral-900 dark:text-white truncate">
                              {b.tenant?.name || 'Tenant Name'}
                            </h4>
                            {isVacated ? (
                              <Badge variant="secondary" className="text-[10px]">
                                Previous Tenant (Vacated)
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px]">
                                Current Active Tenant
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {b.tenant?.phone && (
                              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                <Phone className="w-3 h-3" /> {b.tenant.phone}
                              </span>
                            )}
                            {b.tenant?.email && (
                              <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                <Mail className="w-3 h-3 text-neutral-400 dark:text-neutral-500" /> {b.tenant.email}
                              </span>
                            )}
                          </div>

                          {/* Room Details for which user paid */}
                          <div className="pt-1 flex items-center gap-2">
                            <span className="text-[11px] text-neutral-500 font-medium">
                              Paid for room:
                            </span>
                            <span className="text-xs font-bold text-neutral-900 dark:text-[#f5efe6] flex items-center gap-1 truncate">
                              <Building2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                              {b.room?.title || 'Room Listing'}{' '}
                              <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                                ({b.room?.roomType || '1RK'})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment Amount, Date & Actions */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#e2dbcf] dark:border-neutral-800">
                        {/* Date Information */}
                        <div className="text-left lg:text-right space-y-0.5">
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center lg:justify-end gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Paid On: <strong className="text-neutral-900 dark:text-white">{formattedDate}</strong></span>
                          </p>
                          <p className="text-[11px] text-neutral-500">at {formattedTime}</p>
                          {b.moveInDate && (
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                              Move-in: <strong className="text-neutral-800 dark:text-neutral-300">{b.moveInDate}</strong>
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                            <IndianRupee className="w-4 h-4" />
                            {Number(b.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {b.paymentType === 'token_advance' ? 'Token Advance' : 'Full Rent'}
                          </p>
                        </div>

                        {/* Order & Payment ID */}
                        <div className="hidden xl:block text-right text-[10px] text-neutral-500 font-mono">
                          <p>Order: {b.razorpayOrderId?.slice(-12)}</p>
                          <p>Pay: {b.razorpayPaymentId?.slice(-12) || 'Verified'}</p>
                        </div>

                        {/* Vacate Button if currently living */}
                        {!isVacated && (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={vacatingId === b._id}
                              onClick={() => handleVacate(b._id, b.room?._id || b.room)}
                              className="text-xs text-amber-800 dark:text-amber-300 border-amber-500/50 hover:bg-amber-500/15 cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              <span>Mark Vacated</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ROOM-WISE OCCUPANCY & PREVIOUS USERS WHO LIVED BEFORE */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/80 border border-[#e2dbcf] dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-3">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-white">Tenant Stay & History Log:</strong> Below is a room-wise breakdown of current occupants and all previous users who lived in each room before.
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 text-sm">
              You do not have any rooms posted yet.
            </div>
          ) : (
            <div className="space-y-6">
              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (b) => (b.room?._id === room._id || b.room === room._id)
                );

                const currentTenantBooking = roomBookings.find(
                  (b) => b.status === 'paid' && b.isCurrentTenant !== false && !room.isAvailable
                );

                const previousTenants = roomBookings.filter(
                  (b) =>
                    (b.status === 'vacated' || b.isCurrentTenant === false) ||
                    (currentTenantBooking && b._id !== currentTenantBooking._id)
                );

                return (
                  <Card
                    key={room._id}
                    className="p-5 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800/90 overflow-hidden space-y-4"
                  >
                    {/* Room Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2dbcf] dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            room.images?.[0] ||
                            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={room.title}
                          className="w-12 h-12 rounded-xl object-cover border border-[#e2dbcf] dark:border-neutral-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-neutral-900 dark:text-white text-base truncate max-w-sm">
                              {room.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-[#f3ede2] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-bold">
                              {room.roomType || '1RK'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                            {room.location?.address}, {room.location?.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center sm:flex-col sm:items-end justify-between">
                        <span className="text-lg font-black text-neutral-900 dark:text-white flex items-center">
                          <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          {Number(room.rent).toLocaleString('en-IN')}/mo
                        </span>
                        <span className="text-xs">
                          {room.isAvailable ? (
                            <Badge variant="success">Currently Available</Badge>
                          ) : (
                            <Badge variant="default" className="bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30">
                              Currently Occupied
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Current Tenant Box */}
                    <div className="rounded-xl p-4 bg-[#fbf9f5] dark:bg-neutral-950/70 border border-[#e2dbcf] dark:border-neutral-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2.5 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Current Living Tenant
                      </p>

                      {currentTenantBooking ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={currentTenantBooking.tenant?.profilePic}
                              name={currentTenantBooking.tenant?.name || 'Tenant'}
                              size="md"
                              className="border border-sky-500/40"
                            />
                            <div>
                              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                {currentTenantBooking.tenant?.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                {currentTenantBooking.tenant?.phone && (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {currentTenantBooking.tenant.phone}
                                  </span>
                                )}
                                {currentTenantBooking.tenant?.email && (
                                  <span>{currentTenantBooking.tenant.email}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400">
                                Move-in:{' '}
                                <strong className="text-neutral-900 dark:text-white">
                                  {currentTenantBooking.moveInDate ||
                                    new Date(currentTenantBooking.createdAt).toLocaleDateString()}
                                </strong>
                              </p>
                              <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                                Rent: ₹{Number(currentTenantBooking.amount).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={vacatingId === currentTenantBooking._id}
                              onClick={() => handleVacate(currentTenantBooking._id, room._id)}
                              className="text-xs text-amber-800 dark:text-amber-300 border-amber-500/50 hover:bg-amber-500/15 cursor-pointer"
                            >
                              <LogOut className="w-3 h-3 mr-1" /> Mark Vacated
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 italic">
                          No tenant is currently living in this room. Room is vacant and available for rent.
                        </p>
                      )}
                    </div>

                    {/* PREVIOUS USERS WHO LIVED BEFORE */}
                    <div className="rounded-xl p-4 bg-[#f8f5ee] dark:bg-neutral-900/50 border border-[#e2dbcf] dark:border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                          <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Previous Users Who Lived Before ({previousTenants.length})
                        </p>
                      </div>

                      {previousTenants.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic py-2">
                          No previous tenants on record for this room yet. (When tenants vacate, their history will be preserved here).
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {previousTenants.map((prevTenant) => (
                            <div
                              key={prevTenant._id}
                              className="p-3 rounded-lg bg-white dark:bg-neutral-950/80 border border-[#e2dbcf] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={prevTenant.tenant?.profilePic}
                                  name={prevTenant.tenant?.name || 'Past Resident'}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-bold text-neutral-900 dark:text-white">
                                    {prevTenant.tenant?.name || 'Previous Tenant'}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-neutral-600 dark:text-neutral-400">
                                    {prevTenant.tenant?.phone && (
                                      <span>{prevTenant.tenant.phone}</span>
                                    )}
                                    {prevTenant.tenant?.email && (
                                      <span>{prevTenant.tenant.email}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 text-neutral-600 dark:text-neutral-400 text-[11px]">
                                <div>
                                  <span>Stay Period / Move-in: </span>
                                  <strong className="text-neutral-900 dark:text-neutral-200">
                                    {prevTenant.moveInDate ||
                                      new Date(prevTenant.createdAt).toLocaleDateString([], {
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                  </strong>
                                </div>
                                <div>
                                  <span>Vacated: </span>
                                  <strong className="text-amber-800 dark:text-amber-300">
                                    {prevTenant.vacatedAt
                                      ? new Date(prevTenant.vacatedAt).toLocaleDateString([], {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Completed'}
                                  </strong>
                                </div>
                                <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  ₹{Number(prevTenant.amount).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
