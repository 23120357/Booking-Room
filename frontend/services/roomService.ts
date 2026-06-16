'use client';

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { BookingRoom } from '@/data/bookingRooms';

export interface BackendRoom {
  room_id: string;
  landlord_id: string;
  title: string;
  room_type: string;
  detailed_address: string;
  max_capacity: number;
  monthly_rent: number;
  deposit_amount: number;
  electricity_cost: number;
  water_cost: number;
  internet_cost: number;
  service_fee: number;
  status: string;
  approval_status: string;
  average_rating: number;
  created_at: string;
  updated_at: string;
  room_description: string;
  cover_image_url: string | null;
  images: Array<{ image_url: string; sequence_number: number; is_cover: boolean }>;
  host: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    phone_number: string | null;
  };
}

export interface ListRoomsResponse {
  items: BackendRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export function mapBackendRoomToBookingRoom(room: BackendRoom): BookingRoom {
  const district = room.detailed_address?.match(/(Quận \d+|Bình Thạnh|Gò Vấp|Thủ Đức|Tân Bình|Phú Nhuận|Quận [1-9]|Quận 1[0-2]|Tân Phú|Bình Tân)/i)?.[0] || 'Khác';
  const price = Number(room.monthly_rent);
  return {
    id: room.room_id,
    title: room.title,
    location: room.detailed_address,
    district,
    price,
    priceLabel: new Intl.NumberFormat('vi-VN').format(price) + 'đ',
    image: room.cover_image_url || '/images/booking/room-1.png',
    verified: room.approval_status === 'APPROVED',
    isNew: new Date().getTime() - new Date(room.created_at).getTime() < 7 * 24 * 60 * 60 * 1000,
    type: room.room_type || 'Phòng trọ',
    area: `${(room.max_capacity || 2) * 8 + 4} m²`,
    rating: room.average_rating || 0,
    reviews: 0,
    amenities: ['Wifi', 'Điều hòa', 'Bếp riêng', 'Chỗ để xe'],
    description: room.room_description || '',
  };
}

export const roomService = {
  listRooms: async (params: {
    page?: number;
    limit?: number;
    sort?: string;
    keyword?: string;
  }): Promise<ApiResponse<ListRoomsResponse>> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.sort) query.append('sort', String(params.sort));
    if (params.keyword) query.append('keyword', params.keyword);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<ApiResponse<ListRoomsResponse>>(`/rooms${queryString}`);
  },

  getRoomById: async (id: string): Promise<ApiResponse<{ room: BackendRoom }>> => {
    return apiClient.get<ApiResponse<{ room: BackendRoom }>>(`/rooms/${id}`);
  },
};
