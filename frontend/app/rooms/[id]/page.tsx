'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import BookingChatFab from '@/components/booking/BookingChatFab';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingHeader from '@/components/booking/BookingHeader';
import { CheckIcon, MapPinIcon } from '@/components/booking/Icons';
import { formatPrice, getRoomById, toDisplayRoom } from '@/services/roomService';
import type { ApiRoomImage, DisplayRoom } from '@/types/room';

type ImageTileProps = {
  src: string;
  alt: string;
  className?: string;
};

function ImageTile({ src, alt, className = '' }: ImageTileProps) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-[#eef0f8] px-4 text-center ${className}`}>
        <span className="max-w-[220px] text-xs font-medium leading-5 text-booking-muted">
          Ảnh phòng chưa tải được
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function makeGalleryImages(room: DisplayRoom) {
  const images = room.raw.images.length > 0
    ? room.raw.images
    : room.image
      ? [{ sequence_number: 1, image_url: room.image, is_cover: true }]
      : [];

  return images.slice(0, 4);
}

function galleryGridClass(count: number) {
  if (count <= 1) return 'lg:grid-cols-1';
  if (count === 2) return 'lg:grid-cols-2';
  if (count === 3) return 'lg:grid-cols-[1.2fr_1fr_1fr]';
  return 'lg:grid-cols-[1.25fr_1fr_1fr_1fr]';
}

function ReadMoreDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 170;
  const visibleText = !expanded && isLong ? `${text.slice(0, 170).trim()}...` : text;

  return (
    <div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-booking-muted sm:text-base">{visibleText}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-bold text-booking-primary hover:text-booking-primaryDark"
        >
          {expanded ? 'Thu gọn' : 'Đọc thêm...'}
        </button>
      ) : null}
    </div>
  );
}

function FeatureToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-booking-text px-5 py-3 text-sm font-semibold text-white shadow-xl">
      {message}
    </div>
  );
}

function statusLabel(status: string) {
  if (status === 'AVAILABLE') return 'Còn phòng';
  if (status === 'RENTED') return 'Đã thuê';
  if (status === 'LOCKED') return 'Đang giữ chỗ';
  return status;
}

