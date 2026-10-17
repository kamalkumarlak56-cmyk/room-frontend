// client/src/components/RoomImageSlider.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  IndianRupee,
  MessageSquare,
  CreditCard,
  Eye,
  ShieldCheck,
  Sparkles,
  BedDouble,
  Wifi,
  Wind,
  Car,
  Zap,
  CheckCircle,
  Users,
  Camera,
  Flame,
  Tv,
} from 'lucide-react';
import { Button } from './ui/shadcn';

// Curated high-aesthetic room listings with multiple interior & room photos
export const CURATED_GOOD_LOOKING_ROOMS = [
  {
    _id: 'featured-1',
    title: 'Luxury 2BHK Furnished Apartment with Balcony',
    roomType: '2BHK',
    rent: 18500,
    securityDeposit: 25000,
    electricityIncluded: true,
    electricityRatePerUnit: 0,
    furnishingStatus: 'Furnished',
    bedConfiguration: '2 Beds',
    suitableFor: ['Family', 'Job Employees', 'Anyone'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=85',
    ],
    facilities: ['AC', 'WiFi', 'Parking', 'RO', 'Washing Machine', 'Geyser', 'Camera'],
    rules: {
      drinkingAllowed: false,
      smokingAllowed: false,
      lateNightAllowed: true,
      visitorsAllowed: true,
      nonVegAllowed: true,
    },
    location: {
      address: 'Green Glen Layout, Bellandur Outer Ring Road',
      landmark: 'Near EcoSpace & Embassy TechVillage',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
    },
    tagline: 'Sunlit designer living with 100% power backup, modular kitchen & spacious balcony',
  },
  {
    _id: 'featured-2',
    title: 'Aesthetic 1BHK Studio with Workstation & AC',
    roomType: '1BHK',
    rent: 12500,
    securityDeposit: 15000,
    electricityIncluded: false,
    electricityRatePerUnit: 8,
    furnishingStatus: 'Furnished',
    bedConfiguration: '1 Bed',
    suitableFor: ['Students', 'Job Employees', 'Women'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85',
    ],
    facilities: ['WiFi', 'AC', 'RO', 'Geyser', 'Camera', 'Cooler'],
    rules: {
      drinkingAllowed: false,
      smokingAllowed: false,
      lateNightAllowed: true,
      visitorsAllowed: true,
      nonVegAllowed: true,
    },
    location: {
      address: 'Lane 4, Koregaon Park North Main Road',
      landmark: 'Behind Osho Garden & German Bakery',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
    },
    tagline: 'Chic Scandinavian decor with high-speed fiber WiFi and quiet, leafy neighborhood',
  },
  {
    _id: 'featured-3',
    title: 'Spacious 1RK Modern Room with Attached Washroom',
    roomType: '1RK',
    rent: 7500,
    securityDeposit: 8000,
    electricityIncluded: true,
    electricityRatePerUnit: 0,
    furnishingStatus: 'Semi-Furnished',
    bedConfiguration: '1 Bed',
    suitableFor: ['Students', 'Job Employees', 'Anyone'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85',
    ],
    facilities: ['WiFi', 'RO', 'Geyser', 'Parking', 'Cooler', 'Camera'],
    rules: {
      drinkingAllowed: false,
      smokingAllowed: false,
      lateNightAllowed: false,
      visitorsAllowed: true,
      nonVegAllowed: true,
    },
    location: {
      address: 'Block B, Sector 62, Near Electronic City Metro',
      landmark: 'Walking distance to Stellar IT Park & Fortis',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
    },
    tagline: 'Private entrance, ventilated room with 24/7 water supply and direct metro connectivity',
  },
  {
    _id: 'featured-4',
    title: 'Executive 3BHK Penthouse Suite in Gated Society',
    roomType: '3BHK',
    rent: 28000,
    securityDeposit: 40000,
    electricityIncluded: false,
    electricityRatePerUnit: 9,
    furnishingStatus: 'Furnished',
    bedConfiguration: '3 Beds',
    suitableFor: ['Family', 'Job Employees'],
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=85',
    ],
    facilities: ['AC', 'WiFi', 'Parking', 'Camera', 'Washing Machine', 'RO', 'Geyser'],
    rules: {
      drinkingAllowed: true,
      smokingAllowed: false,
      lateNightAllowed: true,
      visitorsAllowed: true,
      nonVegAllowed: true,
    },
    location: {
      address: 'Tower B, 14th Floor, DLF Phase 2 Cyber City',
      landmark: 'Near Cyber Hub & Belvedere Towers Metro',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    },
    tagline: 'High-rise balcony city view, modular Italian kitchen, gym access and covered parking',
  },
  {
    _id: 'featured-5',
    title: 'Premium Coliving Suite with Housekeeping & WiFi',
    roomType: 'Single Room',
    rent: 9800,
    securityDeposit: 10000,
    electricityIncluded: true,
    electricityRatePerUnit: 0,
    furnishingStatus: 'Furnished',
    bedConfiguration: '1 Bed',
    suitableFor: ['Students', 'Job Employees', 'Women', 'Anyone'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
    ],
    facilities: ['WiFi', 'AC', 'Washing Machine', 'RO', 'Camera', 'Geyser', 'Parking'],
    rules: {
      drinkingAllowed: false,
      smokingAllowed: false,
      lateNightAllowed: true,
      visitorsAllowed: true,
      nonVegAllowed: true,
    },
    location: {
      address: '12th Main Road, Indiranagar',
      landmark: 'Close to 100ft Road, Cafes & Metro',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    tagline: 'Private luxury bedroom, daily housekeeping, 300 Mbps WiFi & community lounge',
  },
];

