'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BotIcon } from './Icons';

// Lazy-load MapModal — Leaflet cần window object, không SSR được
const MapModal = dynamic(() => import('@/components/guest/MapModal'), { ssr: false });

export default function BookingChatFab() {
  const [showBubble, setShowBubble] = useState(true);
  const [showMapTooltip, setShowMapTooltip] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      {/* Modal bản đồ — render khi người dùng bấm nút */}
      {isMapOpen && <MapModal onClose={() => setIsMapOpen(false)} />}

      {/* FAB stack — góc dưới bên phải */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">

        {/* Bubble lời chào chatbot */}
        {showBubble && (
          <div className="relative max-w-[210px] rounded-bl-2xl rounded-br-sm rounded-t-2xl border border-booking-border bg-booking-surface/95 px-4 py-3 text-sm text-booking-text shadow-xl backdrop-blur-md">
            <button
              type="button"
              aria-label="Ẩn lời chào"
              onClick={() => setShowBubble(false)}
              className="absolute right-2 top-1 text-booking-muted transition hover:text-booking-text"
            >
              ×
            </button>
            Tôi có thể giúp bạn tìm phòng không?
          </div>
        )}

        {/* ── Nút Google Maps (nằm TRÊN chatbot) ── */}
        <div className="relative flex items-center">
          {/* Tooltip */}
          {showMapTooltip && !isMapOpen && (
            <div className="absolute right-16 whitespace-nowrap rounded-xl border border-booking-border bg-white px-3 py-1.5 text-xs font-semibold text-booking-text shadow-lg">
              Phòng trọ gần bạn
            </div>
          )}

          <button
            id="google-maps-fab-btn"
            type="button"
            aria-label="Xem phòng trọ gần bạn trên bản đồ"
            onClick={() => setIsMapOpen(true)}
            onMouseEnter={() => setShowMapTooltip(true)}
            onMouseLeave={() => setShowMapTooltip(false)}
            className={`grid h-12 w-12 place-items-center rounded-full shadow-xl ring-1 transition hover:scale-110 hover:shadow-2xl active:scale-95 ${
              isMapOpen
                ? 'bg-[#1a73e8] ring-[#1a73e8]/30'
                : 'bg-white ring-booking-border'
            }`}
          >
            {/* Pin icon màu Google Maps */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill={isMapOpen ? 'white' : '#EA4335'}
              />
              <circle cx="12" cy="9" r="2.5" fill={isMapOpen ? '#1a73e8' : 'white'} />
            </svg>
          </button>
        </div>

        {/* ── Nút Chatbot AI ── */}
        <button
          type="button"
          aria-label="Mở trợ lý AI"
          className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-booking-primary to-booking-teal text-white shadow-xl transition hover:scale-105"
        >
          <BotIcon className="h-7 w-7" />
        </button>
      </div>
    </>
  );
}
