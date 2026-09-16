// client/src/components/RoomCard.jsx
import { MapPin, IndianRupee, Phone, CheckCircle } from 'lucide-react';

export default function RoomCard({ room }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <img
          src={room.images?.[0] || defaultImage}
          alt={room.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-sky-400 flex items-center">
              <IndianRupee className="w-5 h-5" />
              {room.rent}
              <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white truncate">{room.title}</h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{room.description}</p>

          <div className="flex items-center gap-1 text-slate-400 text-xs mt-3">
            <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="truncate">
              {room.location.address}, {room.location.city}, {room.location.state}
            </span>
          </div>

          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="text-slate-500 text-xs">+{room.amenities.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
        <div>
          <p className="text-slate-200 font-medium">{room.owner?.name || 'Owner'}</p>
          <p className="flex items-center gap-1 mt-0.5 text-slate-400">
            <Phone className="w-3 h-3 text-sky-400" />
            {room.owner?.phone || 'Not provided'}
          </p>
        </div>
        <button
          onClick={() => alert(`Contact Owner: ${room.owner?.phone || room.owner?.email}`)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg transition"
        >
          Contact
        </button>
      </div>
    </div>
  );
}