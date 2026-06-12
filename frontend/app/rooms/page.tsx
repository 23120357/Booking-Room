'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingChatFab from '@/components/booking/BookingChatFab';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingHeader from '@/components/booking/BookingHeader';
import RoomCard from '@/components/booking/RoomCard';
import SearchBento from '@/components/booking/SearchBento';
import { getRooms, toDisplayRoom } from '@/services/roomService';
import type { DisplayRoom } from '@/types/room';

const districts = ['Tất cả', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Thủ Đức'];
const types = ['Tất cả', 'Room', 'Apartment', 'Ở ghép'];

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const [district, setDistrict] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => {
    return {
      keyword: searchParams.get('keyword') || searchParams.get('q') || undefined,
      location: district !== 'Tất cả' ? district : searchParams.get('location') || undefined,
      roomType: type !== 'Tất cả' ? type : searchParams.get('roomType') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort: sort || undefined,
      page: 1,
      limit: 20,
    };
  }, [district, type, sort, searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getRooms(filters)
      .then((result) => {
        if (active) setRooms(result.items.map(toDisplayRoom));
      })
      .catch(() => {
        if (active) {
          setRooms([]);
          setError('Không thể tải danh sách phòng. Vui lòng kiểm tra backend.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

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
              Lọc nhanh theo khu vực và loại phòng. Danh sách được lấy từ Room API đã duyệt.
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
            <label className="mt-5 block text-sm font-semibold text-booking-text">
              Sắp xếp
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="mt-2 w-full rounded-lg border border-booking-border bg-booking-surface px-3 py-3 text-sm outline-none focus:border-booking-primary"
              >
                <option value="">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating_desc">Đánh giá cao</option>
              </select>
            </label>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{loading ? 'Đang tải phòng...' : `${rooms.length} phòng phù hợp`}</h2>
              <span className="rounded-full border border-booking-border bg-white px-3 py-1 text-sm text-booking-muted">
                Nguồn: API
              </span>
            </div>
            {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="min-h-[260px] animate-pulse rounded-xl border border-booking-border bg-white" />
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-booking-border bg-white p-8 text-center text-booking-muted">
                Không tìm thấy phòng phù hợp.
              </div>
            )}
          </div>
        </section>
      </main>

      <BookingFooter />
      <BookingChatFab />
    </div>
  );
}
