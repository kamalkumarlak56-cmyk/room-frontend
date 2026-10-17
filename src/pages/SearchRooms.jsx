// client/src/pages/SearchRooms.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import RoomCard from '../components/RoomCard';
import RoomDetailsModal from '../components/RoomDetailsModal';
import { Badge, Button, Input, Select } from '../components/ui/shadcn';
import {
  Search,
  MapPin,
  IndianRupee,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  RotateCcw,
  Building,
} from 'lucide-react';

const ROOM_TYPES = ['all', '1RK', '1BHK', '2BHK', '3BHK', 'Single Room', 'PG/Shared'];
const SUITABLE_OPTIONS = ['all', 'Students', 'Job Employees', 'Women', 'Family', 'Anyone'];
const QUICK_FACILITIES = [
  'Parking',
  'Camera',
  'AC',
  'Cooler',
  'Washing Machine',
  'RO',
  'WiFi',
  'Geyser',
];

export default function SearchRooms() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'owner') {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    roomType: 'all',
    maxRent: '',
    furnishingStatus: 'all',
    bedConfiguration: 'all',
    suitableFor: 'all',
    electricityIncluded: '',
    drinkingAllowed: false,
    smokingAllowed: false,
    lateNightAllowed: false,
    facilities: [],
  });

  const fetchRooms = async (overrideFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (overrideFilters.keyword) params.append('keyword', overrideFilters.keyword);
      if (overrideFilters.location) params.append('location', overrideFilters.location);
      if (overrideFilters.roomType && overrideFilters.roomType !== 'all') {
        params.append('roomType', overrideFilters.roomType);
      }
      if (overrideFilters.maxRent) params.append('maxRent', overrideFilters.maxRent);
      if (
        overrideFilters.furnishingStatus &&
        overrideFilters.furnishingStatus !== 'all'
      ) {
        params.append('furnishingStatus', overrideFilters.furnishingStatus);
      }
      if (
        overrideFilters.bedConfiguration &&
        overrideFilters.bedConfiguration !== 'all'
      ) {
        params.append('bedConfiguration', overrideFilters.bedConfiguration);
      }
      if (overrideFilters.suitableFor && overrideFilters.suitableFor !== 'all') {
        params.append('suitableFor', overrideFilters.suitableFor);
      }
      if (overrideFilters.electricityIncluded) {
        params.append('electricityIncluded', overrideFilters.electricityIncluded);
      }
      if (overrideFilters.drinkingAllowed) params.append('drinkingAllowed', 'true');
      if (overrideFilters.smokingAllowed) params.append('smokingAllowed', 'true');
      if (overrideFilters.lateNightAllowed) params.append('lateNightAllowed', 'true');
      if (overrideFilters.facilities?.length > 0) {
        params.append('facilities', overrideFilters.facilities.join(','));
      }

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
    fetchRooms(filters);
  };

  const handleReset = () => {
    const clean = {
      keyword: '',
      location: '',
      roomType: 'all',
      maxRent: '',
      furnishingStatus: 'all',
      bedConfiguration: 'all',
      suitableFor: 'all',
      electricityIncluded: '',
      drinkingAllowed: false,
      smokingAllowed: false,
      lateNightAllowed: false,
      facilities: [],
    };
    setFilters(clean);
    fetchRooms(clean);
  };

  const toggleFacility = (fac) => {
    const exists = filters.facilities.includes(fac);
    const updated = exists
      ? filters.facilities.filter((f) => f !== fac)
      : [...filters.facilities, fac];
    const nextFilters = { ...filters, facilities: updated };
    setFilters(nextFilters);
    fetchRooms(nextFilters);
  };

  const handleQuickRoomType = (type) => {
    const nextFilters = { ...filters, roomType: type };
    setFilters(nextFilters);
    fetchRooms(nextFilters);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white pb-20">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-b from-[#141519] via-[#0f1013] to-[#0a0b0d] border-b border-neutral-800 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5efe6]/10 border border-[#f5efe6]/25 text-[#f5efe6] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#f5efe6]" /> 100% Broker-Free Direct Rentals
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Search Verified Available Rooms
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
            Browse verified listings directly from property owners. Filter by rent, location, room type, and facilities.
          </p>

          {/* Search & Filter Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-6 text-left bg-[#0f1013] border border-neutral-800 p-4 rounded-2xl shadow-2xl space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Room Type */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Room Type
                </label>
                <Select
                  value={filters.roomType}
                  onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                >
                  <option value="all">All Types (1RK, 1BHK, 2BHK)</option>
                  <option value="1RK">1RK</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="Single Room">Single Room</option>
                  <option value="PG/Shared">PG / Shared</option>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Location / City / Area
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-3" />
                  <Input
                    type="text"
                    placeholder="City or Area..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Max Rent */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Max Monthly Price (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-[#d8cdbf] absolute left-3 top-3" />
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={filters.maxRent}
                    onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Suitable For */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Suitable For
                </label>
                <Select
                  value={filters.suitableFor}
                  onChange={(e) => setFilters({ ...filters, suitableFor: e.target.value })}
                >
                  <option value="all">Anyone / All Tenants</option>
                  <option value="Students">Students</option>
                  <option value="Job Employees">Job Employees</option>
                  <option value="Women">Women / Girls</option>
                  <option value="Family">Family</option>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <Button type="submit" variant="default" className="flex-1">
                  <Search className="w-4 h-4" /> Search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  title="More Filters"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-neutral-400 mr-1">Quick:</span>
                {ROOM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleQuickRoomType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                      filters.roomType === type
                        ? 'bg-[#f5efe6] text-neutral-950 font-bold border-[#d8cdbf]'
                        : 'bg-[#121316] text-neutral-300 hover:bg-neutral-800 border-neutral-800'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Collapsible Advanced Filters */}
            {showAdvanced && (
              <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-2">
                  <p className="font-semibold text-neutral-300">Furnishing & Beds</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filters.furnishingStatus}
                      onChange={(e) =>
                        setFilters({ ...filters, furnishingStatus: e.target.value })
                      }
                    >
                      <option value="all">Any Furnishing</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </Select>
                    <Select
                      value={filters.bedConfiguration}
                      onChange={(e) =>
                        setFilters({ ...filters, bedConfiguration: e.target.value })
                      }
                    >
                      <option value="all">Any Beds</option>
                      <option value="1 Bed">1 Bed</option>
                      <option value="2 Beds">2 Beds</option>
                      <option value="3 Beds">3 Beds</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-neutral-300">Facilities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_FACILITIES.map((fac) => {
                      const active = filters.facilities.includes(fac);
                      return (
                        <button
                          key={fac}
                          type="button"
                          onClick={() => toggleFacility(fac)}
                          className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            active
                              ? 'bg-[#f5efe6]/15 border-[#d8cdbf] text-[#f5efe6] font-semibold'
                              : 'bg-[#121316] border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {fac}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-neutral-300">House Rules</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'drinkingAllowed', label: 'Drinking Allowed' },
                      { key: 'smokingAllowed', label: 'Smoking Allowed' },
                      { key: 'lateNightAllowed', label: 'Late Night Allowed' },
                    ].map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          const next = { ...filters, [r.key]: !filters[r.key] };
                          setFilters(next);
                          fetchRooms(next);
                        }}
                        className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          filters[r.key]
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                            : 'bg-[#121316] border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#d8cdbf]" />
              Available Verified Listings
              <Badge variant="default">{rooms.length}</Badge>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified directly by landlords with 0% brokerage.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Landlords
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-[#d8cdbf]" /> Direct Chat
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24 text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8cdbf]" />
            Searching verified rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-[#121316] border border-neutral-800 rounded-2xl space-y-3">
            <p className="text-neutral-300 font-medium">
              No approved rooms match your current search criteria.
            </p>
            <p className="text-xs text-neutral-400">
              Try adjusting your price range, location, or resetting the filters.
            </p>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset Filters
            </Button>
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
      </div>

      {/* Room Details Modal */}
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
