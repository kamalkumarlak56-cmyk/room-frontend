import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Avatar, Badge, Button, Dialog, Input, Label, Select } from './ui/shadcn';
import {
  MapPin,
  IndianRupee,
  Zap,
  BedDouble,
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Calendar,
  Heart,
  Check,
  Play,
  Video,
  Camera,
} from 'lucide-react';

export default function RoomDetailsModal({ room, open, onClose, initialTab = 'details' }) {
  const { user, toggleWishlist, isWishlisted, recordSearched, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [mediaMode, setMediaMode] = useState('photo'); // 'photo' | 'video'
  const [paymentType, setPaymentType] = useState('token_advance');
  const [moveInDate, setMoveInDate] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [tab, setTab] = useState(initialTab);
  const [markingVisited, setMarkingVisited] = useState(false);
  const [visitedSuccess, setVisitedSuccess] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setMediaMode('photo');
  }, [room?._id]);

  useEffect(() => {
    if (room?._id && open && recordSearched) {
      recordSearched(room._id);
    }
    if (open && refreshProfile) {
      refreshProfile();
    }
  }, [room?._id, open]);

  const hasActiveBooking = Boolean(user?.paidBookings && user.paidBookings.length > 0);
  const isRoomUnavailable = room?.isAvailable === false;

  const handleMarkVisited = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    try {
      setMarkingVisited(true);
      await API.post(`/auth/visited/${room._id}`, { notes: 'Visited listing in app' });
      setVisitedSuccess(true);
      setTimeout(() => setVisitedSuccess(false), 3000);
    } catch {
      // Ignore
    } finally {
      setMarkingVisited(false);
    }
  };

  if (!room) return null;

  const defaultImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
  const images = room.images?.length > 0 ? room.images : [defaultImage];
  const activeVideoUrl = room.videoUrl || (room.videos && room.videos.length > 0 ? room.videos[0] : '');

  const getImageLabel = (index, total) => {
    if (total >= 5) {
      const labels = ['Building Exterior', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony / Terrace'];
      return labels[index] || `Photo ${index + 1}`;
    }
    if (total === 4) {
      const labels = ['Building Exterior', 'Bedroom', 'Kitchen', 'Bathroom'];
      return labels[index] || `Photo ${index + 1}`;
    }
    return `Photo ${index + 1}`;
  };

  const facilities =
    room.facilities?.length > 0 ? room.facilities : room.amenities || [];

  const tokenAmount = Math.max(1000, Math.round(Number(room.rent) * 0.25));
  const payableAmount = paymentType === 'token_advance' ? tokenAmount : Number(room.rent);

  const handleStartChat = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    const ownerId = room.owner?._id || room.owner;
    if (ownerId === user._id) {
      alert('This is your own room listing!');
      return;
    }

    try {
      setSendingMsg(true);
      const { data: conv } = await API.post('/chat/conversations', {
        receiverId: ownerId,
        roomId: room._id,
        initialMessage:
          quickMessage.trim() ||
          `Hi ${room.owner?.name || 'Landlord'}, I am interested in your ${room.roomType} room "${room.title}" (₹${room.rent}/month). Is it available?`,
      });
      setSendingMsg(false);
      onClose();
      navigate(`/chat?conversationId=${conv._id}`);
    } catch (err) {
      setSendingMsg(false);
      alert(err.response?.data?.message || 'Could not start chat');
    }
  };

  const handleRazorpayBooking = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    setPaying(true);
    setPaymentSuccess(null);

    try {
      const { data: orderData } = await API.post('/payments/create-order', {
        roomId: room._id,
        paymentType,
        moveInDate,
      });

      // If real Razorpay key is configured and SDK is loaded, launch Razorpay Checkout modal
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
            color: '#0ea5e9',
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
        // Sandbox / Test Razorpay Checkout verification flow
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={room.title}
      subtitle={`${room.roomType || '1RK'} • ${room.location?.address}, ${room.location?.city}, ${room.location?.state} (${room.location?.pincode})`}
      maxWidth="max-w-4xl"
    >
      {/* Top Mode Switcher & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={tab === 'details' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTab('details')}
          >
            Room Overview & Specs
          </Button>
          <Button
            variant={tab === 'book' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTab('book')}
          >
            <CreditCard className="w-3.5 h-3.5" /> Book via Razorpay (0% Broker)
          </Button>
          <Button
            variant={tab === 'chat' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTab('chat')}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Inbuilt Chat with Landlord
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkVisited}
            disabled={markingVisited}
            className="text-xs"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {visitedSuccess ? 'Marked Visited!' : 'Mark Visited'}
          </Button>
          <Button
            variant={isWishlisted && isWishlisted(room._id) ? 'destructive' : 'secondary'}
            size="sm"
            onClick={() => toggleWishlist && toggleWishlist(room._id)}
            className="text-xs"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted && isWishlisted(room._id) ? 'fill-current' : ''
              }`}
            />
            {isWishlisted && isWishlisted(room._id) ? 'Wishlisted' : 'Wishlist'}
          </Button>
        </div>
      </div>

      {tab === 'details' && (
        <div className="space-y-6">
          {/* Media Gallery (Photos & Video Tour) */}
          <div className="space-y-2">
            <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden bg-[#0a0b0d] border border-neutral-800">
              {mediaMode === 'video' && activeVideoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <>
                  <img
                    src={images[activeImage] || defaultImage}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-neutral-900/85 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-neutral-200 border border-neutral-700/80 shadow-md">
                    {getImageLabel(activeImage, images.length)}
                  </div>
                </>
              )}

              {/* Badges on Top Left */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="default" className="text-xs px-3 py-1 bg-[#f5efe6] text-neutral-950 font-bold border border-[#d8cdbf]">
                  {room.roomType || '1RK'}
                </Badge>
                <Badge variant="success" className="text-xs px-3 py-1 bg-neutral-900/90 text-neutral-200 border-neutral-700">
                  {room.furnishingStatus || 'Semi-Furnished'} ({room.bedConfiguration || '1 Bed'})
                </Badge>
              </div>

              {/* Mode Toggle on Top Right if Video is available */}
              {activeVideoUrl && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setMediaMode('photo')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      mediaMode === 'photo'
                        ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Photos ({images.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaMode('video')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      mediaMode === 'video'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Video Tour
                  </button>
                </div>
              )}
            </div>

            {/* Media Thumbnails: Video + Photos */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeVideoUrl && (
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`h-16 w-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer relative bg-neutral-900 flex flex-col items-center justify-center ${
                    mediaMode === 'video'
                      ? 'border-sky-400 ring-2 ring-sky-400/30'
                      : 'border-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                  title="Watch Video Tour"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold text-sky-300 mt-1">Video Tour</span>
                </button>
              )}

              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMediaMode('photo');
                    setActiveImage(i);
                  }}
                  className={`h-16 w-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer relative ${
                    mediaMode === 'photo' && activeImage === i
                      ? 'border-[#d8cdbf] ring-2 ring-[#d8cdbf]/30'
                      : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                  title={getImageLabel(i, images.length)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-neutral-300 text-center truncate px-1 py-0.5">
                    {getImageLabel(i, images.length)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0f1013] border border-neutral-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-neutral-400">Monthly Rent</p>
              <p className="text-lg font-extrabold text-[#f5efe6] flex items-center mt-0.5">
                <IndianRupee className="w-4 h-4 text-[#d8cdbf]" />
                {Number(room.rent).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-[#0f1013] border border-neutral-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-neutral-400">Electricity Bill</p>
              <p className="text-sm font-bold text-amber-300 flex items-center gap-1 mt-1">
                <Zap className="w-4 h-4 text-amber-400" />
                {room.electricityIncluded
                  ? 'Included in Rent'
                  : `Excluded (₹${room.electricityRatePerUnit || 8}/unit)`}
              </p>
            </div>

            <div className="bg-[#0f1013] border border-neutral-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-neutral-400">Furnishing & Beds</p>
              <p className="text-sm font-bold text-white flex items-center gap-1 mt-1">
                <BedDouble className="w-4 h-4 text-[#d8cdbf]" />
                {room.furnishingStatus} • {room.bedConfiguration}
              </p>
            </div>

            <div className="bg-[#0f1013] border border-neutral-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-neutral-400">Brokerage Fee</p>
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-1">
                <Sparkles className="w-4 h-4 text-emerald-400" /> ₹0 (No Broker)
              </p>
            </div>
          </div>

          {/* Description & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-white">About this Room</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Full Address: {room.location?.address}
                  {room.location?.landmark ? ` (Near ${room.location.landmark})` : ''},{' '}
                  {room.location?.city}, {room.location?.state} - {room.location?.pincode}
                </p>
              </div>
            </div>

            {/* Ideal For Tenants */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> Preferred Tenants
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(room.suitableFor?.length ? room.suitableFor : ['Anyone']).map((item, i) => (
                  <Badge key={i} variant="purple" className="text-xs px-2.5 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
              {room.securityDeposit > 0 && (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                  Security Deposit:{' '}
                  <span className="text-white font-semibold">
                    ₹{Number(room.securityDeposit).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Facilities & House Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-3">
                Room Facilities & Appliances
              </h4>
              {facilities.length === 0 ? (
                <p className="text-xs text-slate-500">Standard basic facilities included</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      {fac}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-3">
                House Rules & Other Permissions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Drinking Allowed', allowed: room.rules?.drinkingAllowed },
                  { label: 'Smoking Allowed', allowed: room.rules?.smokingAllowed },
                  { label: 'Late Night Entry', allowed: room.rules?.lateNightAllowed },
                  {
                    label: 'Visitors Allowed',
                    allowed: room.rules?.visitorsAllowed ?? true,
                  },
                  { label: 'Pets Allowed', allowed: room.rules?.petsAllowed },
                  {
                    label: 'Non-Veg Allowed',
                    allowed: room.rules?.nonVegAllowed ?? true,
                  },
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      rule.allowed
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    {rule.allowed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Direct Landlord Card */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={room.owner?.profilePic}
                name={room.owner?.name || 'Landlord'}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {room.owner?.name || 'Verified Landlord'}
                  </h4>
                  <Badge variant="default">
                    <ShieldCheck className="w-3 h-3" /> Direct Owner
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1">
                  {room.owner?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {room.owner.phone}
                    </span>
                  )}
                  {room.owner?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-sky-400" /> {room.owner.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setTab('chat')}>
                <MessageSquare className="w-4 h-4 text-sky-400" /> Chat Now
              </Button>
              <Button variant="default" onClick={() => setTab('book')}>
                <CreditCard className="w-4 h-4" /> Book via Razorpay
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === 'book' && (
        <div className="space-y-5">
          {paymentSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">
                Payment Successful & Room Reserved!
              </h3>
              <p className="text-sm text-slate-300">
                Your direct payment of{' '}
                <strong className="text-emerald-400">
                  ₹{Number(paymentSuccess.amount).toLocaleString('en-IN')}
                </strong>{' '}
                for <strong>{room.title}</strong> has been verified with 0% brokerage fee.
              </p>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-w-md mx-auto text-xs text-slate-400 space-y-1 text-left">
                <p>
                  <strong className="text-slate-200">Order ID:</strong>{' '}
                  {paymentSuccess.razorpayOrderId}
                </p>
                <p>
                  <strong className="text-slate-200">Payment ID:</strong>{' '}
                  {paymentSuccess.razorpayPaymentId}
                </p>
                <p>
                  <strong className="text-slate-200">Landlord:</strong>{' '}
                  {room.owner?.name} ({room.owner?.phone || room.owner?.email})
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="secondary" onClick={handleStartChat}>
                  <MessageSquare className="w-4 h-4" /> Message Landlord
                </Button>
                <Button variant="default" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Razorpay Direct Landlord Booking
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pay directly to reserve this {room.roomType} with zero third-party commission
                  </p>
                </div>
                <Badge variant="success">100% Secure • Razorpay</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Select Payment Option</Label>
                  <Select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="token_advance">
                      Token Advance (25% — ₹{tokenAmount.toLocaleString('en-IN')})
                    </option>
                    <option value="full_rent">
                      Full 1st Month Rent (₹{Number(room.rent).toLocaleString('en-IN')})
                    </option>
                  </Select>
                </div>

                <div>
                  <Label>Expected Move-In Date</Label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <Input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Room Rent</span>
                  <span className="text-white">₹{Number(room.rent).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Electricity Terms</span>
                  <span className="text-amber-400">
                    {room.electricityIncluded
                      ? 'Included in Rent'
                      : `₹${room.electricityRatePerUnit || 8} / unit`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Third-Party Broker Fee</span>
                  <span className="text-emerald-400 font-semibold">₹0 (Saved!)</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-base">
                  <span className="text-white">Payable Now via Razorpay</span>
                  <span className="text-sky-400">
                    ₹{payableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {isRoomUnavailable && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-rose-200">Room Currently Occupied</p>
                    <p>This room has already been reserved and is unavailable for new bookings.</p>
                  </div>
                </div>
              )}

              {hasActiveBooking && (
                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-200 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-sky-100">Active Stay Restriction</p>
                    <p>
                      You already have an active booked room in Room Radar. Each user can book only one room at once. Visit your Profile to view and manage your current stay.
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="default"
                size="lg"
                disabled={paying || isRoomUnavailable || hasActiveBooking}
                onClick={handleRazorpayBooking}
                className="w-full"
              >
                <CreditCard className="w-4 h-4" />
                {paying
                  ? 'Processing Razorpay Checkout...'
                  : isRoomUnavailable
                  ? 'Room is Occupied'
                  : hasActiveBooking
                  ? 'One Room Booking Limit Reached'
                  : `Pay ₹${payableAmount.toLocaleString('en-IN')} with Razorpay`}
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <form onSubmit={handleStartChat} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Avatar
              src={room.owner?.profilePic}
              name={room.owner?.name || 'Landlord'}
              size="md"
            />
            <div>
              <h4 className="text-sm font-bold text-white">
                Chat Directly with {room.owner?.name || 'Landlord'}
              </h4>
              <p className="text-xs text-slate-400">
                Discuss visit timings, rent, or facilities directly inside Room Radar Chat
              </p>
            </div>
          </div>

          <div>
            <Label>Your Message to Landlord</Label>
            <textarea
              rows={3}
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              placeholder={`Hi ${room.owner?.name || 'Landlord'}, I am interested in your ${room.roomType} room "${room.title}". Can I schedule a visit?`}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <Button type="submit" disabled={sendingMsg} className="w-full">
            <MessageSquare className="w-4 h-4" />
            {sendingMsg ? 'Opening Chat...' : 'Send Message & Open Live Chat'}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
