export type UserRole = 'TENANT' | 'HOST' | 'ADMIN';

export type User = {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  avatar_url: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  username: string;
  role_id: string;
  role: UserRole;
};

export type AuthResult = {
  user: User;
  token: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  username?: string;
  password: string;
  confirmPassword: string;
  role: 'TENANT' | 'HOST';
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
};