export default function RoomImageSlider({
  rooms = [],
  onViewDetails,
  onChat,
  _onBook,
}) {
  // Merge approved database rooms that have photos with curated showcase rooms
  const displayRooms = React.useMemo(() => {
    const dbApprovedRooms = (rooms || []).filter((r) => r.status === 'approved');

    if (dbApprovedRooms.length > 0) {
      const normalizedDb = dbApprovedRooms.map((r, idx) => {
        const fallbackCurated =
          CURATED_GOOD_LOOKING_ROOMS[idx % CURATED_GOOD_LOOKING_ROOMS.length];
        const hasValidImg =
          Array.isArray(r.images) &&
          r.images.length > 0 &&
          r.images[0] &&
          !r.images[0].startsWith('data:');

        return {
          ...r,
          images: hasValidImg ? r.images : fallbackCurated.images,
          tagline: r.description?.slice(0, 95) || fallbackCurated.tagline,
        };
      });

      const combined = [...normalizedDb];
      CURATED_GOOD_LOOKING_ROOMS.forEach((c) => {
        if (!combined.some((item) => item.title === c.title)) {
          combined.push(c);
        }
      });
      return combined.slice(0, 6);
    }

    return CURATED_GOOD_LOOKING_ROOMS;
  }, [rooms]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhotoByRoom, setActivePhotoByRoom] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayRooms.length);
  }, [displayRooms.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayRooms.length) % displayRooms.length);
  }, [displayRooms.length]);

  // Autoplay: exactly every 4 seconds next room comes, slides right to left, pauses on hover
  useEffect(() => {
    if (displayRooms.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayRooms.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, displayRooms.length]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    const node = sliderRef.current;
    if (node) {
      node.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (node) node.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  // Facility icon renderer
  const renderFacilityIcon = (facility) => {
    const facLower = facility.toLowerCase();
    if (facLower.includes('wifi') || facLower.includes('internet')) {
      return <Wifi className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />;
    }
    if (facLower.includes('ac') || facLower.includes('air')) {
      return <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />;
    }
    if (facLower.includes('parking')) {
      return <Car className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
    if (facLower.includes('ro') || facLower.includes('water')) {
      return <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
    if (facLower.includes('camera') || facLower.includes('cctv') || facLower.includes('security')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (facLower.includes('geyser') || facLower.includes('heater')) {
      return <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />;
    }
    if (facLower.includes('tv')) {
      return <Tv className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
  };

  return (
    <div
      ref={sliderRef}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-hero-slider="true"
      className="relative w-full bg-[var(--color-bg-app)] border-b border-[var(--color-border)] outline-none select-none transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Section Header with Quick Status & Navigation */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-800 dark:text-neutral-200">
              Featured Premier Properties
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5efe6] dark:bg-neutral-800 text-neutral-900 dark:text-[#f5efe6] border border-[#d8cdbf] dark:border-neutral-700">
              0% Brokerage
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>
              {currentIndex + 1} <span className="opacity-50">/</span> {displayRooms.length}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous property"
                className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-[#f5efe6] dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next property"
                className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-[#f5efe6] dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Master Aesthetic Showcase Container (70% - 80% Height on Viewport with Physical Right-to-Left Slide) */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl dark:shadow-2xl transition-all duration-300 h-[72vh] min-h-[580px] max-h-[760px]">
          {/* Continuous Sliding Track: Slides physically move right to left when currentIndex advances */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {displayRooms.map((room, roomIdx) => {
              const imagesList =
                Array.isArray(room.images) && room.images.length > 0
                  ? room.images
                  : CURATED_GOOD_LOOKING_ROOMS[0].images;
              const photoIndex = activePhotoByRoom[room._id || roomIdx] || 0;
              const currentPhoto = imagesList[photoIndex] || imagesList[0];

              return (
                <div
                  key={room._id || roomIdx}
                  className="w-full h-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
                >
                  {/* ========================================================
                      LEFT SIDE (Cols 7 on lg): House / Room Images Showcase
                     ======================================================== */}
                  <div
                    data-slider-media="true"
                    onClick={() => navigate(`/rooms-detail/${room._id}`)}
                    className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full bg-neutral-950 overflow-hidden group flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={currentPhoto}
                      alt={room.title}
                      loading={roomIdx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={roomIdx === 0 ? 'high' : 'low'}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Atmospheric Scrim Gradients for crisp overlay text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />

                    {/* Floating Overlay Badges on Top of the Image */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          data-dark-pill="true"
                          className="px-3.5 py-1.5 rounded-xl font-black text-xs tracking-wider shadow-lg uppercase border border-neutral-300"
                          style={{ backgroundColor: '#ffffff', color: '#121316' }}
                        >
                          {room.roomType || '1BHK'}
                        </span>
                        <span
                          data-media-badge-white="true"
                          className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/25 text-xs font-semibold flex items-center gap-1.5 shadow-md"
                          style={{ color: '#ffffff' }}
                        >
                          <BedDouble className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fcd34d' }} />
                          <span style={{ color: '#ffffff' }}>
                            {room.furnishingStatus || 'Furnished'} •{' '}
                            {room.bedConfiguration || '1 Bed'}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          data-media-badge-white="true"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/95 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md border border-emerald-400/30"
                          style={{ color: '#ffffff' }}
                        >
                          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ffffff' }} />
                          <span style={{ color: '#ffffff' }}>Admin Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Image Toolbar: Photo Gallery Switcher & City Pill */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3">
                      {/* Multi-Photo Switcher for this Room */}
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20">
                        <Camera className="w-3.5 h-3.5 text-white ml-1.5 mr-0.5" />
                        {imagesList.map((_, pIdx) => {
                          const isPhotoActive = pIdx === photoIndex;
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              data-dark-pill={isPhotoActive ? 'true' : undefined}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoByRoom((prev) => ({
                                  ...prev,
                                  [room._id || roomIdx]: pIdx,
                                }));
                              }}
                              title={`View photo ${pIdx + 1}`}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                                isPhotoActive
                                  ? 'shadow-sm border-white/40'
                                  : 'hover:bg-white/10 border-transparent'
                              }`}
                              style={
                                isPhotoActive
                                  ? { backgroundColor: '#ffffff', color: '#121316' }
                                  : { color: '#e5e5e5' }
                              }
                            >
                              Photo {pIdx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* City badge */}
                      <div
                        data-media-badge-white="true"
                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold"
                        style={{ color: '#ffffff' }}
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span style={{ color: '#ffffff' }}>{room.location?.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      RIGHT SIDE (Cols 5 on lg): Room Details & Actions Only
                      (NO Owner Info - As requested by user)
                     ======================================================== */}
                  <div
                    data-slider-details="true"
                    className="lg:col-span-5 p-6 sm:p-7 lg:p-8 flex flex-col justify-between bg-white dark:bg-[#121316] text-neutral-900 dark:text-neutral-100 h-full overflow-y-auto transition-colors"
                  >
                    <div className="space-y-3.5">
                      {/* Category & Status Pill */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified Direct Listing
                        </span>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f5efe6] dark:bg-neutral-800 text-neutral-950 dark:text-[#f5efe6] border border-[#d8cdbf] dark:border-neutral-700">
                          0% Brokerage
                        </span>
                      </div>

                      {/* Room Title & Description */}
                      <div>
                        <h2
                          onClick={() => navigate(`/rooms-detail/${room._id}`)}
                          className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight leading-snug cursor-pointer hover:underline"
                        >
                          {room.title}
                        </h2>
                        {room.tagline && (
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 font-normal leading-relaxed line-clamp-2">
                            {room.tagline}
                          </p>
                        )}
                      </div>

                      {/* Location with Landmark & City */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#0a0b0d]/70 border border-[#e2dbcf] dark:border-neutral-800">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {room.location?.landmark
                              ? `${room.location.landmark}, `
                              : ''}
                            {room.location?.address}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {room.location?.city}, {room.location?.state} -{' '}
                            {room.location?.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Rent & Financial Details Highlight */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-[#e2dbcf] dark:border-neutral-800 space-y-2.5">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-0.5">
                              Monthly Rent
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-[#f5efe6] flex items-center">
                                <IndianRupee className="w-6 h-6 -mr-1 text-neutral-700 dark:text-[#d8cdbf]" />
                                {Number(room.rent).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                                / month
                              </span>
                            </div>
                          </div>

                          {room.securityDeposit ? (
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-0.5">
                                Security Deposit
                              </span>
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 inline-block">
                                ₹{Number(room.securityDeposit).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            {room.electricityIncluded
                              ? 'Electricity Included'
                              : `Electricity: ₹${room.electricityRatePerUnit || 8}/unit`}
                          </span>

                          {room.suitableFor && room.suitableFor.length > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-neutral-500 dark:text-[#d8cdbf]" />
                              For {room.suitableFor.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Amenities & Facilities Grid */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          Included Facilities & Amenities
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(room.facilities?.length > 0
                            ? room.facilities
                            : room.amenities || ['WiFi', 'AC', 'RO', 'Parking']
                          )
                            .slice(0, 6)
                            .map((fac, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                              >
                                {renderFacilityIcon(fac)}
                                {fac}
                              </span>
                            ))}

                          {(room.rules?.lateNightAllowed ||
                            room.rules?.visitorsAllowed) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                              ✓ Visitors & Night Entry OK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Buttons (Room Details / Book / Chat) */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Button
                          variant="default"
                          size="default"
                          onClick={() => navigate(`/rooms-detail/${room._id}`)}
                          className="w-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-1 text-neutral-900" />
                          View Details
                        </Button>

                        <Button
                          variant="success"
                          size="default"
                          onClick={() => navigate(`/rooms-detail/${room._id}`)}
                          className="w-full text-xs sm:text-sm font-bold cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Book / Reserve
                        </Button>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onChat && onChat(room)}
                        className="w-full text-xs font-semibold cursor-pointer border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1 text-neutral-600 dark:text-[#d8cdbf]" />
                        Chat & Inquire Online
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Frame Prev / Next Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Property Slide"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-[#f5efe6] text-white hover:text-neutral-950 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Property Slide"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-[#f5efe6] text-white hover:text-neutral-950 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Selector Strip & Indicators below Slide */}
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          {/* Clickable Room Previews */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 max-w-full">
            {displayRooms.map((room, idx) => {
              const isSelected = idx === currentIndex;
              const thumbImg =
                room.images?.[0] || CURATED_GOOD_LOOKING_ROOMS[0].images[0];
              return (
                <button
                  key={room._id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center gap-2.5 p-1.5 pr-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 border-neutral-900 dark:border-[#d8cdbf] shadow-md ring-2 ring-neutral-900/10 dark:ring-[#d8cdbf]/40'
                      : 'bg-white/80 dark:bg-[#121316] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <img
                    src={thumbImg}
                    alt={room.title}
                    loading="lazy"
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 max-w-[130px] sm:max-w-[160px]">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {room.roomType} • ₹{Number(room.rent).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {room.location?.city}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 ml-auto">
            {displayRooms.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to room ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-neutral-900 dark:bg-[#f5efe6]'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
