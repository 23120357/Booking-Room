'use client';

import { useState } from 'react';
import { BotIcon } from './Icons';

export default function BookingChatFab() {
  const [showBubble, setShowBubble] = useState(true);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2 sm:right-6">
      {showBubble ? (
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
      ) : null}
      <button
        type="button"
        aria-label="Mở trợ lý AI"
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-booking-primary to-booking-teal text-white shadow-xl transition hover:scale-105"
      >
        <BotIcon className="h-7 w-7" />
      </button>
    </div>
  );
}
