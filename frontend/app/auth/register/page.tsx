'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import AuthInput from '@/components/auth/AuthInput';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from '@/components/auth/AuthIcons';
import AuthShell from '@/components/auth/AuthShell';
import AuthTabs from '@/components/auth/AuthTabs';
import SocialButtons from '@/components/auth/SocialButtons';
import { ArrowRightIcon } from '@/components/booking/Icons';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'TENANT' | 'HOST'>('TENANT');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const passwordIsValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  const errors = {
    name: submitted && !name.trim() ? 'Vui lòng nhập họ tên.' : '',
    email: submitted && !email.trim() ? 'Vui lòng nhập email.' : '',
    password: submitted && !passwordIsValid
      ? 'Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
      : '',
    confirmPassword: submitted && password !== confirmPassword ? 'Mật khẩu xác nhận không khớp.' : '',
    idCardFrontUrl: submitted && role === 'HOST' && !idCardFrontUrl.trim() ? 'Chủ nhà cần ảnh CCCD mặt trước.' : '',
    idCardBackUrl: submitted && role === 'HOST' && !idCardBackUrl.trim() ? 'Chủ nhà cần ảnh CCCD mặt sau.' : '',
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');
    if (
      !name.trim() ||
      !email.trim() ||
      !passwordIsValid ||
      password !== confirmPassword ||
      (role === 'HOST' && (!idCardFrontUrl.trim() || !idCardBackUrl.trim()))
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        fullName: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        confirmPassword,
        role,
        idCardFrontUrl: role === 'HOST' ? idCardFrontUrl.trim() : undefined,
        idCardBackUrl: role === 'HOST' ? idCardBackUrl.trim() : undefined,
      });
      router.push(user.role === 'HOST' ? '/host' : '/rooms');
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Không thể đăng ký. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
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
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="Nhập email"
          error={errors.email}
          icon={<MailIcon className="h-5 w-5 shrink-0" />}
        />
        <AuthInput
          label="Số điện thoại"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Nhập số điện thoại"
          icon={<UserIcon className="h-5 w-5 shrink-0" />}
        />
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.05em] text-booking-text">Vai trò</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as 'TENANT' | 'HOST')}
            className="min-h-11 w-full rounded-lg border border-booking-border bg-booking-surface px-3 text-booking-text outline-none focus:border-booking-primary"
          >
            <option value="TENANT">Người thuê</option>
            <option value="HOST">Chủ nhà</option>
          </select>
        </label>
        <AuthInput
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          placeholder="Tối thiểu 8 ký tự"
          type={showPassword ? 'text' : 'password'}
          error={errors.password}
          icon={<LockIcon className="h-5 w-5 shrink-0" />}
        />
        <AuthInput
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Nhập lại mật khẩu"
          type={showPassword ? 'text' : 'password'}
          error={errors.confirmPassword}
          icon={<LockIcon className="h-5 w-5 shrink-0" />}
        />
        {role === 'HOST' ? (
          <div className="space-y-4">
            <AuthInput
              label="URL CCCD mặt trước"
              value={idCardFrontUrl}
              onChange={setIdCardFrontUrl}
              placeholder="https://..."
              error={errors.idCardFrontUrl}
              icon={<UserIcon className="h-5 w-5 shrink-0" />}
            />
            <AuthInput
              label="URL CCCD mặt sau"
              value={idCardBackUrl}
              onChange={setIdCardBackUrl}
              placeholder="https://..."
              error={errors.idCardBackUrl}
              icon={<UserIcon className="h-5 w-5 shrink-0" />}
            />
          </div>
        ) : null}
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
        {serverError ? <p className="text-sm font-semibold text-red-600">{serverError}</p> : null}
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
