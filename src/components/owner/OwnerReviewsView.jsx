// client/src/components/owner/OwnerReviewsView.jsx
import { useState } from 'react';
import { Avatar, Badge, Card, Input } from '../ui/shadcn';
import {
  Star,
  Building2,
  MapPin,
  Calendar,
  Search,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function OwnerReviewsView({ rooms = [], loading = false }) {
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Compute all reviews
  const allReviewsWithRoom = rooms.flatMap((room) =>
    (room.reviews || []).map((rev) => ({
      ...rev,
      roomTitle: room.title,
      roomId: room._id,
      roomType: room.roomType,
      roomLocation: room.location,
    }))
  );

  const totalReviewsCount = allReviewsWithRoom.length;
  const overallAvgRating =
    totalReviewsCount > 0
      ? (
          allReviewsWithRoom.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          totalReviewsCount
        ).toFixed(1)
      : '0.0';

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    if (selectedRoomId !== 'all' && room._id !== selectedRoomId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = room.title?.toLowerCase().includes(q);
      const matchReview = (room.reviews || []).some(
        (rev) =>
          rev.comment?.toLowerCase().includes(q) ||
          rev.name?.toLowerCase().includes(q)
      );
      if (!matchRoom && !matchReview) return false;
    }

    if (ratingFilter !== 'all') {
      const targetStar = Number(ratingFilter);
      const hasStar = (room.reviews || []).some(
        (rev) => Math.round(Number(rev.rating)) === targetStar
      );
      if (!hasStar) return false;
    }

    return true;
  });

  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= fullStars;
          return (
            <Star
              key={starIndex}
              className={`w-4 h-4 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-700 fill-neutral-800'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#e2dbcf] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Room-Wise Ratings & Tenant Reviews
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Read verified feedback and ratings for each of your posted rooms left by tenants who lived there.
          </p>
        </div>

        <Badge variant="cream" className="text-xs font-bold self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5" /> 1-Month Verified Reviews Only
        </Badge>
      </div>

      {/* Rating Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black">{overallAvgRating}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">{renderStars(Number(overallAvgRating))}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Average rating across {rooms.length} room{rooms.length === 1 ? '' : 's'}
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Reviews Received</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{totalReviewsCount}</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">From genuine residents</p>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Review Authenticity Rule</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Verified Living Period
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Only tenants who have stayed for &ge; 1 month are eligible to review.
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f5ee] dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-[#e2dbcf] dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <Input
              placeholder="Search by review text or reviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-white dark:bg-neutral-950 border-[#e2dbcf] dark:border-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room Selector */}
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none max-w-[200px] truncate cursor-pointer"
          >
            <option value="all">All Rooms ({rooms.length})</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* ROOM-WISE LISTING (CRITICAL REQUIREMENT) */}
      {loading ? (
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 text-sm">
          Loading rooms and reviews...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900/60 border border-[#e2dbcf] dark:border-neutral-800 rounded-3xl p-8 space-y-2">
          <Star className="w-12 h-12 text-neutral-400 dark:text-neutral-700 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">No rooms matching review filter</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Try resetting your room or rating filter above.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRooms.map((room) => {
            const reviews = room.reviews || [];
            const roomRating =
              reviews.length > 0
                ? (
                    reviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0) /
                    reviews.length
                  ).toFixed(1)
                : '0.0';

            return (
              <Card
                key={room._id}
                className="overflow-hidden bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800/90 hover:border-[#d8cdbf] dark:hover:border-neutral-750 transition"
              >
                {/* Room Header with Image, Title & Score */}
                <div className="p-5 border-b border-[#e2dbcf] dark:border-neutral-800/90 bg-[#faf7f2] dark:bg-[#14151a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        room.images?.[0] ||
                        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={room.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#e2dbcf] dark:border-neutral-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#f3ede2] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-bold">
                          {room.roomType || '1RK'}
                        </span>
                        <h3 className="font-extrabold text-neutral-900 dark:text-white text-base truncate">
                          {room.title}
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        {room.location?.address}, {room.location?.city}
                      </p>
                    </div>
                  </div>

                  {/* Room Rating Score */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-neutral-900 dark:text-white">{roomRating}</span>
                      {renderStars(Number(roomRating))}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {reviews.length} review{reviews.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Reviews Content for this Room */}
                <div className="p-5">
                  {reviews.length === 0 ? (
                    <div className="py-6 px-4 rounded-xl bg-[#f8f5ee] dark:bg-neutral-950/60 border border-[#e2dbcf] dark:border-neutral-850 text-center space-y-1">
                      <MessageSquare className="w-6 h-6 text-neutral-400 dark:text-neutral-600 mx-auto" />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        No ratings or reviews submitted yet for this room.
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Tenants who book this room can write a review once they have lived there for 1 month.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map((rev, index) => {
                        const userObj = rev.user || {};
                        const reviewerName = rev.name || userObj.name || 'Tenant';
                        const reviewerPic = userObj.profilePic || '';

                        return (
                          <div
                            key={index}
                            className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-neutral-950/80 border border-[#e2dbcf] dark:border-neutral-800/90 flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              {/* Reviewer Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <Avatar
                                    src={reviewerPic}
                                    name={reviewerName}
                                    size="sm"
                                    className="border border-[#e2dbcf] dark:border-neutral-700"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                      {reviewerName}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" /> Verified Resident
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  {renderStars(Number(rev.rating))}
                                  <span className="text-[10px] text-neutral-500 mt-0.5 block flex items-center justify-end gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(rev.createdAt).toLocaleDateString([], {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Review Comment Text */}
                              <p className="text-xs text-neutral-800 dark:text-neutral-300 leading-relaxed italic bg-[#f4efe6] dark:bg-neutral-900/60 p-3 rounded-xl border border-[#e2dbcf] dark:border-neutral-800/60">
                                &ldquo;{rev.comment}&rdquo;
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
