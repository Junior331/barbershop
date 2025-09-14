import { api } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SocialAuthData {
  name: string;
  email: string;
  provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE';
  providerId: string;
  avatarUrl?: string;
  accessToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    provider: string;
  };
}

export const authService = {
  // Login com email/senha
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Registro com email/senha
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login/Registro social
  async socialAuth(data: SocialAuthData): Promise<AuthResponse> {
    const response = await api.post('/auth/social', data);
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Dados do usuário atual
  async me(): Promise<{ user: any }> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};