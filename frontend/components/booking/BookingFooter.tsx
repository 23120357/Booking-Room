const footerGroups = [
  { title: 'Công ty', links: ['Về chúng tôi', 'Cơ hội nghề nghiệp', 'Báo chí'] },
  { title: 'Hỗ trợ', links: ['Trung tâm hỗ trợ', 'An toàn & Tin cậy', 'Chính sách hủy phòng'] },
  { title: 'Pháp lý', links: ['Chính sách bảo mật', 'Điều khoản sử dụng'] },
];

export default function BookingFooter() {
  return (
    <footer className="border-t border-booking-border bg-booking-border/45">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-xl font-bold text-booking-primary">Booking-Room</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-booking-muted">
            Tìm phòng ưng ý, định cư lâu dài. Nền tảng uy tín, chất lượng hàng đầu HCMUS.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.05em] text-booking-text">{group.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-booking-muted">
              {group.links.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-booking-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-booking-border/60">
        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-booking-muted sm:px-6">
          © 2026 Booking-Room. Tìm phòng ưng ý, định cư lâu dài.
        </div>
      </div>
    </footer>
  );
}
