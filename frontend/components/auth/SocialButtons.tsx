export default function SocialButtons({ mode }: { mode: 'Đăng nhập' | 'Đăng ký' }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-booking-border bg-booking-surface px-4 py-2.5 font-bold text-booking-text shadow-sm transition hover:border-booking-primary"
      >
        <span className="grid h-5 w-5 place-items-center rounded-sm bg-white text-xs shadow-sm">G</span>
        {mode} bằng Google
      </button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-booking-border bg-booking-surface px-4 py-2.5 font-bold text-booking-text shadow-sm transition hover:border-booking-primary"
      >
        <span className="grid h-5 w-5 place-items-center rounded-sm bg-[#4267b2] text-xs text-white">f</span>
        {mode} bằng Facebook
      </button>
    </div>
  );
}
