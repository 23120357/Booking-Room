'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import HostGuard from '@/components/host/HostGuard';
import HostRoomForm from '@/components/host/HostRoomForm';
import HostShell from '@/components/host/HostShell';
import { createRoom } from '@/services/roomService';
import type { RoomMutationPayload } from '@/types/room';

export default function NewHostRoomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(payload: RoomMutationPayload) {
    setSubmitting(true);
    try {
      await createRoom(payload);
      setMessage('Tin đăng đã được gửi duyệt');
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
          <p className="text-sm font-bold uppercase tracking-wide text-booking-primary">Thêm tin mới</p>
          <h1 className="mt-2 text-3xl font-black">Tạo tin đăng phòng</h1>
          <p className="mt-2 max-w-3xl text-booking-muted">
            Host nhập thông tin phòng tại đây. Sau khi gửi, tin đăng sẽ ở trạng thái chờ admin duyệt trước khi hiển thị công khai.
          </p>
        </div>
        {message ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}
        <HostRoomForm submitLabel="Gửi duyệt tin đăng" submitting={submitting} onSubmit={handleSubmit} />
      </HostShell>
    </HostGuard>
  );
}
