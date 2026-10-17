// client/src/pages/WishlistPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import RoomDetailsModal from '../components/RoomDetailsModal';
import { Badge, Button } from '../components/ui/shadcn';
import { Heart, Search, Loader2, Sparkles, Building2 } from 'lucide-react';

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'owner') {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/auth/wishlist');
      setRooms(data || []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.wishlist]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  My Wishlist
                </h1>
                <Badge variant="destructive" className="font-bold">
                  {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Rooms you saved to review later, chat with owners, or book directly with zero brokerage.
              </p>
            </div>
          </div>
        </div>

        <Link to="/searchrooms">
          <Button variant="default" size="sm">
            <Search className="w-4 h-4" /> Browse More Rooms
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#d8cdbf]" />
          Loading your saved wishlist...
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 px-4 max-w-md mx-auto bg-[#121316] border border-neutral-800 rounded-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800/90 flex items-center justify-center text-rose-400 border border-neutral-700">
            <Heart className="w-8 h-8 text-rose-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Explore verified rooms with zero brokerage, tap the heart icon on any room to save it here.
            </p>
          </div>
          <Link to="/searchrooms" className="inline-block pt-2">
            <Button variant="default">
              <Search className="w-4 h-4" /> Start Searching Rooms
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onViewDetails={(r) => {
                setSelectedRoom(r);
                setModalTab('details');
              }}
              onChat={(r) => {
                setSelectedRoom(r);
                setModalTab('chat');
              }}
              onBook={(r) => {
                setSelectedRoom(r);
                setModalTab('book');
              }}
            />
          ))}
        </div>
      )}

      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          open={Boolean(selectedRoom)}
          initialTab={modalTab}
          onClose={() => {
            setSelectedRoom(null);
            fetchWishlist();
          }}
        />
      )}
    </div>
  );
}
