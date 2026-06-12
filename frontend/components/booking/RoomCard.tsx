import Link from 'next/link';
import type { DisplayRoom } from '@/types/room';
import { CheckIcon, HeartIcon, MapPinIcon } from './Icons';

type RoomCardProps = {
  room: DisplayRoom;
  featured?: boolean;
};

export default function RoomCard({ room, featured = false }: RoomCardProps) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className={`group relative block overflow-hidden rounded-xl border border-booking-border/40 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${
        featured ? 'min-h-[260px] md:min-h-[300px]' : 'min-h-[260px]'
      }`}
    >
      <img
        src={room.image}
        alt={room.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-booking-text/85 via-booking-text/15 to-transparent" />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        {room.verified ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-booking-teal px-2 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-white shadow-sm">
            <CheckIcon className="h-3.5 w-3.5" />
            Đã xác thực
          </span>
        ) : null}
        {room.isNew ? (
          <span className="rounded-md bg-booking-surface px-2 py-1 text-xs font-bold text-booking-text shadow-sm">
            Mới
          </span>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Lưu phòng"
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-booking-surface/70 text-booking-text backdrop-blur-sm transition hover:bg-white"
      >
        <HeartIcon className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
        <div className="min-w-0">
          <h3 className={`${featured ? 'text-lg sm:text-xl' : 'text-base'} truncate font-bold drop-shadow`}>
            {room.title}
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-booking-surface/85">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{room.location}</span>
          </p>
        </div>
        <p className="shrink-0 text-right font-bold drop-shadow">
          <span className={featured ? 'text-xl' : 'text-lg'}>{room.priceLabel}</span>
          <span className="text-xs font-normal text-booking-surface/85">/tháng</span>
        </p>
      </div>
    </Link>
  );
}
