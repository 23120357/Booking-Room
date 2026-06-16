import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingChatFab from '@/components/booking/BookingChatFab';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingHeader from '@/components/booking/BookingHeader';
import { CheckIcon, MapPinIcon } from '@/components/booking/Icons';
import { findRoomById } from '@/data/bookingRooms';

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = findRoomById(id);

  if (!room) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-booking-surface text-booking-text">
      <BookingHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/rooms" className="text-sm font-bold text-booking-primary transition hover:text-booking-primaryDark">
          ← Quay lại danh sách
        </Link>

        <section className="mt-5 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-booking-border bg-white shadow-sm">
              <Image src={room.image} alt={room.title} fill priority sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-booking-text/80 to-transparent p-6 text-white">
                <div className="mb-3 flex flex-wrap gap-2">
                  {room.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-booking-teal px-2 py-1 text-xs font-bold uppercase tracking-[0.04em]">
                      <CheckIcon className="h-3.5 w-3.5" />
                      Đã xác thực
                    </span>
                  ) : null}
                  {room.isNew ? <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-booking-text">Mới</span> : null}
                </div>
                <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{room.title}</h1>
                <p className="mt-2 flex items-center gap-2 text-booking-surface/90">
                  <MapPinIcon className="h-4 w-4" />
                  {room.location}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-booking-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Mô tả phòng</h2>
              <p className="mt-3 leading-7 text-booking-muted">{room.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 rounded-lg border border-booking-border bg-booking-surface px-4 py-3 text-sm font-semibold">
                    <CheckIcon className="h-4 w-4 text-booking-teal" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-booking-border bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm text-booking-muted">Giá thuê hàng tháng</p>
            <p className="mt-1 text-3xl font-black text-booking-primary">{room.priceLabel}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-booking-surface p-3">
                <p className="text-xs text-booking-muted">Diện tích</p>
                <p className="mt-1 font-bold">{room.area}</p>
              </div>
              <div className="rounded-lg bg-booking-surface p-3">
                <p className="text-xs text-booking-muted">Loại</p>
                <p className="mt-1 font-bold">{room.type}</p>
              </div>
              <div className="rounded-lg bg-booking-surface p-3">
                <p className="text-xs text-booking-muted">Đánh giá</p>
                <p className="mt-1 font-bold">{room.rating}</p>
              </div>
            </div>
            <button className="mt-6 w-full rounded-lg bg-booking-primary px-5 py-4 font-bold text-white shadow-sm transition hover:bg-booking-primaryDark">
              Đặt lịch xem phòng
            </button>
            <button className="mt-3 w-full rounded-lg border border-booking-border bg-booking-surface px-5 py-4 font-bold text-booking-text transition hover:border-booking-primary">
              Nhắn chủ phòng
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-booking-muted">
              Bạn chưa bị tính phí. Chủ phòng sẽ xác nhận lịch hẹn trước khi gặp.
            </p>
          </aside>
        </section>
      </main>

      <BookingFooter />
      <BookingChatFab />
    </div>
  );
}
