'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiMenu, FiX, FiDollarSign, FiTrendingUp, FiAward, FiBarChart2 } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

// Types
interface DashboardStats {
  totalTransaksiBulanIni: number;
  totalPendapatanBulanIni: number;
  totalKendaraanMasuk: number;
  totalKendaraanKeluar: number;
}

interface RevenueChartData {
  tanggal: string;
  pendapatan: number;
}

interface PaymentMethodSummary {
  cash: number;
  qris: number;
}

interface RecentTransaction {
  id_transaksi: number;
  tanggal: string;
  plat_nomor: string;
  jenis_kendaraan: string;
  area_parkir: string;
  total_bayar: number;
  metode_pembayaran: string;
  status_pembayaran: string;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useProtectedRoute();
  const { logout } = useAuthStore();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | '7days' | '15days' | '30days' | 'custom'>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedRange, setAppliedRange] = useState<{ start?: string; end?: string } | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransaksiBulanIni: 0,
    totalPendapatanBulanIni: 0,
    totalKendaraanMasuk: 0,
    totalKendaraanKeluar: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState<PaymentMethodSummary>({
    cash: 0,
    qris: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

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

  // Helper: validate YYYY-MM-DD string exists and is a real date
  const isValidDateString = (s: string) => {
    if (!s) return false;
    const parts = s.split('-').map((p) => Number(p));
    if (parts.length !== 3) return false;
    const [y, m, d] = parts;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  };

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
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

        // Determine date range based on selected filter or applied custom range
        const now = new Date();
        let rangeStart: Date;
        let rangeEnd: Date = new Date(now);

        if (selectedDateRange === 'custom') {
          if (!appliedRange || !appliedRange.start || !appliedRange.end) {
            setError('Silakan pilih dan terapkan rentang tanggal kustom terlebih dahulu');
            setLoading(false);
            return;
          }

          // validate start/end strings
          if (!isValidDateString(appliedRange.start) || !isValidDateString(appliedRange.end)) {
            setError('Tanggal kustom tidak valid');
            setLoading(false);
            return;
          }

          const partsS = appliedRange.start.split('-').map(Number);
          const partsE = appliedRange.end.split('-').map(Number);
          rangeStart = new Date(partsS[0], partsS[1] - 1, partsS[2], 0, 0, 0, 0);
          rangeEnd = new Date(partsE[0], partsE[1] - 1, partsE[2], 23, 59, 59, 999);

          if (rangeStart.getTime() > rangeEnd.getTime()) {
            setError('Tanggal mulai tidak boleh setelah tanggal selesai');
            setLoading(false);
            return;
          }
        } else {
          rangeStart = new Date();
          switch (selectedDateRange) {
            case 'today':
              rangeStart.setHours(0, 0, 0, 0);
              break;
            case '7days':
              rangeStart.setDate(now.getDate() - 6); // include today (7 days)
              rangeStart.setHours(0, 0, 0, 0);
              break;
            case '15days':
              rangeStart.setDate(now.getDate() - 14);
              rangeStart.setHours(0, 0, 0, 0);
              break;
            case '30days':
            default:
              rangeStart.setDate(now.getDate() - 29);
              rangeStart.setHours(0, 0, 0, 0);
              break;
          }
          rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }

        // Filter transaksi berdasarkan rangeStart..rangeEnd
        const filteredTransactions = transactions.filter((t: any) => {
          const txDate = new Date(t.waktu_masuk);
          return txDate >= rangeStart && txDate <= rangeEnd;
        });

        // Calculate stats
        const totalTransaksiBulanIni = filteredTransactions.length;
        
        // Revenue should only count LUNAS (paid) transactions
        const lunasBulanIni = filteredTransactions.filter(
          (t: any) => t.status_pembayaran === 'lunas'
        );
        const totalPendapatanBulanIni = lunasBulanIni.reduce((sum: number, t: any) => {
          const bayar = Number(t.total_bayar);
          // Ensure total_bayar is a valid number, not string or null
          if (!isNaN(bayar) && bayar > 0) {
            return sum + bayar;
          }
          return sum;
        }, 0);

        const totalKendaraanMasuk = filteredTransactions.length;
        const totalKendaraanKeluar = filteredTransactions.filter(
          (t: any) => t.waktu_keluar
        ).length;

        setStats({
          totalTransaksiBulanIni,
          totalPendapatanBulanIni,
          totalKendaraanMasuk,
          totalKendaraanKeluar,
        });

        // Revenue chart data (7 hari terakhir dari selected range)
        const last7Days: RevenueChartData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const dayRevenue = transactions
            .filter((t: any) => {
              const txDate = t.waktu_masuk.startsWith(dateStr);
              const isPaid = t.status_pembayaran === 'lunas';  // Only count paid
              return txDate && isPaid;
            })
            .reduce((sum: number, t: any) => {
              const bayar = Number(t.total_bayar);
              if (!isNaN(bayar) && bayar > 0) {
                return sum + bayar;
              }
              return sum;
            }, 0);

          last7Days.push({
            tanggal: date.toLocaleDateString('id-ID', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            pendapatan: dayRevenue,
          });
        }
        setRevenueData(last7Days);

        // Payment method summary
        const cashTotal = filteredTransactions
          .filter((t: any) => t.metode_pembayaran === 'tunai' && t.status_pembayaran === 'lunas')
          .reduce((sum: number, t: any) => {
            const bayar = Number(t.total_bayar);
            if (!isNaN(bayar) && bayar > 0) return sum + bayar;
            return sum;
          }, 0);

        const qrisTotal = filteredTransactions
          .filter((t: any) => t.metode_pembayaran === 'qris' && t.status_pembayaran === 'lunas')
          .reduce((sum: number, t: any) => {
            const bayar = Number(t.total_bayar);
            if (!isNaN(bayar) && bayar > 0) return sum + bayar;
            return sum;
          }, 0);

        setPaymentMethodSummary({
          cash: cashTotal,
          qris: qrisTotal,
        });

        // Recent transactions
        const recent = filteredTransactions
          .sort((a: any, b: any) => new Date(b.waktu_masuk).getTime() - new Date(a.waktu_masuk).getTime())
          .slice(0, 20)
          .map((t: any) => ({
            id_transaksi: t.id_transaksi,
            tanggal: new Date(t.waktu_masuk).toLocaleString('id-ID'),
            plat_nomor: t.Kendaraan?.no_polisi || '-',
            jenis_kendaraan: t.JenisParkir?.nama_jenis || '-',
            area_parkir: t.Arf?.nama_area || '-',
            total_bayar: t.total_bayar || 0,
            metode_pembayaran: t.metode_pembayaran === 'tunai' ? 'Tunai' : 'QRIS',
            status_pembayaran: t.status_pembayaran,
          }));

        setRecentTransactions(recent);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange, appliedRange]);

  // Effects
  useEffect(() => {
    // If logged-in user is not an owner, redirect to their dashboard
    if (user && user.role !== 'owner') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 300000); // Refresh setiap 5 menit
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Load persisted custom range on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('owner-applied-range');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.start && parsed.end) {
            setStartDate(parsed.start);
            setEndDate(parsed.end);
            setAppliedRange({ start: parsed.start, end: parsed.end });
            setSelectedDateRange('custom');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load persisted owner-applied-range', e);
    }
  }, []);
  // Show date error near filter area (run unconditionally before any early returns)
  useEffect(() => {
    if (dateError) {
      setError(dateError);
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [dateError]);

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
          <div className="px-4 py-3 rounded-lg bg-purple-700 text-white font-semibold">
            📊 Dashboard
          </div>
          <a href="/dashboard/owner/grafik-pendapatan" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-purple-100 hover:text-white">
            <span className="text-xl">📈</span>
            <span>Grafik Pendapatan</span>
          </a>
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
              <h2 className="text-xl font-semibold text-gray-800">Owner Dashboard</h2>
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

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter Periode</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => setSelectedDateRange('today')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDateRange === 'today'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Hari Ini
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('7days')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDateRange === '7days'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📆 7 Hari
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('15days')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDateRange === '15days'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📊 15 Hari
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('30days')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDateRange === '30days'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📈 30 Hari
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('custom')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDateRange === 'custom'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔎 Kustom
                  </button>
                  {/* Date inputs for custom range */}
                  {selectedDateRange === 'custom' && (
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-500">—</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => {
                          // validate
                          setDateError(null);
                          setError(null);
                          if (!startDate || !endDate) {
                            setDateError('Pilih tanggal mulai dan selesai');
                            return;
                          }
                          // validate real calendar dates (reject invalid like 2026-02-31)
                          const partsS = startDate.split('-').map(Number);
                          const partsE = endDate.split('-').map(Number);
                          const ds = new Date(partsS[0], partsS[1] - 1, partsS[2]);
                          const de = new Date(partsE[0], partsE[1] - 1, partsE[2]);
                          if (
                            !(ds.getFullYear() === partsS[0] && ds.getMonth() === partsS[1] - 1 && ds.getDate() === partsS[2]) ||
                            !(de.getFullYear() === partsE[0] && de.getMonth() === partsE[1] - 1 && de.getDate() === partsE[2])
                          ) {
                            setDateError('Tanggal tidak valid');
                            return;
                          }
                          if (ds.getTime() > de.getTime()) {
                            setDateError('Tanggal mulai tidak boleh setelah tanggal selesai');
                            return;
                          }
                          const applied = { start: startDate, end: endDate };
                          setAppliedRange(applied);
                          setSelectedDateRange('custom');
                          try {
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('owner-applied-range', JSON.stringify(applied));
                            }
                          } catch (e) {
                            console.error('Failed to persist applied range', e);
                          }
                          try {
                            if (typeof window !== 'undefined') {
                              // notify other components in the same SPA that owner applied a new range
                              window.dispatchEvent(new CustomEvent('owner-applied-range-changed', { detail: applied }));
                            }
                          } catch (e) {
                            console.error('Failed to dispatch owner-applied-range-changed event', e);
                          }
                          // trigger immediate fetch by calling fetchDashboardData via effect (appliedRange in deps)
                        }}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg ml-2"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          // Clear custom range
                          setDateError(null);
                          setError(null);
                          setAppliedRange(null);
                          setStartDate('');
                          setEndDate('');
                          setSelectedDateRange('30days');
                          try {
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('owner-applied-range');
                              window.dispatchEvent(new CustomEvent('owner-applied-range-cleared'));
                            }
                          } catch (e) {
                            console.error('Failed to clear owner-applied-range', e);
                          }
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg ml-2"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Transaksi */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Transaksi {selectedDateRange === 'today' ? 'Hari Ini' : selectedDateRange === '7days' ? '7 Hari' : selectedDateRange === '15days' ? '15 Hari' : '30 Hari'}
                    </p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                      {stats.totalTransaksiBulanIni}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Transaksi</p>
                  </div>
                  <FiBarChart2 className="text-blue-600" size={40} />
                </div>
              </div>

              {/* Total Pendapatan */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Pendapatan {selectedDateRange === 'today' ? 'Hari Ini' : selectedDateRange === '7days' ? '7 Hari' : selectedDateRange === '15days' ? '15 Hari' : '30 Hari'}
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      Rp {Math.round(stats.totalPendapatanBulanIni).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Pendapatan</p>
                  </div>
                  <FiDollarSign className="text-green-600" size={40} />
                </div>
              </div>

              {/* Total Kendaraan Masuk */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Kendaraan Masuk {selectedDateRange === 'today' ? 'Hari Ini' : selectedDateRange === '7days' ? '7 Hari' : selectedDateRange === '15days' ? '15 Hari' : '30 Hari'}
                    </p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                      {stats.totalKendaraanMasuk}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Kendaraan</p>
                  </div>
                  <span className="text-4xl">🚗</span>
                </div>
              </div>

              {/* Total Kendaraan Keluar */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Kendaraan Keluar {selectedDateRange === 'today' ? 'Hari Ini' : selectedDateRange === '7days' ? '7 Hari' : selectedDateRange === '15days' ? '15 Hari' : '30 Hari'}
                    </p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                      {stats.totalKendaraanKeluar}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Kendaraan</p>
                  </div>
                  <FiTrendingUp className="text-orange-600" size={40} />
                </div>
              </div>
            </div>

            {/* Payment Methods & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Method Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Ringkasan Metode Pembayaran</h3>
                <div className="space-y-4">
                  {/* Cash */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-semibold">💵 Cash</span>
                      <span className="text-gray-900 font-bold">
                        Rp {Math.round(paymentMethodSummary.cash).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${
                            paymentMethodSummary.cash + paymentMethodSummary.qris > 0
                              ? (paymentMethodSummary.cash /
                                  (paymentMethodSummary.cash + paymentMethodSummary.qris)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* QRIS */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-semibold">📱 QRIS</span>
                      <span className="text-gray-900 font-bold">
                        Rp {Math.round(paymentMethodSummary.qris).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            paymentMethodSummary.cash + paymentMethodSummary.qris > 0
                              ? (paymentMethodSummary.qris /
                                  (paymentMethodSummary.cash + paymentMethodSummary.qris)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">💰 Total</span>
                      <span className="text-green-700 font-bold text-lg">
                        Rp {(paymentMethodSummary.cash + paymentMethodSummary.qris).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Transaksi Terbaru ({selectedDateRange === 'today' ? 'Hari Ini' : selectedDateRange === '7days' ? '7 Hari' : selectedDateRange === '15days' ? '15 Hari' : '30 Hari'})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Plat Nomor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Area</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total Bayar</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx) => (
                          <tr key={tx.id_transaksi} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm text-gray-700">{tx.tanggal}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.plat_nomor}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{tx.jenis_kendaraan}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{tx.area_parkir}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                              Rp {tx.total_bayar.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {tx.status_pembayaran === 'lunas' ? (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    tx.metode_pembayaran === 'Tunai'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {tx.metode_pembayaran}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data transaksi pada periode ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Dashboard Read-Only</h3>
                  <p className="text-blue-700 text-sm">
                    Sebagai owner, Anda hanya dapat melihat data dan laporan. Untuk melakukan perubahan, silakan hubungi administrator sistem.
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
