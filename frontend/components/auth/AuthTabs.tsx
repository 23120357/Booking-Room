import Link from 'next/link';

type AuthTabsProps = {
  active: 'login' | 'register';
};

export default function AuthTabs({ active }: AuthTabsProps) {
  const itemClass = (value: 'login' | 'register') =>
    `flex-1 border-b-2 pb-3 text-center text-base font-bold transition ${
      active === value ? 'border-booking-primary text-booking-primary' : 'border-booking-border text-booking-muted hover:text-booking-text'
    }`;

  return (
    <div className="mb-6 flex border-b border-booking-border">
      <Link href="/auth/login" className={itemClass('login')}>
        Đăng nhập
      </Link>
      <Link href="/auth/register" className={itemClass('register')}>
        Đăng ký
      </Link>
    </div>
  );
}
