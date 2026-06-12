export type ApiRoomImage = {
  sequence_number: number;
  image_url: string;
  is_cover: boolean;
};

export type ApiRoom = {
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
  status: 'AVAILABLE' | 'RENTED' | 'LOCKED';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  average_rating: number;
  created_at: string;
  updated_at: string;
  room_description: string | null;
  longitude: number | null;
  latitude: number | null;
  cover_image_url: string | null;
  images: ApiRoomImage[];
  host: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    phone_number: string | null;
  };
};

export type RoomListResponse = {
  items: ApiRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type RoomFilters = {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  roomType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export type RoomMutationPayload = {
  title?: string;
  room_type?: string;
  detailed_address?: string;
  max_capacity?: number;
  monthly_rent?: number;
  deposit_amount?: number;
  electricity_cost?: number;
  water_cost?: number;
  internet_cost?: number;
  service_fee?: number;
  room_description?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  images?: string[];
};

export type DisplayRoom = {
  id: string;
  title: string;
  location: string;
  district: string;
  price: number;
  priceLabel: string;
  image: string;
  verified: boolean;
  isNew?: boolean;
  type: string;
  area: string;
  rating: number;
  reviews: number;
  amenities: string[];
  description: string;
  raw: ApiRoom;
};
