'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

// Helpers
const formatISOLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Types
interface RevenueChartData {
  tanggal: string;
  pendapatan: number;
}

export default function GrafikPendapatanPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useProtectedRoute();
  const { logout } = useAuthStore();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [selectedRange, setSelectedRange] = useState<'7' | '30' | '90' | 'custom'>('7');

  // API Client
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });

  // Add JWT token to all requests
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

  // Fetch Revenue Data
  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/transaksi', {
        params: { limit: 1000 },
      });

      if (response.data.success && response.data.data) {
        const transactions = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const now = new Date();

        // Check for owner's custom applied range in localStorage only when user selected 'custom'
        let rangeStart: Date | null = null;
        let rangeEnd: Date | null = null;
        try {
          if (selectedRange === 'custom' && typeof window !== 'undefined') {
            const raw = localStorage.getItem('owner-applied-range');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.start && parsed.end) {
                const ps = parsed.start.split('-').map(Number);
                const pe = parsed.end.split('-').map(Number);
                const ds = new Date(ps[0], ps[1] - 1, ps[2], 0, 0, 0, 0);
                const de = new Date(pe[0], pe[1] - 1, pe[2], 23, 59, 59, 999);
                if (
                  ds.getFullYear() === ps[0] && ds.getMonth() === ps[1] - 1 && ds.getDate() === ps[2] &&
                  de.getFullYear() === pe[0] && de.getMonth() === pe[1] - 1 && de.getDate() === pe[2]
                ) {
                  rangeStart = ds;
                  rangeEnd = de;
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse owner-applied-range', e);
        }

        if (!rangeStart || !rangeEnd) {
          const daysBack = parseInt(selectedRange);
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - daysBack + 1);
          rangeStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
          rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }

        // Debug: log resolved range
        try {
          // eslint-disable-next-line no-console
          console.debug('GrafikPendapatan: using range', rangeStart?.toISOString(), rangeEnd?.toISOString());
        } catch (e) {}

        // Group transactions by ISO date (YYYY-MM-DD) to ensure stable sorting
        const revenueMap: Record<string, number> = {};

        transactions.forEach((t: any) => {
          if (t.status_pembayaran === 'lunas' && t.waktu_masuk) {
            const date = new Date(t.waktu_masuk);
            if (date >= rangeStart! && date <= rangeEnd!) {
              const iso = formatISOLocal(date); // local YYYY-MM-DD
              const amount = Number(t.total_bayar) || 0;
              revenueMap[iso] = (revenueMap[iso] || 0) + amount;
            }
          }
        });

        // Build chart data for every day in the range so missing days show 0
        const chartData: RevenueChartData[] = [];
        for (let cur = new Date(rangeStart!); cur <= rangeEnd!; cur.setDate(cur.getDate() + 1)) {
          const curDate = new Date(cur);
          const iso = formatISOLocal(curDate);
          const label = curDate.toLocaleDateString('id-ID', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          });
          chartData.push({ tanggal: label, pendapatan: revenueMap[iso] || 0 });
        }

        setRevenueData(chartData);
      }
    } catch (err: any) {
      console.error('Error fetching revenue data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data grafik pendapatan');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  // Listen for owner-applied-range-changed event so the chart updates immediately
  useEffect(() => {
    const handler = (_ev: Event) => {
      // eslint-disable-next-line no-console
      console.debug('GrafikPendapatan: owner-applied-range-changed event received');
      // switch to custom view so persisted range will be used
      setSelectedRange('custom');
      fetchRevenueData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('owner-applied-range-changed', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('owner-applied-range-changed', handler as EventListener);
      }
    };
  }, [fetchRevenueData]);

  // Also listen for explicit clear event
  useEffect(() => {
    const clearHandler = (_ev: Event) => {
      // eslint-disable-next-line no-console
      console.debug('GrafikPendapatan: owner-applied-range-cleared event received');
      // If currently viewing custom, switch to default '7' to avoid stale persisted range
      if (selectedRange === 'custom') {
        setSelectedRange('7');
      }
      fetchRevenueData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('owner-applied-range-cleared', clearHandler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('owner-applied-range-cleared', clearHandler as EventListener);
      }
    };
  }, [fetchRevenueData, selectedRange]);

  // Effects
  useEffect(() => {
    if (user && user.role !== 'owner') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRevenueData();
    }
  }, [isAuthenticated, fetchRevenueData]);

  // Handlers
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Loading state
  if (!isAuthenticated || user?.role !== 'owner') {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  // Max revenue for chart scaling
  const maxRevenue = Math.max(...revenueData.map(d => d.pendapatan), 1);
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.pendapatan, 0);
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`$\{
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-purple-900 to-purple-800 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-screen z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-purple-700 flex-shrink-0">
          <h1 className="text-2xl font-bold">Parkir Plus</h1>
          <p className="text-purple-200 text-sm">Owner Dashboard</p>
        </div>

        <nav className="mt-6 space-y-2 px-4 overflow-y-auto flex-1 min-h-0">
          <a href="/dashboard/owner" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-purple-100 hover:text-white">
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </a>
          <div className="px-4 py-3 rounded-lg bg-purple-700 text-white font-semibold flex items-center gap-3">
            <span className="text-xl">📈</span>
            <span>Grafik Pendapatan</span>
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4 text-purple-200 text-xs">
          <p>Anda login sebagai:</p>
          <p className="font-semibold text-white">{user?.nama_lengkap}</p>
          <p className="text-purple-300">Role: OWNER (Read-Only)</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Grafik Pendapatan</h2>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-8">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Range Selector */}
            <div className="flex gap-4">
              {(['7', '30', '90'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    selectedRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {range} Hari Terakhir
                </button>
              ))}
                <button
                  onClick={() => setSelectedRange('custom')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    selectedRange === 'custom'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Kustom
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  Rp {Math.round(totalRevenue).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <p className="text-gray-500 text-sm font-medium">Rata-rata Harian</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  Rp {Math.round(averageRevenue).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <p className="text-gray-500 text-sm font-medium">Jumlah Hari</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {revenueData.length}
                </p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-8">Grafik Pendapatan</h3>
              {revenueData.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="flex items-end h-96 gap-4 px-4" style={{ minWidth: `${Math.max(revenueData.length * 56, 600)}px` }}>
                  {revenueData.map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group" style={{ width: 48, flex: '0 0 auto' }}>
                      <div className="flex flex-col items-center justify-end h-full w-full">
                        <div 
                          className="bg-gradient-to-t from-purple-600 to-purple-400 w-10 rounded-t transition-all duration-300 hover:from-purple-700 hover:to-purple-500 cursor-pointer"
                          style={{
                            height: maxRevenue > 0 ? `${(data.pendapatan / maxRevenue) * 100}%` : '0%',
                            minHeight: data.pendapatan > 0 ? '24px' : '6px',
                            width: '40px',
                          }}
                          title={`Rp ${data.pendapatan.toLocaleString('id-ID')}`}
                        />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-purple-600 mt-3 bg-purple-50 px-3 py-1 rounded-lg">
                          Rp {(data.pendapatan / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium text-center">{data.tanggal}</span>
                    </div>
                  ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Tidak ada data pendapatan untuk periode ini</p>
                </div>
              )}
            </div>

            {/* Data Table */}
            {revenueData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Detail Pendapatan Harian</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Pendapatan</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {revenueData.map((data, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.tanggal}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                            Rp {data.pendapatan.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(data.pendapatan / totalRevenue) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-700 w-12">
                                {((data.pendapatan / totalRevenue) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Informasi Grafik</h3>
                  <p className="text-blue-700 text-sm">
                    Grafik menampilkan total pendapatan per hari untuk transaksi yang berstatus "lunas". 
                    Anda dapat memilih rentang waktu 7, 30, atau 90 hari terakhir untuk melihat tren pendapatan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
