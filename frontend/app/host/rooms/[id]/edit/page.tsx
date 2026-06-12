'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HostGuard from '@/components/host/HostGuard';
import HostRoomForm from '@/components/host/HostRoomForm';
import HostShell from '@/components/host/HostShell';
import { getRoomById, updateRoom } from '@/services/roomService';
import type { ApiRoom, RoomMutationPayload } from '@/types/room';

export default function EditHostRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roomId = params.id;
  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      try {
        setLoading(true);
        setError('');
        const data = await getRoomById(roomId);
        if (mounted) setRoom(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải thông tin phòng.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRoom();
    return () => {
      mounted = false;
    };
  }, [roomId]);

  async function handleSubmit(payload: RoomMutationPayload) {
    setSubmitting(true);
    try {
      await updateRoom(roomId, payload);
      setMessage('Phòng đã được cập nhật và đang chờ duyệt lại');
      window.setTimeout(() => router.push('/host/rooms'), 700);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <HostGuard>
      <HostShell>
        <Link href="/host/rooms" className="text-sm font-bold text-booking-primary hover:underline">
          ← Quay lại danh sách
        </Link>
        <div className="mb-6 mt-4">
          <p className="text-sm font-bold uppercase tracking-wide text-booking-primary">Edit listing</p>
          <h1 className="mt-2 text-3xl font-black">Chỉnh sửa phòng</h1>
          <p className="mt-2 max-w-3xl text-booking-muted">
            Cập nhật thông tin bài đăng của bạn. Sau khi lưu, bài đăng có thể cần admin duyệt lại trước khi hiển thị.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-booking-border bg-white p-8 shadow-sm">
            <div className="h-7 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-48 animate-pulse rounded bg-slate-200" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && message ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        {!loading && room ? (
          <HostRoomForm
            key={room.room_id}
            initialRoom={room}
            submitLabel="Lưu thay đổi"
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </HostShell>
    </HostGuard>
  );
}
