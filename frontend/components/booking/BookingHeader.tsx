'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SearchIcon } from './Icons';

export default function BookingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const isRoomsActive = pathname === '/rooms' || pathname.startsWith('/rooms/');
  const isHostActive = pathname === '/host' || pathname.startsWith('/host/');

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-booking-border bg-booking-surface/90 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link href="/" className="shrink-0 text-xl font-black tracking-normal text-booking-primary sm:text-2xl">
            Booking-Room
          </Link>
          <label className="hidden h-11 w-full max-w-[260px] items-center gap-2 rounded-full border border-booking-border bg-[#f3f3fe] px-4 text-booking-muted md:flex">
            <SearchIcon className="h-4 w-4 shrink-0" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-booking-muted"
              placeholder="Tìm kiếm nhanh..."
            />
          </label>
        </div>

        <nav className="flex shrink-0 items-center gap-3 text-sm font-semibold text-booking-muted sm:gap-5">
          <Link
            href="/host"
            className={`hidden pb-2 transition hover:text-booking-primary sm:inline-flex ${
              isHostActive ? 'border-b-2 border-booking-primary text-booking-primary' : 'border-b-2 border-transparent'
            }`}
          >
            Chủ nhà
          </Link>
          <Link
            href="/rooms"
            className={`hidden pb-2 transition hover:text-booking-primary sm:inline-flex ${
              isRoomsActive ? 'border-b-2 border-booking-primary text-booking-primary' : 'border-b-2 border-transparent'
            }`}
          >
            Tìm phòng
          </Link>
          {!loading && user ? (
            <>
              <span className="hidden max-w-[180px] truncate text-booking-text md:inline">{user.full_name}</span>
              <button type="button" onClick={handleLogout} className="transition hover:text-booking-primary">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="transition hover:text-booking-primary">
                Đăng nhập
              </Link>
              <Link href="/auth/register" className="rounded-full bg-booking-primary px-4 py-2 text-white shadow-sm transition hover:bg-booking-primaryDark">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
