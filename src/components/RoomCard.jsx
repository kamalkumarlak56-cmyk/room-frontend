// client/src/components/RoomCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  IndianRupee,
  Phone,
  CheckCircle,
  Zap,
  BedDouble,
  Users,
  MessageSquare,
  CreditCard,
  Eye,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { Avatar, Button } from './ui/shadcn';

export default function RoomCard({ room, _onViewDetails, onChat, onBook }) {
  const { user, toggleWishlist, isWishlisted, recordSearched } = useAuth();
  const navigate = useNavigate();
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const defaultImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  const facilities =
    room.facilities?.length > 0 ? room.facilities : room.amenities || [];

  const activeRules = [];
  if (room.rules?.drinkingAllowed) activeRules.push('Drinking Allowed');
  if (room.rules?.smokingAllowed) activeRules.push('Smoking Allowed');
  if (room.rules?.lateNightAllowed) activeRules.push('Late Night Entry OK');
  if (room.rules?.visitorsAllowed) activeRules.push('Visitors Allowed');

  const inWishlist = isWishlisted ? isWishlisted(room._id) : false;

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setTogglingWishlist(true);
    await toggleWishlist(room._id);
    setTogglingWishlist(false);
  };

  // Clicking on card or details redirects to the room detail page
  const handleCardClick = () => {
    if (recordSearched) recordSearched(room._id);
    navigate(`/rooms-detail/${room._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="room-card-container group bg-white dark:bg-[#121316] border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* ========================================================
            IMAGE HEADER (Overlays strictly protected for visibility)
           ======================================================== */}
        <div
          data-card-media="true"
          className="relative h-56 w-full overflow-hidden bg-neutral-950"
        >
          <img
            src={room.images?.[0] || defaultImage}
            alt={room.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Deep Scrim Gradients for 100% text clarity over any photograph */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            <span
              data-dark-pill="true"
              className="px-2.5 py-1 rounded-lg font-black text-xs shadow-md border border-neutral-300 tracking-wide uppercase"
              style={{ backgroundColor: '#ffffff', color: '#121316' }}
            >
              {room.roomType || '1RK'}
            </span>

            {room.isAvailable === false && (
              <span
                className="px-2.5 py-1 rounded-lg bg-rose-600 font-bold text-xs shadow-md"
                style={{ color: '#ffffff' }}
              >
                Occupied
              </span>
            )}

            <span
              data-media-badge-white="true"
              className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/25 text-xs font-semibold flex items-center gap-1.5 shadow-md"
              style={{ color: '#ffffff' }}
            >
              <BedDouble className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fcd34d' }} />
              <span style={{ color: '#ffffff' }}>
                {room.furnishingStatus || 'Semi-Furnished'} • {room.bedConfiguration || '1 Bed'}
              </span>
            </span>
          </div>

          {/* Top Right Badges: Wishlist Heart + Admin Verified */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              disabled={togglingWishlist}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`p-2 rounded-full backdrop-blur-md border transition cursor-pointer shadow-md ${
                inWishlist
                  ? 'bg-rose-500 text-white border-rose-400 scale-105'
                  : 'bg-black/60 text-white hover:text-white border-white/25 hover:bg-black/80'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${inWishlist ? 'fill-current text-white' : 'text-white'}`}
              />
            </button>

            <span
              data-media-badge-white="true"
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 backdrop-blur-md flex items-center gap-1 shadow-md border border-emerald-400/30"
              style={{ color: '#ffffff' }}
            >
              <CheckCircle className="w-3 h-3" style={{ color: '#ffffff' }} /> Verified
            </span>
          </div>

          {/* Bottom Price & Electricity Overlay (High contrast white on dark glass) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <div
              data-media-badge-white="true"
              className="flex items-baseline gap-1 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/25 shadow-md"
              style={{ color: '#ffffff' }}
            >
              <IndianRupee className="w-4 h-4 -mr-0.5 font-bold flex-shrink-0" style={{ color: '#fcd34d' }} />
              <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                {Number(room.rent).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold" style={{ color: '#e5e5e5' }}>/ month</span>
            </div>

            <div
              data-media-badge-white="true"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold shadow-md"
              style={{ color: '#ffffff' }}
            >
              <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fde047' }} />
              {room.electricityIncluded ? (
                <span style={{ color: '#86efac' }}>Elec. Included</span>
              ) : (
                <span style={{ color: '#fde047' }}>₹{room.electricityRatePerUnit || 8}/unit</span>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            BODY CONTENT (Clear contrast in Light & Dark Mode)
           ======================================================== */}
        <div className="p-5 space-y-3.5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#d8cdbf] transition truncate">
              {room.title}
            </h3>
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="truncate">
                {room.location?.landmark ? `${room.location.landmark}, ` : ''}
                {room.location?.address}, {room.location?.city}
              </span>
            </div>
          </div>

          {/* Target Tenants: High contrast in both light & dark mode */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-neutral-600 dark:text-[#d8cdbf]" /> For:
            </span>
            {(room.suitableFor?.length ? room.suitableFor : ['Anyone']).map((target, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                {target}
              </span>
            ))}
          </div>

          {/* Included Amenities Chips */}
          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {facilities.slice(0, 5).map((fac, idx) => (
                <span
                  key={idx}
                  className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-medium px-2.5 py-0.5 rounded-md"
                >
                  {fac}
                </span>
              ))}
              {facilities.length > 5 && (
                <span className="text-neutral-600 dark:text-[#d8cdbf] text-xs font-semibold px-1 py-0.5">
                  +{facilities.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Rules Highlights */}
          {activeRules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {activeRules.map((rule, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                >
                  ✓ {rule}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          CARD FOOTER (Owner Summary & Actions)
         ======================================================== */}
      <div className="p-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#0f1013] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={room.owner?.profilePic}
              name={room.owner?.name || 'Landlord'}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1">
                {room.owner?.name || 'Direct Landlord'}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#d8cdbf] flex-shrink-0" />
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {room.owner?.phone || 'Direct Chat Available'}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="text-xs font-bold text-neutral-800 dark:text-[#f5efe6] hover:text-black dark:hover:text-white"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Details
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onChat) onChat(room);
              else navigate('/chat');
            }}
            className="w-full text-xs font-semibold border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-neutral-600 dark:text-[#d8cdbf]" />
            Chat Landlord
          </Button>

          <Button
            variant={room.isAvailable === false ? 'secondary' : 'default'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onBook) onBook(room);
              else handleCardClick();
            }}
            disabled={room.isAvailable === false}
            className="w-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-[#f5efe6] dark:hover:bg-[#eae2d5] dark:text-neutral-950 cursor-pointer shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1" />
            {room.isAvailable === false ? 'Occupied' : 'Book / Pay'}
          </Button>
        </div>
      </div>
    </div>
  );
}