'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiSearch, FiPrinter, FiCheckCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';

interface Transaction {
  id_transaksi: number;
  id_kendaraan: number;
  id_arf: number;
  id_user: number;
  waktu_masuk: string;
  waktu_keluar: string | null;
  durasi_menit: number | null;
  lama_parkir: number | null;
  biaya: number | null;
  total_bayar: number | null;
  tarif_parkir: number | null;
  status_pembayaran: 'paid' | 'pending' | 'unpaid' | 'belum_bayar' | 'lunas';
  Kendaraan?: { id_kendaraan: number; no_polisi: string };
  JenisParkir?: { id_jenis_parkir: number; nama_jenis: string };
  Arf?: { id_arf: number; nama_area: string };
}

export default function TransaksiPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [transaksi, setTransaksi] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaction | null>(null);

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });

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

  const fetchTransaksi = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20, search };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await apiClient.get('/transaksi', { params });
      // Handle both 200 and 304 responses
      if (response.status === 304 || (response.status === 200 && response.data)) {
        setTransaksi(response.data?.data || []);
        setTotalPages(response.data?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching transaksi:', error);
      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransaksi();
    }
  }, [isAuthenticated, page, search, filterStatus, fetchTransaksi]);

  const handlePayment = async () => {
    if (!selectedTransaksi) return;
    try {
      await apiClient.put(`/transaksi/${selectedTransaksi.id_transaksi}/payment`, {
        status_pembayaran: 'lunas',
      });
      setShowPaymentModal(false);
      setSelectedTransaksi(null);
      fetchTransaksi();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Gagal memproses pembayaran');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'lunas':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
      case 'belum_bayar':
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Manajemen Transaksi</h1>
          <p className="text-gray-600 mt-1">Kelola data parkir dan pembayaran</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari plat nomor atau area..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Belum Bayar</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Transaksi</p>
          <p className="text-2xl font-bold text-gray-900">{transaksi.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Pembayaran Lunas</p>
          <p className="text-2xl font-bold text-green-600">
            {transaksi.filter((t) => t.status_pembayaran === 'paid' || t.status_pembayaran === 'lunas').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Belum Bayar</p>
          <p className="text-2xl font-bold text-red-600">
            {transaksi.filter((t) => t.status_pembayaran !== 'paid' && t.status_pembayaran !== 'lunas').length}
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTransaksi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Konfirmasi Pembayaran</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plat Nomor:</span>
                <span className="font-medium text-lg">{selectedTransaksi.Kendaraan?.no_polisi || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jenis Parkir:</span>
                <span className="font-medium">{selectedTransaksi.JenisParkir?.nama_jenis || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area Parkir:</span>
                <span className="font-medium">{selectedTransaksi.Arf?.nama_area || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi:</span>
                <span className="font-medium">{selectedTransaksi.durasi_menit || 0} Menit</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-semibold">Total Biaya:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedTransaksi.total_bayar || selectedTransaksi.biaya)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : transaksi.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Plat Nomor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Waktu Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Waktu Keluar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status Bayar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Biaya</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaksi.map((item) => (
                    <tr key={item.id_transaksi} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.Kendaraan?.no_polisi || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.Arf?.nama_area || '-'}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {new Date(item.waktu_masuk).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {item.waktu_keluar
                          ? new Date(item.waktu_keluar).toLocaleString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status_pembayaran
                          )}`}
                        >
                          {item.status_pembayaran === 'paid' || item.status_pembayaran === 'lunas' ? 'Lunas' : 
                           item.status_pembayaran === 'pending' ? 'Pending' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(item.total_bayar || item.biaya)}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        {(item.status_pembayaran !== 'paid' && item.status_pembayaran !== 'lunas') && (item.total_bayar || item.biaya) && (
                          <button
                            onClick={() => {
                              setSelectedTransaksi(item);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 hover:bg-green-100 rounded transition text-green-600"
                            title="Konfirmasi Pembayaran"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Sebelumnya
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isActive = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                          isActive ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Selanjutnya
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">Halaman {page} dari {totalPages}</p>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Tidak ada data transaksi
          </div>
        )}
      </div>
    </div>
  );
}
