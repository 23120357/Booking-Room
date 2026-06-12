import { apiRequest, clearStoredToken, setStoredToken } from '@/services/apiClient';
import type { AuthResult, LoginPayload, RegisterPayload, User } from '@/types/user';

export async function login(payload: LoginPayload) {
  const result = await apiRequest<AuthResult>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  setStoredToken(result.token);
  return result;
}

export async function register(payload: RegisterPayload) {
  const result = await apiRequest<AuthResult>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  setStoredToken(result.token);
  return result;
}

export async function getCurrentUser() {
  const result = await apiRequest<{ user: User }>('/auth/me');
  return result.user;
}

export async function logout() {
  try {
    await apiRequest<null>('/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}
