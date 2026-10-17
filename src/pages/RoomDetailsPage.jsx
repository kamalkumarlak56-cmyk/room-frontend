// client/src/pages/RoomDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { CURATED_GOOD_LOOKING_ROOMS } from '../components/RoomImageSlider';
import { Avatar, Button } from '../components/ui/shadcn';
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Zap,
  BedDouble,
  CheckCircle,
  Phone,
  ShieldCheck,
  Heart,
  MessageSquare,
  CreditCard,
  Camera,
  Video,
  Share2,
  Check,
  Sparkles,
  Wifi,
  Wind,
  Car,
  Flame,
  Tv,
  Lock,
  Building2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleWishlist, isWishlisted, recordSearched, refreshProfile } = useAuth();

  const [room, setRoom] = useState(location.state?.room || null);
  const [loading, setLoading] = useState(!location.state?.room);
  const [activePhoto, setActivePhoto] = useState(0);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' | 'video'
  const [paymentType, setPaymentType] = useState('token_advance');
  const [moveInDate, setMoveInDate] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [markingVisited, setMarkingVisited] = useState(false);
  const [visitedSuccess, setVisitedSuccess] = useState(false);

  // Fetch room data
  useEffect(() => {
    let isMounted = true;

    const loadRoom = async () => {
      // 1. Check if it's in curated showcase rooms
      const curatedMatch = CURATED_GOOD_LOOKING_ROOMS.find((c) => c._id === id);
      if (curatedMatch && !location.state?.room) {
        if (isMounted) {
          setRoom(curatedMatch);
          setLoading(false);
        }
      }

      // 2. Fetch from backend API
      try {
        const { data } = await API.get(`/rooms/${id}`);
        if (isMounted && data) {
          setRoom(data);
        }
      } catch (err) {
        // If not found in API and no curated match, keep existing or show error
        if (!curatedMatch && isMounted) {
          console.error('Failed to load room details', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      loadRoom();
      if (recordSearched) recordSearched(id);
      if (refreshProfile) refreshProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [id, location.state?.room]);

  const defaultImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=85';
  const images =
    room?.images && room.images.length > 0 ? room.images : [defaultImage];
  const videoUrl =
    room?.videoUrl || (room?.videos && room.videos.length > 0 ? room.videos[0] : '');

  const inWishlist = room?._id && isWishlisted ? isWishlisted(room._id) : false;

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (room?._id) await toggleWishlist(room._id);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleMarkVisited = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!room?._id) return;
    try {
      setMarkingVisited(true);
      await API.post(`/auth/visited/${room._id}`, { notes: 'Visited listing in detail page' });
      setVisitedSuccess(true);
      setTimeout(() => setVisitedSuccess(false), 3000);
    } catch {
      // Ignore
    } finally {
      setMarkingVisited(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!room?.owner?._id) {
      navigate('/chat');
      return;
    }
    try {
      await API.post('/chat/conversations', {
        receiverId: room.owner._id,
        initialMessage: `Hello, I am interested in your room listing: "${room.title}" (Rent: ₹${room.rent}/month). Is it still available?`,
        roomId: room._id,
      });
      navigate('/chat');
    } catch {
      navigate('/chat');
    }
  };

  const handleRazorpayBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!room?._id) return;

    setPaying(true);
    setPaymentSuccess(null);

    try {
      const { data: orderData } = await API.post('/payments/create-order', {
        roomId: room._id,
        paymentType,
        moveInDate,
      });

      if (!orderData.isSimulation && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Room Radar (0% Brokerage)',
          description: `${paymentType === 'token_advance' ? 'Token Advance' : 'Monthly Rent'} for ${room.title}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            const { data: verifyRes } = await API.post('/payments/verify', {
              bookingId: orderData.bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isSimulation: false,
            });
            setPaymentSuccess(verifyRes.booking);
            setPaying(false);
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '',
          },
          theme: {
            color: '#121316',
          },
          modal: {
            ondismiss: function () {
              setPaying(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Simulation flow
        const { data: verifyRes } = await API.post('/payments/verify', {
          bookingId: orderData.bookingId,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_rzp_${Date.now()}`,
          razorpay_signature: 'verified_razorpay_test_sig',
          isSimulation: true,
        });
        setPaymentSuccess(verifyRes.booking);
        setPaying(false);
      }
    } catch (err) {
      setPaying(false);
      alert(err.response?.data?.message || 'Payment initialization failed');
    }
  };

  const renderFacilityIcon = (facility) => {
    const facLower = (facility || '').toLowerCase();
    if (facLower.includes('wifi') || facLower.includes('internet')) {
      return <Wifi className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
    }
    if (facLower.includes('ac') || facLower.includes('air')) {
      return <Wind className="w-4 h-4 text-teal-600 dark:text-teal-300" />;
    }
    if (facLower.includes('parking')) {
      return <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    if (facLower.includes('ro') || facLower.includes('water')) {
      return <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (facLower.includes('camera') || facLower.includes('cctv') || facLower.includes('security')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (facLower.includes('geyser') || facLower.includes('heater')) {
      return <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
    }
    if (facLower.includes('tv')) {
      return <Tv className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    }
    return <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 gap-3 py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800 dark:text-[#d8cdbf]" />
        <p className="text-sm font-semibold">Loading verified room & owner details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-4 bg-white dark:bg-[#121316] p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
          <Building2 className="w-12 h-12 text-neutral-400 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Listing Not Found</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            This room listing may have been rented out or is currently pending review.
          </p>
          <Button variant="default" onClick={() => navigate('/')} className="mt-2">
            Back to Available Rooms
          </Button>
        </div>
      </div>
    );
  }

  const facilities = room.facilities?.length > 0 ? room.facilities : room.amenities || [];
  const activeRules = [];
  if (room.rules?.drinkingAllowed) activeRules.push('Drinking Allowed');
  if (room.rules?.smokingAllowed) activeRules.push('Smoking Allowed');
  if (room.rules?.lateNightAllowed) activeRules.push('Late Night Entry OK');
  if (room.rules?.visitorsAllowed) activeRules.push('Visitors Allowed');
  if (room.rules?.nonVegAllowed) activeRules.push('Non-Veg Cooking OK');
  if (room.rules?.petsAllowed) activeRules.push('Pets Friendly');

  const photoLabels = [
    'Building & Facade',
    'Main Bedroom',
    'Kitchen & Dining',
    'Attached Bathroom',
    'Balcony / Terrace',
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-body)] py-6 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ========================================================
            TOP NAVIGATION & HEADER BAR
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer shadow-xs flex items-center justify-center"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-300 dark:border-neutral-700 text-xs font-black uppercase tracking-wider shadow-xs">
                  {room.roomType || '1RK'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Admin Verified Listing
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#f5efe6] dark:bg-neutral-800 text-neutral-950 dark:text-[#f5efe6] border border-[#d8cdbf] dark:border-neutral-700 text-xs font-bold shadow-xs">
                  0% Brokerage
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1 leading-tight">
                {room.title}
              </h1>
            </div>
          </div>

          {/* Quick Action Badges: Wishlist & Share */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={handleWishlist}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs ${
                inWishlist
                  ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-white' : 'text-rose-500'}`} />
              <span>{inWishlist ? 'Saved in Wishlist' : 'Save Property'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-neutral-500" />
                  <span>Share Listing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================
            MAIN DETAILS GRID: LEFT DETAILS (7 cols) + RIGHT SIDEBAR (5 cols)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================
              LEFT COLUMN (7 Columns on lg): Gallery & Full Details
             ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Photo & Video Showcase */}
            <div className="bg-white dark:bg-[#121316] rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xl">
              {/* Media Mode Tabs (Photos / Video Tour) */}
              {videoUrl && (
                <div className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      mediaType === 'photo'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Property Photos ({images.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      mediaType === 'video'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4 text-sky-500" />
                    Video Tour
                  </button>
                </div>
              )}

              {/* Main Media Viewer */}
              <div
                data-card-media="true"
                className="relative h-80 sm:h-96 md:h-[450px] w-full bg-neutral-950 overflow-hidden group"
              >
                {mediaType === 'photo' ? (
                  <>
                    <img
                      src={images[activePhoto] || defaultImage}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Photo Label Pill */}
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                      <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md">
                        {photoLabels[activePhoto] || `View ${activePhoto + 1}`} ({activePhoto + 1} of {images.length})
                      </span>
                    </div>
                  </>
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>

              {/* Thumbnail Selector Strip */}
              {images.length > 1 && (
                <div className="p-3.5 bg-neutral-50/70 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActivePhoto(idx);
                        setMediaType('photo');
                      }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer shadow-xs ${
                        activePhoto === idx && mediaType === 'photo'
                          ? 'border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Room Specifications Card */}
            <div className="bg-white dark:bg-[#121316] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Property Specifications & Overview
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                      Room Configuration
                    </span>
                    <p className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-neutral-600 dark:text-[#d8cdbf]" />
                      {room.roomType || '1RK'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                      Furnishing Status
                    </span>
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                      {room.furnishingStatus || 'Furnished'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                      Bed Setup
                    </span>
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                      {room.bedConfiguration || '1 Bed'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                      Suitable For
                    </span>
                    <p className="text-sm font-black text-neutral-900 dark:text-white truncate">
                      {(room.suitableFor || ['Anyone']).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                  About this Property
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">
                  {room.description || room.tagline || 'Spacious, well-ventilated verified room available directly from the landlord.'}
                </p>
              </div>

              {/* Location Card */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                  Exact Location & Landmark
                </h3>
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-rose-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      {room.location?.landmark ? `${room.location.landmark}, ` : ''}
                      {room.location?.address}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {room.location?.city}, {room.location?.state} - {room.location?.pincode}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.location?.address}, ${room.location?.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-[#d8cdbf] hover:underline flex-shrink-0 pt-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Amenities & Facilities */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                  Included Amenities & Facilities ({facilities.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
                    >
                      <div className="w-7 h-7 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        {renderFacilityIcon(fac)}
                      </div>
                      <span className="truncate">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              {activeRules.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                    House Rules & Permissions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeRules.map((rule, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                      >
                        ✓ {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN (5 Columns on lg): Owner Details & Booking Hub
             ======================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* 1. Price & Financial Breakdown Card */}
            <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-0.5">
                    Monthly Rent
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-[#f5efe6] flex items-center">
                      <IndianRupee className="w-7 h-7 -mr-1 text-neutral-700 dark:text-[#d8cdbf]" />
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
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 inline-block">
                      ₹{Number(room.securityDeposit).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Electricity:
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {room.electricityIncluded
                      ? 'Included in Rent'
                      : `₹${room.electricityRatePerUnit || 8}/unit`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Brokerage Fee:
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹0 (100% Free)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Full Owner & Landlord Profile Card (Prominent) */}
            <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={room.owner?.profilePic}
                    name={room.owner?.name || 'Landlord'}
                    size="lg"
                    className="border-2 border-emerald-500/40"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                      {room.owner?.name || 'Direct Property Landlord'}
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Room Owner
                    </p>
                    {room.owner?.email && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {room.owner.email}
                      </p>
                    )}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                  Direct Contact
                </span>
              </div>

              {/* Owner Phone with Direct Call & Copy buttons */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      Landlord Contact
                    </span>
                    <a
                      href={`tel:${room.owner?.phone || '+919876543210'}`}
                      className="text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:underline truncate block"
                    >
                      {room.owner?.phone || '+91 98765 43210'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a href={`tel:${room.owner?.phone || '+919876543210'}`}>
                    <Button variant="success" size="sm" className="text-xs font-bold">
                      Call
                    </Button>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(room.owner?.phone || '+919876543210')}
                    className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer text-xs"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Chat Online with Landlord */}
              <Button
                variant="default"
                size="default"
                onClick={handleStartChat}
                className="w-full text-xs sm:text-sm font-bold cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-1 text-neutral-900" />
                Chat Online with Landlord
              </Button>
            </div>

            {/* 3. Instant Reserve / Booking Box */}
            <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Reserve Room Instantly
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Razorpay Protected
                </span>
              </div>

              {paymentSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Room Successfully Reserved!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Booking ID: <span className="font-mono">{paymentSuccess._id}</span>
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="mt-2 text-xs"
                  >
                    View in Profile & Bookings
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Expected Move-in Date
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Reservation Deposit Type
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="token_advance">Token Advance (₹2,000 hold)</option>
                      <option value="full_rent">Full 1st Month Rent (₹{room.rent})</option>
                    </select>
                  </div>

                  <Button
                    variant="success"
                    size="default"
                    onClick={handleRazorpayBooking}
                    disabled={paying || room.isAvailable === false}
                    className="w-full text-xs sm:text-sm font-bold cursor-pointer shadow-md mt-1"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        Processing Razorpay...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1.5" />
                        {paymentType === 'token_advance'
                          ? 'Pay Token ₹2,000 & Reserve'
                          : `Pay ₹${Number(room.rent).toLocaleString('en-IN')} & Book`}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Visited Listing Tracker button */}
              <button
                type="button"
                onClick={handleMarkVisited}
                disabled={markingVisited}
                className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {visitedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Added to Visited History
                    </span>
                  </>
                ) : (
                  <span>Mark as Visited Listing</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
