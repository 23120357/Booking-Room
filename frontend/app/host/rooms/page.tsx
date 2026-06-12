'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import HostGuard from '@/components/host/HostGuard';
import HostShell from '@/components/host/HostShell';
import { deleteRoom, formatPrice, getMyRooms } from '@/services/roomService';
import type { ApiRoom } from '@/types/room';

type FilterKey = 'ALL' | 'APPROVED' | 'RENTED' | 'PENDING';

function approvalLabel(status: ApiRoom['approval_status']) {
  if (status === 'APPROVED') return 'Đang hoạt động';
  if (status === 'REJECTED') return 'Bị từ chối';
  return 'Chờ duyệt';
}

function approvalClass(status: ApiRoom['approval_status']) {
  if (status === 'APPROVED') return 'bg-emerald-600 text-white';
  if (status === 'REJECTED') return 'bg-red-600 text-white';
  return 'bg-amber-600 text-white';
}

function formatDate(value?: string) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function coverImage(room: ApiRoom) {
  return room.cover_image_url || room.images.find((image) => image.is_cover)?.image_url || room.images[0]?.image_url || '';
}

function RoomCover({ room }: { room: ApiRoom }) {
  const [failed, setFailed] = useState(false);
  const src = coverImage(room);

  if (!src || failed) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#eef1f8] px-4 text-center text-sm font-bold text-booking-muted">
        Chưa có ảnh
      </div>
    );
  }

  return <img src={src} alt={room.title} onError={() => setFailed(true)} className="aspect-[16/10] w-full object-cover" />;
}

function filterRooms(rooms: ApiRoom[], filter: FilterKey) {
  if (filter === 'APPROVED') return rooms.filter((room) => room.approval_status === 'APPROVED' && room.status === 'AVAILABLE');
  if (filter === 'RENTED') return rooms.filter((room) => room.status === 'RENTED');
  if (filter === 'PENDING') return rooms.filter((room) => room.approval_status === 'PENDING');
  return rooms;
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl border border-booking-border bg-white shadow-sm">
          <div className="aspect-[16/10] animate-pulse bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HostRoomsPage() {
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRooms() {
      try {
        setLoading(true);
        setError('');
        const data = await getMyRooms();
        if (mounted) setRooms(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải danh sách tin đăng.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedRooms = useMemo(
    () =>
      [...rooms].sort((a, b) => {
        const first = new Date(a.updated_at || a.created_at || '').getTime();
        const second = new Date(b.updated_at || b.created_at || '').getTime();
        return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
      }),
    [rooms],
  );

  const counts = useMemo(
    () => ({
      ALL: rooms.length,
      APPROVED: rooms.filter((room) => room.approval_status === 'APPROVED' && room.status === 'AVAILABLE').length,
      RENTED: rooms.filter((room) => room.status === 'RENTED').length,
      PENDING: rooms.filter((room) => room.approval_status === 'PENDING').length,
    }),
    [rooms],
  );

  const visibleRooms = useMemo(() => {
    const filtered = filterRooms(sortedRooms, filter);
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return filtered;
    return filtered.filter((room) => `${room.title} ${room.detailed_address}`.toLowerCase().includes(normalizedKeyword));
  }, [filter, keyword, sortedRooms]);

  async function handleDelete(room: ApiRoom) {
    const confirmed = window.confirm(`Xóa tin đăng "${room.title}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      setDeletingId(room.room_id);
      setError('');
      await deleteRoom(room.room_id);
      setRooms((current) => current.filter((item) => item.room_id !== room.room_id));
      setMessage('Đã xóa tin đăng.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa tin đăng.');
    } finally {
      setDeletingId(null);
    }
  }

  const filterItems: Array<{ key: FilterKey; label: string }> = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'APPROVED', label: 'Đang hoạt động' },
    { key: 'RENTED', label: 'Đã cho thuê' },
    { key: 'PENDING', label: 'Chờ duyệt' },
  ];

  return (
    <HostGuard>
      <HostShell>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">Quản lý tin đăng</h1>
            <p className="mt-2 text-sm text-booking-muted">Quản lý phòng/tin đăng hiệu quả. Tin mới sẽ chờ admin duyệt trước khi công khai.</p>
          </div>
          <Link
            href="/host/rooms/new"
            className="inline-flex justify-center rounded-lg bg-booking-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-booking-primaryDark"
          >
            + Thêm tin mới
          </Link>
        </div>

        <section className="mb-6 rounded-xl border border-booking-border bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              className="min-h-11 flex-1 rounded-lg border border-transparent bg-booking-surface px-4 text-sm outline-none transition focus:border-booking-primary"
            />
            <div className="flex flex-wrap gap-2">
              {filterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    filter === item.key
                      ? 'bg-booking-primary text-white'
                      : 'border border-booking-border bg-white text-booking-muted hover:border-booking-primary hover:text-booking-primary'
                  }`}
                >
                  {item.label} ({counts[item.key]})
                </button>
              ))}
            </div>
          </div>
        </section>

        {message ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? <LoadingGrid /> : null}

        {!loading && visibleRooms.length === 0 ? (
          <section className="rounded-xl border border-booking-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Chưa có tin đăng phù hợp</h2>
            <p className="mx-auto mt-3 max-w-xl text-booking-muted">
              Host có thể thêm thông tin phòng trước. Khi nhấn thêm tin mới, bài đăng sẽ được gửi admin duyệt.
            </p>
            <Link
              href="/host/rooms/new"
              className="mt-6 inline-flex rounded-lg bg-booking-primary px-5 py-3 font-bold text-white shadow-sm transition hover:bg-booking-primaryDark"
            >
              + Thêm tin mới
            </Link>
          </section>
        ) : null}

        {!loading && visibleRooms.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleRooms.map((room) => (
              <article key={room.room_id} className="overflow-hidden rounded-xl border border-booking-border bg-white shadow-sm">
                <div className="relative">
                  <RoomCover room={room} />
                  <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${approvalClass(room.approval_status)}`}>
                    {approvalLabel(room.approval_status)}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-1 text-lg font-black">{room.title}</h2>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-booking-primary">{formatPrice(room.monthly_rent)}</p>
                      <p className="text-[11px] text-booking-muted">/ tháng</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm text-booking-muted">{room.detailed_address}</p>
                  <p className="mt-3 text-xs font-semibold text-booking-muted">
                    Tạo: {formatDate(room.created_at)} · Cập nhật: {formatDate(room.updated_at)}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-booking-border pt-3">
                    <span className="rounded-full border border-booking-border bg-booking-surface px-3 py-1 text-xs font-bold text-booking-muted">
                      {room.status === 'RENTED' ? 'Đã cho thuê' : room.status === 'LOCKED' ? 'Đang khóa' : 'Hiển thị'}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/rooms/${room.room_id}`} className="rounded-lg border border-booking-border px-3 py-2 text-sm font-bold transition hover:border-booking-primary hover:text-booking-primary">
                        Xem
                      </Link>
                      <Link href={`/host/rooms/${room.room_id}/edit`} className="rounded-lg border border-booking-border px-3 py-2 text-sm font-bold transition hover:border-booking-primary hover:text-booking-primary">
                        Sửa
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(room)}
                        disabled={deletingId === room.room_id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
                      >
                        {deletingId === room.room_id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </HostShell>
    </HostGuard>
  );
}
