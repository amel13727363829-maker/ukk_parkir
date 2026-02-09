import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests - BUT ONLY if we have a valid stored token
apiClient.interceptors.request.use((config) => {
  // Don't add Authorization header for login/register endpoints
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
    return config;
  }

  const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // zustand persist stores the state object directly; older code expected { state: { token } }
      const tokenValue = parsed?.token ?? parsed?.state?.token ?? parsed?.state ?? parsed?.auth?.token;
      if (typeof tokenValue === 'string' && tokenValue.length > 0) {
        config.headers.Authorization = `Bearer ${tokenValue}`;
      }
    } catch (error) {
      console.error('Error parsing auth-storage from localStorage:', error);
    }
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nama_lengkap: string;
  email: string;
  no_telepon?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id_user: number;
      username: string;
      nama_lengkap: string;
      email: string;
      role: string;
      status_aktif: boolean;
    };
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  async register(data: RegisterRequest) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await apiClient.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  },
};
