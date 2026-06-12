'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/host', label: 'Tổng quan', icon: 'DB', disabled: true },
  { href: '/host/rooms', label: 'Tin đăng', icon: 'TD' },
  { href: '/host/calendar', label: 'Giao dịch', icon: 'GD', disabled: true },
  { href: '/host/revenue', label: 'Doanh thu', icon: 'DT', disabled: true },
  { href: '/host/chat', label: 'Tin nhắn', icon: 'TN', disabled: true },
];

export default function HostShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const initials = user?.full_name
    ?.split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-booking-bg text-booking-text">
      <div className="mx-auto grid w-full max-w-[1440px] gap-0 lg:grid-cols-[236px_1fr]">
        <aside className="border-b border-booking-border bg-white px-4 py-4 shadow-sm lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-booking-primary text-xs font-black text-white">
              {initials || 'H'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-booking-primary">{user?.full_name || 'Chủ nhà'}</p>
              <p className="truncate text-[11px] font-semibold text-booking-muted">Tài khoản chủ nhà</p>
            </div>
          </div>

          <Link
            href="/host/rooms/new"
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-booking-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-booking-primaryDark"
          >
            + Thêm tin mới
          </Link>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = item.href === '/host/rooms' ? pathname.startsWith('/host/rooms') : pathname === item.href;
              const className = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                active
                  ? 'bg-booking-primary text-white shadow-sm'
                  : item.disabled
                    ? 'cursor-not-allowed text-booking-muted opacity-70'
                    : 'text-booking-muted hover:bg-booking-surface hover:text-booking-primary'
              }`;

              if (item.disabled) {
                return (
                  <span key={item.href} className={className} title="Chưa triển khai backend/API cho mục này">
                    <span className="w-6 text-center text-[11px]">{item.icon}</span>
                    {item.label}
                  </span>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={className}>
                  <span className="w-6 text-center text-[11px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-booking-border bg-booking-surface/90 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex min-h-11 items-center justify-end">
              <Link href="/" className="rounded-lg border border-booking-border bg-white px-4 py-2 text-sm font-bold text-booking-text transition hover:border-booking-primary hover:text-booking-primary">
                Trang chủ
              </Link>
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
