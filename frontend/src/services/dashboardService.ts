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
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
  if (token) {
    try {
      const { state } = JSON.parse(token);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
    }
    return Promise.reject(error);
  }
);

// Dashboard statistics
export interface DashboardStats {
  totalVehicles: number;
  totalAreas: number;
  todayTransactions: number;
  totalRevenue: number;
  activeParking: number;
  pendingPayments: number;
}

// Recent transaction
export interface RecentTransaction {
  id_transaksi: number;
  no_polisi: string;
  nama_area: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  total_bayar: number;
  status_pembayaran: string;
}

// Dashboard service
export const dashboardService = {
  async getStatistics() {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: DashboardStats;
      }>('/dashboard/statistics');
      return response.data.data;
    } catch (error: any) {
      // If endpoint doesn't exist, we'll calculate manually
      console.log('Dashboard endpoint not available, will calculate manually');
      throw error;
    }
  },

  async getRecentTransactions(limit: number = 5) {
    try {
      const response = await apiClient.get<any>(`/transaksi?limit=${limit}`);
      const rows = response.data?.data || [];
      console.log('[dashboardService] fetched transactions:', rows.length, rows[0]);

      // Normalize shape for frontend usage
      const normalized = rows.map((r: any) => {
        return {
          ...r,
          nomor_plat: r?.Kendaraan?.no_polisi || r?.nomor_plat || r?.no_polisi || null,
          area_parkir: r?.Arf?.nama_area || r?.area_parkir || r?.area_name || null,
          waktu_masuk: r?.waktu_masuk || r?.waktuMasuk || r?.createdAt || null,
        };
      });

      return normalized;
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },

  async getTotalVehicles() {
    try {
      const response = await apiClient.get<any>('/kendaraan');
      if (response.data.pagination?.total) {
        return response.data.pagination.total;
      }
      return response.data.data?.length || 0;
    } catch (error) {
      return 0;
    }
  },

  async getTotalAreas() {
    try {
      const response = await apiClient.get<any>('/area');
      if (Array.isArray(response.data.data)) {
        return response.data.data.length;
      }
      return response.data.pagination?.total || 0;
    } catch (error) {
      return 0;
    }
  },

  async getTransactionStats() {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          belum_bayar: number;
          lunas: number;
          total: number;
          totalRevenue: number;
        };
      }>('/transaksi/stats');
      return response.data.data;
    } catch (error) {
      return { belum_bayar: 0, lunas: 0, total: 0, totalRevenue: 0 };
    }
  },
};
