import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import RoomCard from '../components/RoomCard';
import RoomDetailsModal from '../components/RoomDetailsModal';
import RoomImageSlider from '../components/RoomImageSlider';
import { Badge, Button } from '../components/ui/shadcn';
import {
  Search,
  Loader2,
  Home as HomeIcon,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

const QUICK_ROOM_TYPES = ['all', '1RK', '1BHK', '2BHK', '3BHK', 'Single Room', 'PG/Shared'];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'owner') {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  // Selected room for Details / Chat / Razorpay Booking modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms =
    selectedType === 'all'
      ? rooms
      : rooms.filter((r) => r.roomType === selectedType);

  const handleOpenDetails = (room, tab = 'details') => {
    if (room?._id) {
      navigate(`/rooms-detail/${room._id}`, { state: { room, tab } });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-body)] pb-20 transition-colors duration-200">
      {/* Premier Image Slider: House/room image on left, room details on right, no owner info */}
      <RoomImageSlider
        rooms={rooms}
        onViewDetails={(room) => handleOpenDetails(room, 'details')}
        onChat={(room) => handleOpenDetails(room, 'chat')}
        onBook={(room) => handleOpenDetails(room, 'book')}
      />

      {/* Verified Available Rooms Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-neutral-700 dark:text-[#d8cdbf]" />
                Admin-Verified Available Rooms
              </h2>
              <Badge variant="default" className="text-xs bg-[#f5efe6] dark:bg-[#f5efe6]/10 text-neutral-900 dark:text-[#f5efe6] border-[#d8cdbf] dark:border-[#f5efe6]/20 font-bold">
                {filteredRooms.length}
              </Badge>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Direct landlord postings reviewed & verified by Admin. 0% Brokerage guaranteed.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {QUICK_ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                    selectedType === type
                      ? 'bg-[#f5efe6] text-neutral-950 font-bold border-[#d8cdbf] shadow-xs'
                      : 'bg-white dark:bg-[#121316] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-800'
                  }`}
                >
                  {type === 'all' ? 'All Rooms' : type}
                </button>
              ))}
            </div>

            <Link to="/searchrooms">
              <Button variant="default" size="sm" className="whitespace-nowrap">
                <Search className="w-3.5 h-3.5" />
                <span>Search with Filters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24 text-neutral-600 dark:text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8cdbf]" />
            Loading verified rooms...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#121316] border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 px-4 shadow-sm">
            <p className="text-neutral-800 dark:text-neutral-300 font-medium">
              No approved rooms currently listed under &quot;{selectedType}&quot;.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Browse other room categories or use full search with location and price filters.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedType('all')}>
                Show All Rooms
              </Button>
              <Link to="/searchrooms">
                <Button variant="default" size="sm">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Explore Search Rooms
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onViewDetails={(r) => handleOpenDetails(r, 'details')}
                onChat={(r) => handleOpenDetails(r, 'chat')}
                onBook={(r) => handleOpenDetails(r, 'book')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Room Details / Chat / Razorpay Booking Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          open={Boolean(selectedRoom)}
          initialTab={modalTab}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}