export type BookingRoom = {
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
};

export const bookingRooms: BookingRoom[] = [
  {
    id: '1',
    title: 'Phòng trọ 30 m² có gác, ban công',
    location: 'Quận 10, TP. Hồ Chí Minh',
    district: 'Quận 10',
    price: 3800000,
    priceLabel: '3.800.000đ',
    image: '/images/booking/room-1.png',
    verified: true,
    type: 'Phòng trọ',
    area: '30 m²',
    rating: 4.9,
    reviews: 48,
    amenities: ['Gác lửng', 'Ban công', 'Máy lạnh', 'Bếp riêng'],
    description:
      'Không gian sáng, có gác lửng và ban công thoáng. Phòng phù hợp sinh viên hoặc người đi làm cần vị trí trung tâm, tiện di chuyển đến các trường đại học và tuyến xe buýt.',
  },
  {
    id: '2',
    title: 'Phòng Trọ - Ký Túc Xá - Giá Rẻ',
    location: 'Bình Thạnh, TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    price: 1600000,
    priceLabel: '1.600.000đ',
    image: '/images/booking/room-2.png',
    verified: true,
    type: 'Ở ghép',
    area: '22 m²',
    rating: 4.7,
    reviews: 32,
    amenities: ['Giường tầng', 'Wifi', 'Bảo vệ', 'Giặt sấy'],
    description:
      'Lựa chọn tiết kiệm với khu sinh hoạt chung sạch sẽ, an ninh ổn định và chi phí rõ ràng. Vị trí thuận tiện cho sinh viên khu Bình Thạnh và Quận 1.',
  },
  {
    id: '3',
    title: 'Căn hộ gần ĐH VL CS3, IUH',
    location: 'Gò Vấp, TP. Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 4500000,
    priceLabel: '4.500.000đ',
    image: '/images/booking/room-3.png',
    verified: false,
    isNew: true,
    type: 'Căn hộ',
    area: '36 m²',
    rating: 4.8,
    reviews: 21,
    amenities: ['Nội thất', 'Thang máy', 'Cửa sổ lớn', 'Chỗ để xe'],
    description:
      'Căn hộ mini đầy đủ nội thất, nhiều ánh sáng tự nhiên và khu bếp riêng. Phù hợp nhóm nhỏ hoặc người thuê dài hạn cần sự riêng tư.',
  },
  {
    id: '4',
    title: 'Phòng có nội thất gần ĐH SPKT, HUB',
    location: 'Thủ Đức, TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    price: 3200000,
    priceLabel: '3.200.000đ',
    image: '/images/booking/room-4.png',
    verified: true,
    type: 'Phòng trọ',
    area: '28 m²',
    rating: 4.9,
    reviews: 37,
    amenities: ['Nội thất', 'Máy lạnh', 'Giờ giấc tự do', 'Camera'],
    description:
      'Phòng đã có nội thất cơ bản, khu vực yên tĩnh và gần các trường đại học lớn tại Thủ Đức. Chủ nhà hỗ trợ xem phòng linh hoạt trong ngày.',
  },
];

export function findRoomById(id: string) {
  return bookingRooms.find((room) => room.id === id);
}

export function formatRoomPrice(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}
