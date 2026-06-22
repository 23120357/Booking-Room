'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HostSidebar from '@/components/host/HostSidebar';
import { hostRoomService, type HostRoom, type RoomReview } from '@/services/hostRoomService';

function formatVND(amount: number): string {
  if (!amount || amount <= 0) return '0đ';
  return `${Number(amount).toLocaleString('vi-VN')}đ`;
}

function statusBadge(room: HostRoom): { label: string; className: string } {
  if (room.status === 'HIDDEN') return { label: 'Đã ẩn', className: 'bg-[#E1E2ED] text-[#434655]' };
  if (room.approval_status === 'PENDING') return { label: 'Chờ duyệt', className: 'bg-[#FFEDE6] text-[#BC4800]' };
  if (room.approval_status === 'REJECTED') return { label: 'Bị từ chối', className: 'bg-[#FFDAD6] text-[#BA1A1A]' };
  if (room.status === 'RENTED') return { label: 'Đã cho thuê', className: 'bg-[#E1E2ED] text-[#434655]' };
  if (room.status === 'LOCKED') return { label: 'Đang giữ chỗ', className: 'bg-[#FFEDE6] text-[#943700]' };
  return { label: 'Đang hoạt động', className: 'bg-[#86F2E4] text-[#006F66]' };
}

function HostIconBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-[#E1E2ED] bg-[#FAF8FF] px-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4 text-[#434655]">
        <button type="button" aria-label="Thông báo" title="Thông báo" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/** Single-image carousel: cover first, prev/next nav, dot indicators. */
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(index, Math.max(0, images.length - 1));
  const go = (next: number) => setIndex((next + images.length) % images.length);

  // Auto-advance to the next image every 3s.
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-[#C3C6D7] bg-[#E1E2ED] text-[#434655]">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[#C3C6D7] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
      <img src={images[safeIndex]} alt={`${alt} ${safeIndex + 1}`} className="h-full w-full object-cover" />

      {/* Image counter */}
      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
        {safeIndex + 1}/{images.length}
      </span>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={() => go(safeIndex - 1)}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#191B23] shadow-md transition hover:bg-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Ảnh kế"
            onClick={() => go(safeIndex + 1)}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#191B23] shadow-md transition hover:bg-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Tới ảnh ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === safeIndex ? 'w-6 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Star rating display (rounded to nearest half not needed — show filled count). */
function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Đánh giá ${value} trên 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < rounded ? 'text-[#f5a623]' : 'text-[#D7D9E4]'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}

export default function HostListingDetailPage({ listingId }: { listingId: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [room, setRoom] = useState<HostRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<RoomReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await hostRoomService.getMyRoomById(listingId);
        if (cancelled) return;
        if (!found) {
          setError('Không tìm thấy tin đăng này.');
        } else {
          setRoom(found);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Không tải được tin đăng.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  // Reviews are public; fetch independently so a failure doesn't block the page.
  useEffect(() => {
    let cancelled = false;
    hostRoomService
      .getRoomReviews(listingId, { limit: 20 })
      .then((res) => {
        if (cancelled || !res.data) return;
        setReviews(res.data.items || []);
        setReviewsTotal(res.data.total || 0);
      })
      .catch(() => {
        if (!cancelled) {
          setReviews([]);
          setReviewsTotal(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Cover image first, then the rest in sequence order.
  const images = useMemo(() => {
    if (room?.images?.length) {
      return [...room.images]
        .sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))
        .map((img) => img.image_url);
    }
    return room?.cover_image_url ? [room.cover_image_url] : [];
  }, [room]);

  const costs = room
    ? [
      { label: 'Tiền điện', value: formatVND(Number(room.electricity_cost)) },
      { label: 'Tiền nước', value: formatVND(Number(room.water_cost)) },
      { label: 'Internet', value: formatVND(Number(room.internet_cost)) },
      { label: 'Phí dịch vụ', value: formatVND(Number(room.service_fee)) },
    ]
    : [];

  const badge = room ? statusBadge(room) : null;
  const rating = Number(room?.average_rating) || 0;
  const favorites = Number(room?.favorite_count) || 0;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <HostSidebar user={user} onLogout={handleLogout} activePage="listings" />

      <section className="flex min-h-screen flex-col lg:ml-64">
        <HostIconBar />

        <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-4 sm:p-6">
          <nav className="text-base leading-6" aria-label="Breadcrumb">
            <Link href="/host/listings" className="text-[#434655] hover:text-[#004AC6]">Tin đăng của tôi</Link>
            <span className="px-1 text-[#434655]">›</span>
            <span className="text-[#004AC6]">Chi tiết tin đăng</span>
          </nav>

          {loading ? (
            <div className="rounded-2xl border border-[#C3C6D7] bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-base font-semibold text-[#191B23]">Đang tải tin đăng...</p>
            </div>
          ) : error || !room ? (
            <div className="rounded-2xl border border-[#FFDAD6] bg-[#FFF8F7] px-6 py-16 text-center shadow-sm">
              <p className="text-base font-semibold text-[#BA1A1A]">{error || 'Không tìm thấy tin đăng này.'}</p>
              <Link href="/host/listings" className="mt-4 inline-block text-sm font-semibold text-[#004AC6] hover:underline">
                ← Quay lại danh sách
              </Link>
            </div>
          ) : (
            <>
              {/* ── Header: title, status, address, rating, favorites ── */}
              <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h1 className="max-w-[580px] text-[32px] font-bold leading-[38px] text-[#191B23]">{room.title}</h1>
                    {badge && (
                      <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-bold leading-4 ${badge.className}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-base leading-6 text-[#434655]">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      {room.detailed_address}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <StarRating value={rating} />
                      <span className="font-semibold text-[#191B23]">{rating > 0 ? rating.toFixed(1) : 'Chưa có'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1" title="Lượt yêu thích">
                      <svg className="h-5 w-5 text-[#e5484d]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21s-6.7-4.3-9.3-8.3C.9 9.8 2.1 6 5.5 6c2 0 3.4 1.2 4.5 2.6C11.1 7.2 12.5 6 14.5 6c3.4 0 4.6 3.8 2.8 6.7C18.7 16.7 12 21 12 21z" />
                      </svg>
                      <span className="font-semibold text-[#191B23]">{favorites}</span>
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link href={`/host/listings/${room.room_id}/edit`} className="flex h-14 items-center gap-2 rounded-xl bg-[#004AC6] px-6 text-base text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#003f9e]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.9 4.6l2.5 2.5M5 19l4.8-1 9.3-9.3a1.8 1.8 0 0 0-2.5-2.5l-9.3 9.3L5 19z" />
                    </svg>
                    Chỉnh sửa
                  </Link>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="flex flex-col gap-6">
                  <ImageCarousel images={images} alt={room.title} />

                  {/* Key facts */}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                      <p className="text-base leading-6 text-[#434655]">Giá thuê/ Tháng</p>
                      <p className="mt-1 text-base font-semibold leading-6 text-[#004AC6]">{formatVND(Number(room.monthly_rent))}</p>
                    </article>
                    <article className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                      <p className="text-base leading-6 text-[#434655]">Tiền cọc</p>
                      <p className="mt-1 text-base font-semibold leading-6 text-[#191B23]">{formatVND(Number(room.deposit_amount))}</p>
                    </article>
                    <article className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                      <p className="text-base leading-6 text-[#434655]">Loại phòng</p>
                      <p className="mt-1 text-base font-semibold leading-6 text-[#191B23]">{room.room_type}</p>
                    </article>
                    <article className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                      <p className="text-base leading-6 text-[#434655]">Sức chứa</p>
                      <p className="mt-1 text-base font-semibold leading-6 text-[#191B23]">{room.max_capacity} người</p>
                    </article>
                  </div>

                  {/* Description */}
                  <section className="rounded-2xl border border-[#C3C6D7] bg-white p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-2xl font-semibold leading-8 text-[#191B23]">
                      <svg className="h-6 w-6 text-[#004AC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h8l4 4v14H7zM15 3v5h4M9 13h6M9 17h6" />
                      </svg>
                      Mô tả
                    </h2>
                    <p className="mt-6 whitespace-pre-line text-base leading-7 text-[#434655]">
                      {room.room_description || 'Chưa có mô tả cho tin đăng này.'}
                    </p>
                  </section>

                  {/* Reviews */}
                  <section className="rounded-2xl border border-[#C3C6D7] bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-2xl font-semibold leading-8 text-[#191B23]">
                        <svg className="h-6 w-6 text-[#f5a623]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
                        </svg>
                        Đánh giá ({reviewsTotal})
                      </h2>
                      {rating > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-base text-[#434655]">
                          <StarRating value={rating} />
                          <span className="font-semibold text-[#191B23]">{rating.toFixed(1)}/5</span>
                        </span>
                      )}
                    </div>

                    {reviews.length === 0 ? (
                      <p className="mt-6 text-base text-[#434655]">Phòng này chưa có đánh giá nào.</p>
                    ) : (
                      <ul className="mt-6 space-y-5">
                        {reviews.map((rv) => (
                          <li key={rv.review_id} className="border-b border-[#EDEDF9] pb-5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              {rv.reviewer_avatar ? (
                                <img src={rv.reviewer_avatar} alt={rv.reviewer_name} className="h-10 w-10 rounded-full border border-[#C3C6D7] object-cover" />
                              ) : (
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1E2ED] text-sm font-bold text-[#434655]">
                                  {rv.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-[#191B23]">{rv.reviewer_name}</p>
                                <div className="flex items-center gap-2">
                                  <StarRating value={rv.rating} />
                                  <span className="text-xs text-[#6B7280]">
                                    {new Date(rv.created_at).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {rv.comment && <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#434655]">{rv.comment}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                <aside className="flex flex-col gap-6">
                  <section className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold leading-7">Chi phí hàng tháng</h2>
                    <div className="mt-4 space-y-3">
                      {costs.map((cost) => (
                        <div key={cost.label} className="flex items-center justify-between border-b border-[#EDEDF9] pb-3 last:border-0 last:pb-0">
                          <span className="text-base text-[#434655]">{cost.label}</span>
                          <span className="text-base font-semibold text-[#191B23]">{cost.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </aside>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
