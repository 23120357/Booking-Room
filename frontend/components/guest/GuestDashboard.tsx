'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BookingChatFab from '@/components/booking/BookingChatFab';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingHeader from '@/components/booking/BookingHeader';
import RoomCard from '@/components/booking/RoomCard';
import SearchBento from '@/components/booking/SearchBento';
import { getRooms, toDisplayRoom } from '@/services/roomService';
import type { DisplayRoom } from '@/types/room';

export default function GuestDashboard() {
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getRooms({ limit: 4, sort: 'rating_desc' })
      .then((result) => {
        if (active) setRooms(result.items.map(toDisplayRoom));
      })
      .catch(() => {
        if (active) setRooms([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-booking-surface text-booking-text">
      <BookingHeader />

      <main>
        <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-booking-border">
          <Image
            src="/images/booking/hero-apartment.png"
            alt="Không gian căn hộ hiện đại"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-booking-surface/45 to-booking-surface/95" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-14 text-center sm:px-6">
            <h1 className="text-3xl font-extrabold italic leading-tight tracking-normal text-booking-text sm:text-4xl">
              Tìm Phòng Ưng Ý, Định Cư Lâu Dài
            </h1>
            <p className="mt-4 max-w-2xl text-base italic leading-7 text-booking-muted sm:text-lg">
              Hàng ngàn phòng trọ, căn hộ dịch vụ và chỗ ở ghép xác thực, đầy đủ tiện nghi.
            </p>
            <div className="mt-12 w-full">
              <SearchBento />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-booking-text">Phòng Nổi Bật</h2>
              <p className="mt-1 text-sm text-booking-muted">Những không gian được yêu thích và đánh giá cao nhất.</p>
            </div>
            <Link href="/rooms" className="shrink-0 text-sm font-bold text-booking-primary transition hover:text-booking-primaryDark sm:text-base">
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="min-h-[260px] animate-pulse rounded-xl border border-booking-border bg-white" />
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {rooms.map((room, index) => (
                <RoomCard key={room.id} room={room} featured={index === 0 || index === 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-booking-border bg-white p-8 text-center text-booking-muted">
              Chưa có phòng đã duyệt để hiển thị.
            </div>
          )}
        </section>
      </main>

      <BookingFooter />
      <BookingChatFab />
    </div>
  );
}
