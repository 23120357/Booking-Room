'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function HostGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-booking-bg p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-booking-border bg-white p-8 text-center shadow-sm">
          <p className="font-bold">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'HOST') {
    return (
      <div className="min-h-screen bg-booking-bg p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-booking-border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-3 text-booking-muted">Khu vực này chỉ dành cho tài khoản chủ nhà.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex justify-center rounded-lg border border-booking-border px-5 py-3 font-bold">
              Về trang chủ
            </Link>
            <Link href="/rooms" className="inline-flex justify-center rounded-lg bg-booking-primary px-5 py-3 font-bold text-white">
              Tìm phòng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
