// client/src/pages/OwnerDashboard.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import OwnerDashboardView from '../components/owner/OwnerDashboardView';
import OwnerRoomsView from '../components/owner/OwnerRoomsView';
import OwnerPaymentsView from '../components/owner/OwnerPaymentsView';
import OwnerChatsView from '../components/owner/OwnerChatsView';
import OwnerReviewsView from '../components/owner/OwnerReviewsView';
import OwnerProfileView from '../components/owner/OwnerProfileView';
import { Menu, Building2, ShieldCheck } from 'lucide-react';

export default function OwnerDashboard({ defaultTab = 'dashboard' }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL or defaultTab prop
  const getTabFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/owner/rooms')) return 'rooms';
    if (path.includes('/owner/payments')) return 'payments';
    if (path.includes('/owner/chats')) return 'chats';
    if (path.includes('/owner/reviews')) return 'reviews';
    if (path.includes('/owner/profile')) return 'profile';
    return defaultTab || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Load all landlord data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, bookingsRes, chatsRes] = await Promise.all([
        API.get('/rooms/my-rooms').catch(() => ({ data: [] })),
        API.get('/payments/my-bookings').catch(() => ({ data: { landlordBookings: [] } })),
        API.get('/chat/conversations').catch(() => ({ data: [] })),
      ]);

      setRooms(roomsRes.data || []);
      setBookings(bookingsRes.data?.landlordBookings || []);
      setConversations(chatsRes.data || []);
    } catch (err) {
      console.error('Failed to load owner dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll chat conversations every 5 seconds for unread updates
    const interval = setInterval(async () => {
      try {
        const { data } = await API.get('/chat/conversations');
        setConversations(data || []);
      } catch {
        // silent poll fail
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalUnreadMessages = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );
  const totalReviewsCount = rooms.reduce(
    (sum, r) => sum + (r.reviews?.length || 0),
    0
  );

  const sidebarCounts = {
    rooms: rooms.length,
    payments: bookings.length,
    unread: totalUnreadMessages,
    reviews: totalReviewsCount,
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/owner/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-[#f9f6f0] dark:bg-[#0a0b0d] text-neutral-900 dark:text-white flex flex-col font-sans">
      {/* Left Navigation Bar */}
      <OwnerSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        counts={sidebarCounts}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
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
              aria-label="Open Owner Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">Owner Panel</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 0% Broker
              </span>
            </div>
          </div>

          <span className="text-xs font-bold capitalize text-neutral-600 dark:text-neutral-400">
            {activeTab}
          </span>
        </div>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <OwnerDashboardView
              rooms={rooms}
              bookings={bookings}
              conversations={conversations}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'rooms' && (
            <OwnerRoomsView
              rooms={rooms}
              setRooms={setRooms}
              bookings={bookings}
              setBookings={setBookings}
              loading={loading}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'payments' && (
            <OwnerPaymentsView
              rooms={rooms}
              bookings={bookings}
              setBookings={setBookings}
              setRooms={setRooms}
              loading={loading}
              onOpenChatWithUser={(userId) => {
                handleTabChange('chats');
              }}
            />
          )}

          {activeTab === 'chats' && (
            <OwnerChatsView
              conversations={conversations}
              setConversations={setConversations}
              loading={loading}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'reviews' && (
            <OwnerReviewsView rooms={rooms} loading={loading} />
          )}

          {activeTab === 'profile' && (
            <OwnerProfileView rooms={rooms} bookings={bookings} />
          )}
        </main>
      </div>
    </div>
  );
}