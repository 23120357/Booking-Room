'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewService, RoomReview } from '@/services/reviewService';
import { bookingService } from '@/services/bookingService';

interface Reply {
  id: string;
  authorName: string;
  isHost: boolean;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
}

interface RoomReviewsSectionProps {
  roomId: string;
}

export default function RoomReviewsSection({ roomId }: RoomReviewsSectionProps) {
  const { user } = useAuth();
  
  // API State
  const [reviews, setReviews] = useState<RoomReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Eligibility State
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [eligibleDepositId, setEligibleDepositId] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState<boolean>(true);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentContent, setCommentContent] = useState<string>('');
  
  // Local replies (for nested UI demonstration since DB has no reply table)
  const [localReplies, setLocalReplies] = useState<Record<string, Reply[]>>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [replyAsHost, setReplyAsHost] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getRoomReviews(roomId, { limit: 50 });
      if (res && res.data && res.data.items) {
        setReviews(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  // Check if current user is eligible to write a review (has ACCEPTED deposit for this room)
  useEffect(() => {
    if (!user || user.role !== 'TENANT') {
      setIsEligible(false);
      setCheckingEligibility(false);
      return;
    }

    async function checkEligibility() {
      try {
        setCheckingEligibility(true);
        const res = await bookingService.getMyDeposits({ status: 'ACCEPTED', limit: 100 });
        if (res && res.data && res.data.deposits) {
          // Find matching deposit for this room
          const matchingDeposit = res.data.deposits.find(
            (dep: any) => String(dep.room_id) === String(roomId) || String(dep.roomId) === String(roomId)
          );
          
          if (matchingDeposit) {
            setIsEligible(true);
            setEligibleDepositId(matchingDeposit.deposit_id || (matchingDeposit as any).depositId);
          } else {
            setIsEligible(false);
            setEligibleDepositId(null);
          }
        }
      } catch (err) {
        console.error('Failed to check review eligibility:', err);
        setIsEligible(false);
      } finally {
        setCheckingEligibility(false);
      }
    }

    checkEligibility();
  }, [user, roomId]);

  // Rating Stats calculation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';

  const starCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const starIdx = Math.max(1, Math.min(5, Math.round(r.rating || 5))) - 1;
    starCounts[starIdx]++;
  });

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return '0%';
    return `${((count / totalReviews) * 100).toFixed(0)}%`;
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Vui lòng đăng nhập!');
      return;
    }
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }
    if (!eligibleDepositId) {
      alert('Bạn không có đơn đặt cọc hợp lệ để đánh giá phòng này.');
      return;
    }

    try {
      const res = await reviewService.createReview({
        deposit_id: eligibleDepositId,
        rating: rating,
        comment: commentContent.trim() || undefined, // comment is optional
      });

      if (res && res.data) {
        setCommentContent('');
        setRating(0);
        showToast('Đăng đánh giá thành công!');
        fetchReviews(); // Refresh review list from backend
        setIsEligible(false); // Disable form since they have already reviewed
      }
    } catch (err: any) {
      console.error('Failed to create review:', err);
      const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      alert(errMsg);
    }
  };

  const handleAddReply = (reviewId: string) => {
    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      authorName: replyAsHost ? 'Nguyễn Văn A' : (user?.fullName || 'Người dùng khác'),
      isHost: replyAsHost,
      content: replyContent.trim(),
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    setLocalReplies((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newReply],
    }));

    setReplyContent('');
    setActiveReplyBoxId(null);
    setReplyAsHost(false);
    showToast('Đã phản hồi thành công! (Lưu tạm ở client)');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/);
    const lastWord = parts[parts.length - 1];
    return lastWord.charAt(0).toUpperCase();
  };

  const getBgColor = (name: string) => {
    const colors = [
      'bg-indigo-500',
      'bg-sky-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-pink-500',
      'bg-amber-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-8 mt-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#004ac6] text-white px-5 py-3 rounded-xl shadow-lg border border-white/20 animate-bounce flex items-center gap-2">
          <span>🎉</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-booking-text flex items-center gap-2">
          <span>💬</span> Đánh giá & Bình luận từ khách thuê
        </h2>
        <p className="text-xs text-booking-muted mt-1">
          Chỉ những khách thuê đã từng đặt cọc thành công (có đơn đặt cọc được chấp nhận) mới được đánh giá phòng này.
        </p>
      </div>

      {/* Review Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 bg-[#faf8ff] p-5 rounded-2xl border border-[#004ac6]/5">
        {/* Left Side: Score summary */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200/60 pb-5 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-[#004ac6] tracking-tight">{avgRating}</span>
          <div className="flex items-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`h-5 w-5 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-bold text-booking-muted mt-2 uppercase tracking-wider">
            {totalReviews} đánh giá thực tế
          </span>
        </div>

        {/* Right Side: Bars distribution */}
        <div className="flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars - 1];
            const pct = getPercentage(count);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs md:text-sm font-semibold">
                <span className="w-12 text-booking-text flex items-center gap-1 font-bold">
                  {stars} sao
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    style={{ width: pct }}
                    className="h-full bg-[#004ac6] rounded-full transition-all duration-500"
                  />
                </div>
                <span className="w-12 text-right text-booking-muted font-bold">{pct} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Write Form - Conditional rendering based on eligibility */}
      {!user ? (
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-booking-muted">
            Vui lòng đăng nhập bằng tài khoản Người thuê để gửi đánh giá cho phòng này.
          </p>
        </div>
      ) : checkingEligibility ? (
        <div className="flex items-center justify-center p-6 text-sm text-booking-muted">
          <svg className="animate-spin h-5 w-5 mr-2 text-[#004ac6]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang kiểm tra quyền viết đánh giá...
        </div>
      ) : (
        <form onSubmit={handleAddReview} className={`border border-slate-100 rounded-2xl p-5 bg-white shadow-inner animate-in fade-in duration-200 transition-all duration-300 relative ${
          !isEligible ? 'opacity-50 select-none' : ''
        }`}>
          <fieldset disabled={!isEligible} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-booking-text text-sm md:text-base flex items-center gap-1.5">
                <span>✍️</span> Viết đánh giá của bạn
              </h3>
              {!isEligible ? (
                <span className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  🔒 Chỉ khả dụng cho khách đã thuê phòng
                </span>
              ) : (
                <span className="text-xs text-booking-muted font-semibold">
                  Đánh giá dưới tên: <strong className="text-booking-text">{user.fullName}</strong>
                </span>
              )}
            </div>

            {/* Star selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-booking-muted uppercase tracking-wider">Đánh giá số sao</span>
              <div className="flex items-center gap-1.5 h-[38px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`transition duration-150 transform hover:scale-110 active:scale-95 ${!isEligible ? 'cursor-not-allowed' : ''}`}
                  >
                    <svg
                      className={`h-7 w-7 ${
                        star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-slate-200'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs font-extrabold text-[#004ac6] bg-[#004ac6]/5 px-2.5 py-1 rounded-full ml-1.5">
                    {rating} sao
                  </span>
                )}
              </div>
            </div>

            {/* Text area - optional */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-booking-muted uppercase tracking-wider">
                Nội dung bình luận <span className="text-slate-400 font-normal lowercase">(Tùy chọn)</span>
              </label>
              <textarea
                rows={3}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Bạn có thể viết thêm nhận xét chi tiết hoặc bỏ trống nếu chỉ muốn đánh giá số sao..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium focus:bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]/10 outline-none transition resize-none disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#004ac6] hover:bg-[#003f9e] text-white font-extrabold text-xs py-3 px-5 rounded-xl transition shadow-md active:scale-98 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🚀</span> Gửi đánh giá
              </button>
            </div>
          </fieldset>
        </form>
      )}

      {/* Review Listing Section */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-booking-text text-sm md:text-base border-b border-slate-100 pb-2">
          Bình luận & Đánh giá ({reviews.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#004ac6]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-semibold text-booking-muted mt-2">Chưa có đánh giá nào về phòng này.</p>
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-slate-100">
            {reviews.map((rev, idx) => {
              const replies = [
                ...(rev.replies || []),
                ...(localReplies[rev.review_id] || [])
              ];
              
              return (
                <div key={rev.review_id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-4`}>
                  {/* Level 1 Comment: Tenant review */}
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-sm ${getBgColor(rev.reviewer_name)}`}>
                      {getInitials(rev.reviewer_name)}
                    </div>
                    {/* Content Container */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-booking-text text-sm">{rev.reviewer_name}</span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#137333] bg-[#e6f4ea] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            ✓ Đã xác thực thuê
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-booking-muted">{formatDate(rev.created_at)}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`h-4 w-4 ${s <= rev.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>

                      <p className={`text-sm leading-relaxed ${rev.comment ? 'text-booking-text font-medium' : 'text-slate-400 italic font-normal text-xs'}`}>
                        {rev.comment || 'Khách thuê chỉ đánh giá số sao.'}
                      </p>

                      {/* Actions row */}
                      {user && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (activeReplyBoxId === rev.review_id) {
                                setActiveReplyBoxId(null);
                              } else {
                                setActiveReplyBoxId(rev.review_id);
                                setReplyContent('');
                              }
                            }}
                            className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
                          >
                            <span>↩️</span> Phản hồi mẫu
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level 2 Nested Comments: Replies list */}
                  {replies.length > 0 && (
                    <div className="ml-10 pl-4 border-l-2 border-slate-100 space-y-4">
                      {replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 animate-in fade-in duration-200">
                          {/* Reply Avatar */}
                          <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-xs ${reply.isHost ? 'bg-slate-700' : getBgColor(reply.authorName)}`}>
                            {getInitials(reply.authorName)}
                          </div>
                          {/* Reply Content */}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-booking-text text-xs">{reply.authorName}</span>
                                {reply.isHost && (
                                  <span className="text-[9px] font-extrabold bg-slate-800 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Chủ phòng
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-booking-muted">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-booking-muted text-xs md:text-sm leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Write Form (Inline under the parent review) */}
                  {activeReplyBoxId === rev.review_id && (
                    <div className="ml-10 p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-3 animate-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-booking-text uppercase tracking-wide flex items-center gap-1">
                          <span>💬</span> Phản hồi bình luận của {rev.reviewer_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveReplyBoxId(null)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                        >
                          Hủy
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id={`as-host-${rev.review_id}`}
                          checked={replyAsHost}
                          onChange={(e) => setReplyAsHost(e.target.checked)}
                          className="rounded text-[#004ac6] focus:ring-[#004ac6]/10 cursor-pointer h-4 w-4"
                        />
                        <label htmlFor={`as-host-${rev.review_id}`} className="text-xs font-bold text-booking-text cursor-pointer select-none">
                          Trả lời với vai trò Chủ phòng (Nguyễn Văn A)
                        </label>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-booking-muted uppercase">Nội dung phản hồi</label>
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Nhập câu trả lời phản hồi..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:border-[#004ac6] outline-none resize-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddReply(rev.review_id)}
                          className="bg-[#004ac6] hover:bg-[#003f9e] text-white font-extrabold text-[11px] py-2 px-4 rounded-lg transition active:scale-95 shadow-sm"
                        >
                          Đăng phản hồi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
