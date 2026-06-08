'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import AuthInput from '@/components/auth/AuthInput';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from '@/components/auth/AuthIcons';
import AuthShell from '@/components/auth/AuthShell';
import AuthTabs from '@/components/auth/AuthTabs';
import SocialButtons from '@/components/auth/SocialButtons';
import { ArrowRightIcon } from '@/components/booking/Icons';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: submitted && !name.trim() ? 'Vui lòng nhập họ tên.' : '',
    email: submitted && !email.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : '',
    password: submitted && password.length < 6 ? 'Mật khẩu cần ít nhất 6 ký tự.' : '',
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!name.trim() || !email.trim() || password.length < 6) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
    }, 700);
  }

  return (
    <AuthShell>
      <AuthTabs active="register" />
      <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
      <p className="mt-4 text-sm leading-6 text-booking-muted">Đăng ký để lưu phòng yêu thích, đặt lịch xem phòng và theo dõi giao dịch.</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Họ và tên"
          value={name}
          onChange={setName}
          placeholder="Nhập họ tên"
          error={errors.name}
          icon={<UserIcon className="h-5 w-5 shrink-0" />}
        />
        <AuthInput
          label="Email hoặc Số điện thoại"
          value={email}
          onChange={setEmail}
          placeholder="Nhập email hoặc SĐT"
          error={errors.email}
          icon={<MailIcon className="h-5 w-5 shrink-0" />}
        />
        <AuthInput
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          placeholder="Tối thiểu 6 ký tự"
          type={showPassword ? 'text' : 'password'}
          error={errors.password}
          icon={<LockIcon className="h-5 w-5 shrink-0" />}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setShowPassword((value) => !value)}
          className="float-right -mt-[46px] mr-3 text-booking-muted"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="!mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-booking-primary px-5 py-4 font-bold text-white shadow-sm transition hover:bg-booking-primaryDark disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Đang xử lý...' : 'Đăng ký'}
          <ArrowRightIcon />
        </button>
      </form>

      <div className="my-8 flex items-center gap-4 text-sm text-booking-muted">
        <span className="h-px flex-1 bg-booking-border" />
        hoặc tiếp tục với
        <span className="h-px flex-1 bg-booking-border" />
      </div>
      <SocialButtons mode="Đăng ký" />
      <p className="mt-6 text-center text-sm text-booking-muted">
        Đã có tài khoản?{' '}
        <Link href="/auth/login" className="font-bold text-booking-primary">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
