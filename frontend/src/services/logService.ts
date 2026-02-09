import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const tokenValue = parsed?.token ?? parsed?.state?.token ?? parsed?.auth?.token ?? parsed;
      if (typeof tokenValue === 'string' && tokenValue.length > 0) {
        config.headers.Authorization = `Bearer ${tokenValue}`;
      }
    } catch (error) {
      if (typeof raw === 'string' && raw.length > 0) {
        config.headers.Authorization = `Bearer ${raw}`;
      }
    }
  }
  return config;
});

export const logService = {
  async getLogs(limit = 20) {
    try {
      const response = await apiClient.get<any>(`/logs?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return { data: [], pagination: { total: 0 } };
    }
  },
};
