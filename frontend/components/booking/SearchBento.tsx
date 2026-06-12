'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPinIcon, SearchIcon, WalletIcon } from './Icons';

const roomTypes = ['Phòng trọ', 'Căn hộ', 'Ở ghép'];

export default function SearchBento({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set('keyword', location.trim());
      params.set('location', location.trim());
    }
    if (budget.trim()) params.set('maxPrice', budget.replace(/[^\d]/g, ''));
    if (type) params.set('roomType', type);
    router.push(`/rooms${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className={`mx-auto w-full rounded-xl border border-booking-border bg-booking-surface p-3 shadow-[0_10px_22px_rgba(25,27,35,0.12)] ${compact ? '' : 'max-w-4xl sm:p-4'}`}>
      <div className="grid gap-2 md:grid-cols-[1.35fr_1fr_1fr_auto] md:items-center">
        <label className="flex min-h-14 items-center gap-3 rounded-lg border border-booking-border bg-white px-4 text-booking-primary transition focus-within:border-booking-primary">
          <MapPinIcon className="h-5 w-5 shrink-0" />
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Khu vực, quận, huyện hoặc tên đường..."
            className="w-full bg-transparent text-sm text-booking-text outline-none placeholder:text-booking-muted"
          />
        </label>
        <label className="flex min-h-14 items-center gap-3 rounded-lg border border-booking-border bg-white px-4 text-booking-primary transition focus-within:border-booking-primary">
          <WalletIcon className="h-5 w-5 shrink-0" />
          <input
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Giá phòng bạn mong muốn"
            className="w-full bg-transparent text-sm text-booking-text outline-none placeholder:text-booking-muted"
          />
        </label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="min-h-14 rounded-lg border border-booking-border bg-white px-4 text-sm text-booking-text outline-none transition focus:border-booking-primary"
        >
          <option value="">Loại phòng</option>
          {roomTypes.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-booking-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-booking-primaryDark"
        >
          <SearchIcon className="h-4 w-4" />
          Tìm ngay
        </button>
      </div>
    </div>
  );
}
