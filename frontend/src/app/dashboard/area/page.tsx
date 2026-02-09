'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import axios from 'axios';

interface Arf {
  id_arf: number;
  nama_arf: string;
  lokasi: string;
  kapasitas: number;
  harga_per_jam: number;
  status: string;
}

export default function ArfPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [arf, setArf] = useState<Arf[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_arf: '',
    lokasi: '',
    kapasitas: 50,
    harga_per_jam: 5000,
    status: 'aktif',
  });

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

  const fetchArf = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/arf', {
        params: { page, limit: 10, search },
      });
      setArf(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching arf:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchArf();
    }
  }, [isAuthenticated, page, search, fetchArf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/arf/${editId}`, formData);
      } else {
        await apiClient.post('/arf', formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        nama_arf: '',
        lokasi: '',
        kapasitas: 50,
        harga_per_jam: 5000,
        status: 'aktif',
      });
      fetchArf();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data area parkir');
    }
  };

  const handleEdit = (item: Arf) => {
    setFormData({
      nama_arf: item.nama_arf,
      lokasi: item.lokasi,
      kapasitas: item.kapasitas,
      harga_per_jam: item.harga_per_jam,
      status: item.status,
    });
    setEditId(item.id_arf);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus?')) {
      try {
        await apiClient.delete(`/arf/${id}`);
        fetchArf();
      } catch (error) {
        console.error('Error deleting arf:', error);
        alert('Gagal menghapus data area parkir');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🅿️ Manajemen Area Parkir</h1>
          <p className="text-gray-600 mt-1">Kelola area dan zona parkir</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({
              nama_arf: '',
              lokasi: '',
              kapasitas: 50,
              harga_per_jam: 5000,
              status: 'aktif',
            });
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus /> Tambah Area
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau lokasi area..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Area Parkir' : 'Tambah Area Parkir Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Nama Area"
                required
                value={formData.nama_arf}
                onChange={(e) => setFormData({ ...formData, nama_arf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Kapasitas"
                required
                value={formData.kapasitas}
                onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Harga per Jam (Rp)"
                required
                value={formData.harga_per_jam}
                onChange={(e) => setFormData({ ...formData, harga_per_jam: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : arf.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lokasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kapasitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Harga/Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {arf.map((item) => (
                    <tr key={item.id_arf} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama_arf}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.lokasi}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.kapasitas} slot</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(item.harga_per_jam)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'aktif'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_arf)}
                          className="p-2 hover:bg-red-100 rounded transition text-red-600"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Tidak ada data area parkir
          </div>
        )}
      </div>
    </div>
  );
}
