'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiMenu, FiX, FiTrendingUp, FiUsers, FiBarChart2, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboardService } from '@/services/dashboardService';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useProtectedRoute();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalAreas: 0,
    totalUsers: 0,
    todayTransactions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeParking: 0,
    systemHealth: 100,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect jika bukan admin
    if (user && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [vehicles, areas, transactions] = await Promise.all([
        dashboardService.getTotalVehicles(),
        dashboardService.getTotalAreas(),
        dashboardService.getRecentTransactions(10),
      ]);

      setStats({
        totalVehicles: vehicles,
        totalAreas: areas,
        totalUsers: 0, // Akan diupdate dari API user
        todayTransactions: transactions?.length || 0,
        totalRevenue:
          transactions
            ?.filter((t: any) => t.status_pembayaran === 'lunas')
            .reduce((sum: number, t: any) => {
              const bayar = Number(t.total_bayar);
              if (typeof bayar === 'number' && !isNaN(bayar) && bayar > 0) return sum + bayar;
              return sum;
            }, 0) || 0,
        pendingPayments: transactions?.filter((t: any) => t.status_pembayaran === 'belum_bayar').length || 0,
        activeParking: transactions?.filter((t: any) => !t.waktu_keluar).length || 0,
        systemHealth: 99,
      });

      setTransactions(transactions || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Quick edit areas (capacity & tarif)
  const [showAreaEditor, setShowAreaEditor] = useState(false);
  const [areasList, setAreasList] = useState<any[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);

  const apiClient = (() => {
    const instance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1' });
    instance.interceptors.request.use((config) => {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const tokenValue = parsed?.token ?? parsed?.state?.token ?? parsed?.state ?? parsed?.auth?.token;
          if (typeof tokenValue === 'string' && tokenValue.length > 0) {
            config.headers = { ...(config.headers || {}), Authorization: `Bearer ${tokenValue}` };
          }
        } catch (e) {
          // ignore
        }
      }
      return config;
    });
    return instance;
  })();

  const fetchAreasForEditor = async () => {
    try {
      setAreasLoading(true);
      const res = await apiClient.get('/arf', { params: { limit: 100 } });
      const rows = res.data?.data || [];
      setAreasList(rows);
    } catch (e) {
      console.error('Failed to load areas for editor', e);
      alert('Gagal memuat data area');
    } finally {
      setAreasLoading(false);
    }
  };

  const saveAreaChanges = async (id: number, changes: { kapasitas?: number; harga_per_jam?: number }) => {
    try {
      await apiClient.put(`/arf/${id}`, changes);
      // refresh list
      await fetchAreasForEditor();
    } catch (e) {
      console.error('Failed to save area changes', e);
      alert('Gagal menyimpan perubahan');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
    { label: 'Kendaraan', href: '/dashboard/kendaraan', icon: '🚗' },
    { label: 'Transaksi', href: '/dashboard/transaksi', icon: '💳' },
    { label: 'Jenis Parkir', href: '/dashboard/jenis-parkir', icon: '📍' },
    { label: 'User Manajemen', href: '/dashboard/users', icon: '👥' },
    { label: 'Log Aktivitas', href: '/dashboard/log-aktivitas', icon: '📋' },
  ];

  if (!isAuthenticated || user?.role !== 'admin' || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`$\{
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-pink-900 to-pink-800 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-screen z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-pink-700 flex-shrink-0">
          <h1 className="text-2xl font-bold">Parkir Plus</h1>
          <p className="text-pink-200 text-sm">Admin Panel</p>
        </div>

        <nav className="mt-6 space-y-2 px-4 overflow-y-auto flex-1 min-h-0">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors text-pink-100 hover:text-white"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      {/* Area Editor Modal */}
      {showAreaEditor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-12 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-auto max-h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Kapasitas & Tarif Area Parkir</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAreaEditor(false)}
                  className="px-3 py-1 rounded border"
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="p-4">
              {areasLoading ? (
                <div className="p-6 text-center">Memuat...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Nama Area</th>
                        <th className="px-4 py-2 text-left">Lokasi</th>
                        <th className="px-4 py-2 text-left">Kapasitas</th>
                        <th className="px-4 py-2 text-left">Harga/Jam (Rp)</th>
                        <th className="px-4 py-2 text-left">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areasList.map((a) => (
                        <tr key={a.id_arf} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{a.nama_arf}</td>
                          <td className="px-4 py-2">{a.lokasi}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              defaultValue={a.kapasitas}
                              id={`kap-${a.id_arf}`}
                              className="w-28 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              defaultValue={a.harga_per_jam}
                              id={`harga-${a.id_arf}`}
                              className="w-36 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={async () => {
                                const kap = Number((document.getElementById(`kap-${a.id_arf}`) as HTMLInputElement).value);
                                const harga = Number((document.getElementById(`harga-${a.id_arf}`) as HTMLInputElement).value);
                                await saveAreaChanges(a.id_arf, { kapasitas: kap, harga_per_jam: harga });
                                alert('Perubahan tersimpan');
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Simpan
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
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
              <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                <p className="text-sm text-gray-600">{user?.nama_lengkap}</p>
                <p className="text-xs text-pink-600 font-semibold uppercase">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <FiAlertCircle className="text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Kendaraan</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalVehicles}</p>
                  </div>
                  <FiTrendingUp className="text-pink-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Area Parkir</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalAreas}</p>
                  </div>
                  <span className="text-2xl">🅿️</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Parkir Aktif</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeParking}</p>
                  </div>
                  <span className="text-2xl">🚗</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pembayaran Pending</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.pendingPayments}</p>
                  </div>
                  <FiAlertCircle className="text-yellow-600" size={32} />
                </div>
              </div>
            </div>

            {/* Revenue & System Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue Hari Ini</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {stats.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <FiDollarSign className="text-green-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Transaksi Hari Ini</p>
                    <p className="text-2xl font-bold text-pink-600">{stats.todayTransactions}</p>
                  </div>
                  <FiBarChart2 className="text-pink-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Kesehatan Sistem</p>
                    <p className="text-2xl font-bold text-green-600">{stats.systemHealth}%</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h3>
                <Link href="/dashboard/transaksi" className="text-pink-600 hover:text-pink-800 text-sm font-semibold">
                  Lihat Semua →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Plat Nomor</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Area</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Masuk</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status Bayar</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((t, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{t.nomor_plat || t.Kendaraan?.no_polisi || t.no_polisi || '-'}</td>
                          <td className="px-4 py-3 text-gray-700">{t.Arf?.nama_area || t.area_parkir || t.area_name || t.Arf?.nama_area || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{t.waktu_masuk ? new Date(t.waktu_masuk).toLocaleTimeString('id-ID') : (t.createdAt ? new Date(t.createdAt).toLocaleTimeString('id-ID') : '-')}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  ['lunas','sudah_bayar','paid'].includes(t.status_pembayaran)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {t.status_pembayaran}
                              </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            Rp {(Number(t.total_bayar) || Number(t.tarif_parkir) || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada transaksi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                <div>
                  <button
                    onClick={async () => {
                      setShowAreaEditor(true);
                      await fetchAreasForEditor();
                    }}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                  >
                    Edit Kapasitas & Tarif
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">Edit kapasitas slot dan tarif per jam untuk setiap area parkir.</p>
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
