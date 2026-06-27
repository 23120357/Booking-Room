'use client';

import type { User } from '@/types/user';
import { useTranslation } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import HostNotificationBell from '@/components/host/HostNotificationBell';

interface HostTopbarProps {
  user: User | null;
}

export default function HostTopbar({ user }: HostTopbarProps) {
  const { t } = useTranslation();
  const displayName = user?.fullName || 'DPVinhIT';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-booking-border/30 bg-booking-surface px-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:px-6 lg:justify-end lg:px-12">
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <img
          src={user?.avatarUrl || '/images/booking/host/host-avatar.jpg'}
          alt={displayName}
          className="h-9 w-9 rounded-full border border-booking-border object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-booking-teal">{displayName}</p>
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.5px] text-booking-muted">
            {t('host.listings.hostRole')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HostNotificationBell />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
