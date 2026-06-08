'use client';

import { useMemo, useState } from 'react';
import BookingChatFab from '@/components/booking/BookingChatFab';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingHeader from '@/components/booking/BookingHeader';
import RoomCard from '@/components/booking/RoomCard';
import SearchBento from '@/components/booking/SearchBento';
import { bookingRooms } from '@/data/bookingRooms';

const districts = ['Tất cả', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Thủ Đức'];
const types = ['Tất cả', 'Phòng trọ', 'Căn hộ', 'Ở ghép'];

export default function RoomsPage() {
  const [district, setDistrict] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');

  const rooms = useMemo(() => {
    return bookingRooms.filter((room) => {
      const districtMatch = district === 'Tất cả' || room.district === district;
      const typeMatch = type === 'Tất cả' || room.type === type;
      return districtMatch && typeMatch;
    });
  }, [district, type]);

  return (
    <div className="min-h-screen bg-booking-surface text-booking-text">
      <BookingHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="rounded-2xl border border-booking-border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-booking-primary">Tìm kiếm phòng</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Không gian phù hợp với nhịp sống của bạn</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-booking-muted">
              Lọc nhanh theo khu vực và loại phòng. Dữ liệu hiện là mẫu giao diện, sẵn sàng nối API ở giai đoạn sau.
            </p>
          </div>
          <SearchBento compact />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-xl border border-booking-border bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold">Bộ lọc</h2>
            <label className="mt-5 block text-sm font-semibold text-booking-text">
              Khu vực
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="mt-2 w-full rounded-lg border border-booking-border bg-booking-surface px-3 py-3 text-sm outline-none focus:border-booking-primary"
              >
                {districts.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold text-booking-text">
              Loại phòng
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="mt-2 w-full rounded-lg border border-booking-border bg-booking-surface px-3 py-3 text-sm outline-none focus:border-booking-primary"
              >
                {types.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{rooms.length} phòng phù hợp</h2>
              <span className="rounded-full border border-booking-border bg-white px-3 py-1 text-sm text-booking-muted">
                Sắp xếp: Đề xuất
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <BookingFooter />
      <BookingChatFab />
    </div>
  );
}
