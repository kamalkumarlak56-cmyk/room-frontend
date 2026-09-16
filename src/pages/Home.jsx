// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import API from '../api/axios';
import RoomCard from '../components/RoomCard';
import { Search, MapPin, IndianRupee, Loader2 } from 'lucide-react';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    city: '',
    maxRent: '',
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.city) params.append('city', filters.city);
      if (filters.maxRent) params.append('maxRent', filters.maxRent);

      const { data } = await API.get(`/rooms?${params.toString()}`);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Hero / Filter Section */}
      <div className="bg-slate-900 border-b border-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Find Your Next Space with <span className="text-sky-400">Room Radar</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Verified room listings directly from owners and verified by administrators.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search title..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="City (e.g. Haridwar)"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="number"
              placeholder="Max Rent"
              value={filters.maxRent}
              onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 font-medium py-2 rounded-lg text-sm transition"
          >
            Search Rooms
          </button>
        </form>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-xl font-bold mb-6">Available Listings</h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading listings...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-slate-400">No approved rooms match your current search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}