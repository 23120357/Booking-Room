export interface RoomTypeOption {
  value: string;
  label: string;
}

export interface CityOption {
  value: string;
  label: string;
}

export interface AmenityOption {
  key: string;
  label: string;
}

export interface UploadedRoomImage {
  id: string;
  label: string;
  src?: string;
  alt?: string;
}

export const getRoomTypeOptions = (t: any): RoomTypeOption[] => [
  { value: 'single-room', label: t('host.createRoom.typeSingle') },
  { value: 'studio', label: t('host.createRoom.typeStudio') },
  { value: 'one-bedroom', label: t('host.createRoom.typeOneBed') },
  { value: 'shared-room', label: t('host.createRoom.typeShared') },
];

export const cityOptions: CityOption[] = [
  { value: 'ho-chi-minh', label: 'Hồ Chí Minh' },
  { value: 'ha-noi', label: 'Hà Nội' },
  { value: 'da-nang', label: 'Đà Nẵng' },
  { value: 'can-tho', label: 'Cần Thơ' },
];

export const getAmenityOptions = (t: any): AmenityOption[] => [
  { key: 'air-conditioner', label: t('host.createRoom.amenityAirCon') },
  { key: 'fridge', label: t('host.createRoom.amenityFridge') },
  { key: 'washing-machine', label: t('host.createRoom.amenityWashing') },
  { key: 'parking', label: t('host.createRoom.amenityParking') },
  { key: 'elevator', label: t('host.createRoom.amenityElevator') },
  { key: 'free-hours', label: t('host.createRoom.amenityFreeHours') },
  { key: 'pets', label: t('host.createRoom.amenityPets') },
  { key: 'other', label: t('host.createRoom.amenityOther') },
];

export const uploadedRoomImages: UploadedRoomImage[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    src: '/images/booking/host/one-bedroom-apartment.png',
    alt: 'Không gian phòng ngủ sáng với cửa sổ lớn',
  },
  {
    id: 'kitchen',
    label: 'KITCHEN',
    src: '/images/booking/host/studio-apartment.png',
    alt: 'Không gian bếp và phòng khách căn hộ studio',
  },
  {
    id: 'bathroom',
    label: 'BATHROOM',
  },
  {
    id: 'add-more',
    label: 'ADD MORE',
  },
];

export const MIN_REQUIRED_IMAGES = 3;
export const MAX_ROOM_IMAGES = 5;
