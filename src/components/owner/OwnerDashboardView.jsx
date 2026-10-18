// client/src/components/owner/OwnerDashboardView.jsx
import { Link } from 'react-router-dom';
import { Avatar, Badge, Button, Card } from '../ui/shadcn';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  DoorOpen,
  IndianRupee,
  MessageSquare,
  Plus,
  ShieldAlert,
  Star,
  Users,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function OwnerDashboardView({
  rooms = [],
  bookings = [],
  conversations = [],
  onNavigateTab = () => {},
}) {
  const approvedRooms = rooms.filter((r) => r.status === 'approved');
  const pendingRooms = rooms.filter((r) => r.status === 'pending');
  const availableRooms = rooms.filter((r) => r.isAvailable && r.status === 'approved');
  const bookedRooms = rooms.filter((r) => !r.isAvailable);

  const totalRevenue = bookings.reduce(
    (sum, b) => (b.status === 'paid' ? sum + Number(b.amount || 0) : sum),
    0
  );

  // Reviews calculation
  const allReviews = rooms.flatMap((r) => r.reviews || []);
  const avgRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0) /
          allReviews.length
        ).toFixed(1)
      : '0.0';

  const recentBookings = [...bookings].slice(0, 4);
  const recentChats = [...conversations].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome & Call-to-Action Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-neutral-900 dark:via-[#16171d] dark:to-[#121316] border border-[#e2dbcf] dark:border-neutral-800 p-6 sm:p-8 shadow-xs dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 0% Broker Fee • Direct Owner Control
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
              Welcome to Your Owner Panel
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
              Manage your room listings, track real-time tenant payments, view occupied vs available rooms, chat directly with tenants, and monitor tenant reviews all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link to="/owner/post-room">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-850 text-white dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 font-black shadow-md text-sm transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                Post Room (Share Details)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Approval Notice Callout */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/25 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-950 dark:text-amber-200 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-900 dark:text-amber-300 font-bold">
            Listing Verification Process:
          </strong>{' '}
          Whenever you post a new room or modify pricing/details, our safety team reviews it in the Admin Control Center. Once accepted, it immediately appears live to thousands of verified tenants on Room Radar!
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <Card
          className="p-5 cursor-pointer bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-xs transition"
          onClick={() => onNavigateTab('rooms')}
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold">Total Published</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white mt-2">
            {rooms.length}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Properties listed</p>
        </Card>

        {/* Available Rooms */}
        <Card
          className="p-5 cursor-pointer bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-600/50 shadow-xs transition"
          onClick={() => onNavigateTab('rooms')}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold">Available for Rent</span>
            <DoorOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
            {availableRooms.length}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Ready for new tenants</p>
        </Card>

        {/* Booked / Occupied Rooms */}
        <Card
          className="p-5 cursor-pointer bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 hover:border-sky-500 dark:hover:border-sky-600/50 shadow-xs transition"
          onClick={() => onNavigateTab('rooms')}
        >
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
            <span className="text-xs font-semibold">Currently Booked</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400 mt-2">
            {bookedRooms.length}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Active tenant stays</p>
        </Card>

        {/* Total Revenue Collected */}
        <Card
          className="p-5 cursor-pointer bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500/50 shadow-xs transition"
          onClick={() => onNavigateTab('payments')}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold">Rent Collected</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            {totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">From tenant payments</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Approved & Live</p>
              <p className="text-lg font-black text-neutral-950 dark:text-white">{approvedRooms.length}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            Visible to Users
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Pending Review</p>
              <p className="text-lg font-black text-neutral-950 dark:text-white">{pendingRooms.length}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
            In Admin Queue
          </span>
        </Card>

        <Card
          className="p-4 flex items-center justify-between cursor-pointer bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-xs transition"
          onClick={() => onNavigateTab('reviews')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Overall Rating</p>
              <p className="text-lg font-black text-neutral-950 dark:text-white">
                {avgRating} <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">({allReviews.length} reviews)</span>
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        </Card>
      </div>

      {/* Two-Column Section: Recent Bookings/Payments & Recent Chats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenant Payments */}
        <Card className="p-5 flex flex-col justify-between bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2dbcf] dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-extrabold text-neutral-950 dark:text-white">Recent Rent Payments</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('payments')}
                className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                View all payments <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-xs">
                  No rent payments received yet.
                </div>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-xl bg-[#f8f5ee] hover:bg-[#ede5da] dark:bg-neutral-900/70 dark:hover:bg-neutral-850 border border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={b.tenant?.profilePic}
                        name={b.tenant?.name || 'Tenant'}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-neutral-950 dark:text-white truncate">
                          {b.tenant?.name || 'Tenant'}
                        </p>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                          {b.room?.title || 'Room Rent'}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {new Date(b.createdAt).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-end">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {Number(b.amount).toLocaleString('en-IN')}
                      </p>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 mt-0.5">
                        {b.status === 'vacated' ? 'Past Tenant' : 'Paid'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Recent Inquiries & Chats */}
        <Card className="p-5 flex flex-col justify-between bg-white dark:bg-[#121316] border border-[#e2dbcf] dark:border-neutral-800 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2dbcf] dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-extrabold text-neutral-950 dark:text-white">Recent Tenant Inquiries</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('chats')}
                className="text-xs text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                Open Chats <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentChats.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-xs">
                  No tenant inquiries yet. Inquiries will appear when users chat about your rooms.
                </div>
              ) : (
                recentChats.map((c) => {
                  const other = c.otherParticipant;
                  return (
                    <div
                      key={c._id}
                      onClick={() => onNavigateTab('chats')}
                      className="p-3.5 rounded-xl bg-[#f8f5ee] hover:bg-[#ede5da] dark:bg-neutral-900/70 dark:hover:bg-neutral-850 border border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between gap-3 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={other?.profilePic}
                          name={other?.name || 'User'}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-neutral-950 dark:text-white truncate">
                              {other?.name || 'Interested Tenant'}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                {c.unreadCount} new
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                            {c.lastMessage || 'Direct inquiry sent'}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
