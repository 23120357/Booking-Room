'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { ApiRoom, RoomMutationPayload } from '@/types/room';

type HostRoomFormProps = {
  initialRoom?: ApiRoom;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (payload: RoomMutationPayload) => Promise<void>;
};

type FormState = {
  title: string;
  room_type: string;
  detailed_address: string;
  max_capacity: string;
  monthly_rent: string;
  deposit_amount: string;
  electricity_cost: string;
  water_cost: string;
  internet_cost: string;
  service_fee: string;
  room_description: string;
  longitude: string;
  latitude: string;
  images: string;
};

function initialState(room?: ApiRoom): FormState {
  return {
    title: room?.title || '',
    room_type: room?.room_type || 'Room',
    detailed_address: room?.detailed_address || '',
    max_capacity: room?.max_capacity ? String(room.max_capacity) : '',
    monthly_rent: room?.monthly_rent ? String(room.monthly_rent) : '',
    deposit_amount: room?.deposit_amount ? String(room.deposit_amount) : '',
    electricity_cost: room?.electricity_cost ? String(room.electricity_cost) : '',
    water_cost: room?.water_cost ? String(room.water_cost) : '',
    internet_cost: room?.internet_cost !== undefined ? String(room.internet_cost) : '0',
    service_fee: room?.service_fee !== undefined ? String(room.service_fee) : '0',
    room_description: room?.room_description || '',
    longitude: room?.longitude !== null && room?.longitude !== undefined ? String(room.longitude) : '',
    latitude: room?.latitude !== null && room?.latitude !== undefined ? String(room.latitude) : '',
    images: room?.images.map((image) => image.image_url).join('\n') || '',
  };
}

function numberValue(value: string) {
  if (value.trim() === '') return undefined;
  return Number(value);
}

function nullableNumberValue(value: string) {
  if (value.trim() === '') return null;
  return Number(value);
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-booking-text">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className={`min-h-11 w-full rounded-lg border bg-booking-surface px-3 text-sm outline-none transition focus:border-booking-primary ${
          error ? 'border-red-400' : 'border-booking-border'
        }`}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

export default function HostRoomForm({ initialRoom, submitting = false, submitLabel, onSubmit }: HostRoomFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initialRoom));
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Vui lòng nhập tiêu đề.';
    if (!form.room_type.trim()) next.room_type = 'Vui lòng nhập loại phòng.';
    if (!form.detailed_address.trim()) next.detailed_address = 'Vui lòng nhập địa chỉ.';

    const requiredNumbers = [
      ['max_capacity', 'Sức chứa', 1],
      ['monthly_rent', 'Giá thuê', 0],
      ['deposit_amount', 'Tiền cọc', 0],
      ['electricity_cost', 'Tiền điện', 0],
      ['water_cost', 'Tiền nước', 0],
    ] as const;

    for (const [key, label, min] of requiredNumbers) {
      const value = Number(form[key]);
      if (!form[key].trim() || !Number.isFinite(value) || value < min) {
        next[key] = `${label} phải là số >= ${min}.`;
      }
    }

    for (const key of ['internet_cost', 'service_fee'] as const) {
      const value = Number(form[key]);
      if (form[key].trim() && (!Number.isFinite(value) || value < 0)) {
        next[key] = 'Giá trị phải là số >= 0.';
      }
    }

    const longitude = Number(form.longitude);
    const latitude = Number(form.latitude);
    if (form.longitude.trim() && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      next.longitude = 'Kinh độ phải từ -180 đến 180.';
    }
    if (form.latitude.trim() && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      next.latitude = 'Vĩ độ phải từ -90 đến 90.';
    }

    return next;
  }, [form]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');

    if (Object.keys(errors).length > 0) return;

    const imageUrls = form.images
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        title: form.title.trim(),
        room_type: form.room_type.trim(),
        detailed_address: form.detailed_address.trim(),
        max_capacity: Number(form.max_capacity),
        monthly_rent: Number(form.monthly_rent),
        deposit_amount: Number(form.deposit_amount),
        electricity_cost: Number(form.electricity_cost),
        water_cost: Number(form.water_cost),
        internet_cost: numberValue(form.internet_cost) ?? 0,
        service_fee: numberValue(form.service_fee) ?? 0,
        room_description: form.room_description.trim() || null,
        longitude: nullableNumberValue(form.longitude),
        latitude: nullableNumberValue(form.latitude),
        images: imageUrls,
      });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Không thể lưu phòng. Vui lòng thử lại.');
    }
  }

  const visibleErrors = submitted ? errors : {};

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-booking-border bg-white p-5 shadow-sm sm:p-6">
      {serverError ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Tiêu đề" value={form.title} onChange={(value) => setField('title', value)} error={visibleErrors.title} />
        <Field label="Loại phòng" value={form.room_type} onChange={(value) => setField('room_type', value)} error={visibleErrors.room_type} placeholder="Room, Apartment..." />
        <div className="md:col-span-2">
          <Field label="Địa chỉ chi tiết" value={form.detailed_address} onChange={(value) => setField('detailed_address', value)} error={visibleErrors.detailed_address} />
        </div>
        <Field label="Sức chứa tối đa" value={form.max_capacity} onChange={(value) => setField('max_capacity', value)} error={visibleErrors.max_capacity} type="number" />
        <Field label="Giá thuê/tháng" value={form.monthly_rent} onChange={(value) => setField('monthly_rent', value)} error={visibleErrors.monthly_rent} type="number" />
        <Field label="Tiền cọc" value={form.deposit_amount} onChange={(value) => setField('deposit_amount', value)} error={visibleErrors.deposit_amount} type="number" />
        <Field label="Tiền điện" value={form.electricity_cost} onChange={(value) => setField('electricity_cost', value)} error={visibleErrors.electricity_cost} type="number" />
        <Field label="Tiền nước" value={form.water_cost} onChange={(value) => setField('water_cost', value)} error={visibleErrors.water_cost} type="number" />
        <Field label="Internet" value={form.internet_cost} onChange={(value) => setField('internet_cost', value)} error={visibleErrors.internet_cost} type="number" />
        <Field label="Phí dịch vụ" value={form.service_fee} onChange={(value) => setField('service_fee', value)} error={visibleErrors.service_fee} type="number" />
        <Field label="Kinh độ" value={form.longitude} onChange={(value) => setField('longitude', value)} error={visibleErrors.longitude} type="number" />
        <Field label="Vĩ độ" value={form.latitude} onChange={(value) => setField('latitude', value)} error={visibleErrors.latitude} type="number" />
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold text-booking-text">Mô tả phòng</span>
        <textarea
          value={form.room_description}
          onChange={(event) => setField('room_description', event.target.value)}
          rows={5}
          className="w-full rounded-lg border border-booking-border bg-booking-surface px-3 py-3 text-sm outline-none transition focus:border-booking-primary"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold text-booking-text">URL ảnh phòng</span>
        <textarea
          value={form.images}
          onChange={(event) => setField('images', event.target.value)}
          rows={4}
          placeholder="Mỗi dòng một URL ảnh hoặc phân tách bằng dấu phẩy"
          className="w-full rounded-lg border border-booking-border bg-booking-surface px-3 py-3 text-sm outline-none transition focus:border-booking-primary"
        />
        <span className="mt-1 block text-xs text-booking-muted">Tạm thời nhập URL ảnh trực tiếp. Upload S3 sẽ làm sau.</span>
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-booking-primary px-6 py-3 font-bold text-white shadow-sm transition hover:bg-booking-primaryDark disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
