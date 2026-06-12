import { apiRequest } from '@/services/apiClient';
import type { ApiRoom, DisplayRoom, RoomFilters, RoomListResponse, RoomMutationPayload } from '@/types/room';

function toQuery(filters: RoomFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getRooms(filters: RoomFilters = {}) {
  return apiRequest<RoomListResponse>(`/rooms${toQuery(filters)}`, { auth: false });
}

export async function getRoomById(id: string) {
  const result = await apiRequest<{ room: ApiRoom }>(`/rooms/${id}`, { auth: true });
  return result.room;
}

export async function getMyRooms() {
  const result = await apiRequest<{ rooms: ApiRoom[] }>('/rooms/my');
  return result.rooms;
}

export async function createRoom(payload: RoomMutationPayload) {
  const result = await apiRequest<{ room: ApiRoom }>('/rooms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.room;
}

export async function updateRoom(id: string, payload: RoomMutationPayload) {
  const result = await apiRequest<{ room: ApiRoom }>(`/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return result.room;
}

export async function deleteRoom(id: string) {
  await apiRequest<null>(`/rooms/${id}`, { method: 'DELETE' });
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export function toDisplayRoom(room: ApiRoom): DisplayRoom {
  const coverImage = room.cover_image_url || room.images.find((image) => image.is_cover)?.image_url || room.images[0]?.image_url || '';

  return {
    id: room.room_id,
    title: room.title,
    location: room.detailed_address,
    district: room.detailed_address.split(',').slice(-2, -1)[0]?.trim() || room.detailed_address,
    price: room.monthly_rent,
    priceLabel: formatPrice(room.monthly_rent),
    image: coverImage,
    verified: room.approval_status === 'APPROVED',
    type: room.room_type,
    area: `${room.max_capacity} người`,
    rating: room.average_rating || 0,
    reviews: 0,
    amenities: [],
    description: room.room_description || 'Chủ nhà chưa cập nhật mô tả chi tiết cho phòng này.',
    raw: room,
  };
}
