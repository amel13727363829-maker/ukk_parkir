'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { logService } from '@/services/logService';

export default function LogAktivitasPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState({ total: 0, activeUsers: 0, modifiedTables: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const logsRes = await logService.getLogs(100);
      const logRows = logsRes.data || [];
      const totalLogs = logsRes.pagination?.total || logRows.length;

      const userIds = new Set(logRows.map((l: any) => l.id_user).filter(Boolean));
      const activeUsers = userIds.size;
      const modifiedTables = logRows.filter((l: any) => /DELETE|POST|PUT|PATCH/i.test(l.deskripsi_aksi)).length;

      setLogs(logRows);
      setLogStats({ total: totalLogs, activeUsers, modifiedTables });
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
    { label: 'Kendaraan', href: '/dashboard/kendaraan', icon: '🚗' },
    { label: 'Transaksi', href: '/dashboard/transaksi', icon: '💳' },
    { label: 'Jenis Parkir', href: '/dashboard/jenis-parkir', icon: '📍' },
    { label: 'User Manajemen', href: '/dashboard/users', icon: '👥' },
    { label: 'Log Aktivitas', href: '/dashboard/log-aktivitas', icon: '📋' },
  ];

  // Filter logs berdasarkan search term
  const filteredLogs = logs.filter(
    (log) =>
      log.User?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deskripsi_aksi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Top users
  const topUsers = (() => {
    const counts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const name = l.User?.nama_lengkap || l.User?.username || `User ${l.id_user || '-'}`;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  if (!isAuthenticated || user?.role !== 'admin' || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`$\{
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-screen z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-blue-700 flex-shrink-0">
          <h1 className="text-2xl font-bold">Parkir Plus</h1>
          <p className="text-blue-200 text-sm">Admin Panel</p>
        </div>

        <nav className="mt-6 space-y-2 px-4 overflow-y-auto flex-1 min-h-0">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.href === '/dashboard/log-aktivitas'
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

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
              <h2 className="text-xl font-semibold text-gray-800">Log Aktivitas Sistem</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user?.nama_lengkap}</p>
                <p className="text-xs text-blue-600 font-semibold uppercase">{user?.role}</p>
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
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <p className="text-gray-500 text-sm">Total Log</p>
                <p className="text-3xl font-bold text-gray-800">{logStats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <p className="text-gray-500 text-sm">Pengguna Aktif</p>
                <p className="text-3xl font-bold text-gray-800">{logStats.activeUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <p className="text-gray-500 text-sm">Tabel Termodifikasi</p>
                <p className="text-3xl font-bold text-gray-800">{logStats.modifiedTables}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
                <p className="text-gray-500 text-sm">Halaman</p>
                <p className="text-3xl font-bold text-gray-800">
                  {currentPage} / {totalPages || 1}
                </p>
              </div>
            </div>

            {/* Top Users */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {topUsers.map((tu, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-500 mb-2">TOP USER #{idx + 1}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{tu[0]}</p>
                      <p className="text-xs text-gray-500">@{tu[0].toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{tu[1]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari aktivitas, nama, atau username..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={fetchLogs}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Pengguna</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Aktivitas</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Tabel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((l: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{startIndex + idx + 1}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(l.waktu_aksi).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">
                              {l.User?.nama_lengkap || l.User?.username || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{(l.User?.username || 'user').toLowerCase()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{l.deskripsi_aksi}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              {l.nama_tabel || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada log'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => {
                        const p = i + 1;
                        const active = p === currentPage;
                        return (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                              active ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Selanjutnya
                    </button>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">Halaman {currentPage} dari {totalPages}</p>
                </div>
              )}
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
