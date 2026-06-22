'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HostActivePage =
  | 'overview'
  | 'listings'
  | 'transactions'
  | 'revenue'
  | 'messages';

interface HostSidebarProps {
  user: User | null;
  onLogout: () => void;
  activePage?: HostActivePage;
}

// ─── Nav items config ─────────────────────────────────────────────────────────

interface NavItem {
  key: HostActivePage;
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Tổng quan', href: '/host', icon: LayoutDashboard },
  { key: 'listings', label: 'Tin đăng', href: '/host/listings', icon: FileText },
  { key: 'transactions', label: 'Giao dịch', href: '/host/transactions', icon: CreditCard },
  { key: 'revenue', label: 'Doanh thu', href: '/host/revenue', icon: TrendingUp },
  { key: 'messages', label: 'Tin nhắn', href: '/host/messages', icon: MessageSquare },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HostSidebar({
  user,
  onLogout,
  activePage = 'overview',
}: HostSidebarProps) {
  const displayName = user?.fullName || 'DPVinhIT';
  const avatarSrc = user?.avatarUrl || '/images/booking/host/host-avatar.jpg';

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:flex">
      {/* Profile area */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <img
          src={avatarSrc}
          alt={displayName}
          className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-tight text-booking-primary">
            {displayName}
          </p>
          <p className="truncate text-xs text-slate-500">Tài khoản đã xác thực</p>
        </div>
      </div>

      {/* Add room CTA */}
      <div className="px-4 pt-6">
        <Link
          href="/host/listings/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-booking-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-booking-primaryDark"
        >
          <Plus size={18} />
          <span>Thêm phòng mới</span>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-booking-teal/20 font-semibold text-booking-teal'
                  : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-booking-teal' : 'text-slate-500'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="space-y-1 border-t border-slate-200 p-4">
        <Link
          href="/host/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings size={20} className="text-slate-500" />
          <span>Cài đặt</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} className="text-slate-500" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