function Gallery({ room, images }: { room: DisplayRoom; images: ApiRoomImage[] }) {
  const visibleImages = images.length > 0 ? images : [{ sequence_number: 1, image_url: '', is_cover: true }];

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-booking-border bg-white shadow-sm">
      <div className={`grid h-auto gap-1 sm:h-[280px] ${galleryGridClass(visibleImages.length)}`}>
        {visibleImages.map((image, index) => (
          <div key={`${image.sequence_number}-${index}`} className="relative min-h-[190px] overflow-hidden sm:min-h-0">
            <ImageTile
              src={image.image_url}
              alt={`${room.title} ${index + 1}`}
              className="h-full w-full"
            />
            {index === visibleImages.length - 1 && images.length > 1 ? (
              <button
                type="button"
                onClick={() => window.alert('Tính năng đang được phát triển')}
                className="absolute bottom-3 right-3 rounded-md border border-booking-border bg-white px-3 py-2 text-xs font-bold text-booking-text shadow-sm transition hover:border-booking-primary"
              >
                Hiển thị tất cả
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<DisplayRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getRoomById(params.id)
      .then((apiRoom) => {
        if (active) setRoom(toDisplayRoom(apiRoom));
      })
      .catch(() => {
        if (active) setError('Không tìm thấy phòng hoặc phòng chưa được công khai.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  const galleryImages = useMemo(() => (room ? makeGalleryImages(room) : []), [room]);

  function showDevelopingToast() {
    setToast('Tính năng đang được phát triển');
  }

  return (
    <div className="min-h-screen bg-booking-surface text-booking-text">
      <BookingHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/rooms" className="text-sm font-bold text-booking-primary transition hover:text-booking-primaryDark">
          ← Quay lại danh sách
        </Link>

        {loading ? (
          <div className="mt-5 space-y-5">
            <div className="h-[280px] animate-pulse rounded-xl border border-booking-border bg-white" />
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="h-[420px] animate-pulse rounded-xl border border-booking-border bg-white" />
              <div className="h-[320px] animate-pulse rounded-xl border border-booking-border bg-white" />
            </div>
          </div>
        ) : error || !room ? (
          <div className="mt-5 rounded-xl border border-booking-border bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">Không thể hiển thị phòng</h1>
            <p className="mt-3 text-booking-muted">{error}</p>
          </div>
        ) : (
          <>
            <Gallery room={room} images={galleryImages} />

            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                {room.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-booking-teal px-2 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Đã xác thực uy tín
                  </span>
                ) : null}
                <span className="rounded-md border border-booking-border bg-white px-2 py-1 text-xs font-bold text-booking-text">
                  Phòng trọ cao cấp
                </span>
              </div>
              <h1 className="mt-3 max-w-4xl text-[28px] font-bold leading-snug tracking-normal text-booking-text sm:text-[32px]">
                {room.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-booking-muted">
                <span className="font-bold text-booking-text">★ {room.rating.toFixed(1)}</span>
                <span>Chưa có đánh giá từ người thuê</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  {room.location}
                </span>
              </div>
            </section>

            <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className="rounded-xl border border-booking-border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-booking-primary text-lg font-black text-white">
                      {room.raw.host.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-booking-muted">Chủ nhà</p>
                      <p className="font-bold">{room.raw.host.full_name}</p>
                      <p className="text-xs text-booking-muted">Đã tham gia từ tháng 5, 2021</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-booking-border bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold">Về căn phòng này</h2>
                  <ReadMoreDescription text={room.description} />
                </section>

                <section className="rounded-xl border border-booking-border bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold">Tiện ích nổi bật</h2>
                  {room.amenities.length > 0 ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {room.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3 text-sm font-semibold">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-booking-primary/10 text-booking-primary">
                            ✓
                          </span>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-booking-muted">
                      Chủ phòng chưa cập nhật danh sách tiện ích cho phòng này.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-booking-border bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold">Vị trí</h2>
                  <p className="mt-2 text-sm text-booking-muted">{room.raw.detailed_address}</p>
                  <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-[#d9dbe7] text-booking-muted">
                    <div className="text-center">
                      <MapPinIcon className="mx-auto h-8 w-8" />
                      <p className="mt-2 text-sm font-semibold">Bản đồ sẽ hiển thị khi tích hợp Maps API</p>
                    </div>
                  </div>
                </section>

                <section id="reviews" className="rounded-xl border border-booking-border bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold">Đánh giá</h2>
                  <div className="mt-3 rounded-lg border border-booking-border bg-booking-surface p-4">
                    <p className="font-bold">★ {room.rating.toFixed(1)}</p>
                    <p className="mt-2 text-sm leading-6 text-booking-muted">
                      Chưa có đánh giá công khai từ người thuê. Điểm hiện tại là dữ liệu tổng quan từ hệ thống và sẽ được đồng bộ với đánh giá thật khi backend hỗ trợ review.
                    </p>
                  </div>
                </section>
              </div>

              <aside className="h-fit rounded-xl border border-booking-border bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <p className="text-sm text-booking-muted">Giá thuê hàng tháng</p>
                <p className="mt-1 text-3xl font-black text-booking-primary">
                  {room.priceLabel}
                  <span className="text-sm font-semibold text-booking-muted"> / tháng</span>
                </p>
                <div className="mt-5 rounded-lg border border-booking-border bg-booking-surface p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-booking-muted">Tiền cọc</span>
                    <span className="font-bold">{formatPrice(room.raw.deposit_amount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-booking-muted">Trạng thái</span>
                    <span className="font-bold text-booking-teal">{statusLabel(room.raw.status)}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-booking-surface p-3">
                    <p className="text-xs text-booking-muted">Sức chứa</p>
                    <p className="mt-1 font-bold">{room.raw.max_capacity}</p>
                  </div>
                  <div className="rounded-lg bg-booking-surface p-3">
                    <p className="text-xs text-booking-muted">Loại</p>
                    <p className="mt-1 font-bold">{room.type}</p>
                  </div>
                  <div className="rounded-lg bg-booking-surface p-3">
                    <p className="text-xs text-booking-muted">Đánh giá</p>
                    <p className="mt-1 font-bold">{room.rating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-lg bg-booking-surface p-4 text-sm leading-6 text-booking-muted">
                  <span>Chủ phòng: </span>
                  <span className="font-bold text-booking-text">{room.raw.host.full_name}</span>
                  <br />
                  <span>SĐT: </span>
                  <span className="font-bold text-booking-text">{room.raw.host.phone_number || 'Chưa cập nhật'}</span>
                </div>
                <button
                  type="button"
                  onClick={showDevelopingToast}
                  className="mt-6 w-full rounded-lg bg-booking-primary px-5 py-4 font-bold text-white shadow-sm transition hover:bg-booking-primaryDark"
                >
                  Đặt cọc giữ phòng
                </button>
                <button
                  type="button"
                  onClick={showDevelopingToast}
                  className="mt-3 w-full rounded-lg border border-booking-border bg-booking-surface px-5 py-4 font-bold text-booking-text transition hover:border-booking-primary"
                >
                  Nhắn tin với chủ nhà
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-booking-muted">
                  Giao dịch an toàn qua Booking-Room
                </p>
              </aside>
            </section>
          </>
        )}
      </main>

      <BookingFooter />
      <BookingChatFab />
      {toast ? <FeatureToast message={toast} onClose={() => setToast('')} /> : null}
    </div>
  );
}
