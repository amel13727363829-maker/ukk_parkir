'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import axios from 'axios';

interface JenisParkir {
  id_jenis_parkir: number;
  nama_jenis: string;
  deskripsi: string;
  kapasitas?: number;
  harga_per_jam?: number;
  harga_awal?: number;
}

export default function JenisParkirPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [jenisParkir, setJenisParkir] = useState<JenisParkir[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_jenis: '',
    deskripsi: '',
    kapasitas: 0,
    harga_per_jam: 0,
    harga_awal: 0,
  });

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });

  apiClient.interceptors.request.use((config) => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // support multiple persisted shapes: direct token, { token }, { state: { token } }
        const tokenValue = parsed?.token ?? parsed?.state?.token ?? parsed?.auth?.token ?? parsed;
        if (typeof tokenValue === 'string' && tokenValue.length > 0) {
          config.headers.Authorization = `Bearer ${tokenValue}`;
        }
      } catch (error) {
        // fallback: raw string
        if (typeof raw === 'string' && raw.length > 0) {
          config.headers.Authorization = `Bearer ${raw}`;
        }
      }
    }
    return config;
  });

  const fetchJenisParkir = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/jenis-parkir', {
        params: { page, limit: 10, search },
      });
      setJenisParkir(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jenis parkir:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJenisParkir();
    }
  }, [isAuthenticated, page, search, fetchJenisParkir]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const resp = await apiClient.put(`/jenis-parkir/${editId}`, formData);
        console.log('PUT response:', resp);
      } else {
        const resp = await apiClient.post('/jenis-parkir', formData);
        console.log('POST response:', resp);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        nama_jenis: '',
        deskripsi: '',
        kapasitas: 0,
        harga_per_jam: 0,
        harga_awal: 0,
      });
      fetchJenisParkir();
      alert('Simpan berhasil');
    } catch (error) {
      console.error('Error submitting form:', error);
      // show more details when possible
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server responded:', error.response.status, error.response.data);
        alert('Gagal menyimpan: ' + (error.response.data?.message || error.response.status));
      } else {
        alert('Gagal menyimpan data jenis parkir');
      }
    }
  };

  const handleEdit = (item: JenisParkir) => {
    setFormData({
      nama_jenis: item.nama_jenis,
      deskripsi: item.deskripsi,
      kapasitas: item.kapasitas || 0,
      harga_per_jam: item.harga_per_jam || 0,
      harga_awal: item.harga_awal || 0,
    });
    setEditId(item.id_jenis_parkir);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus?')) {
      try {
        await apiClient.delete(`/jenis-parkir/${id}`);
        fetchJenisParkir();
      } catch (error) {
        console.error('Error deleting jenis parkir:', error);
        alert('Gagal menghapus data jenis parkir');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📑 Manajemen Jenis Parkir</h1>
          <p className="text-gray-600 mt-1">Kelola kategori dan jenis parkir</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({
              nama_jenis: '',
              deskripsi: '',
              kapasitas: 0,
              harga_per_jam: 0,
              harga_awal: 0,
            });
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus /> Tambah Jenis
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari jenis parkir..."
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
                {editId ? 'Edit Jenis Parkir' : 'Tambah Jenis Parkir Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Jenis *</label>
                <input
                  type="text"
                  placeholder="Contoh: Parkir Motor"
                  required
                  value={formData.nama_jenis}
                  onChange={(e) => setFormData({ ...formData, nama_jenis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi singkat jenis parkir"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kapasitas (slot) *</label>
                <input
                  type="number"
                  placeholder="Contoh: 100"
                  required
                  value={formData.kapasitas}
                  onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tarif Awal (Rp) *</label>
                <input
                  type="number"
                  placeholder="Contoh: 2000"
                  required
                  value={formData.harga_awal}
                  onChange={(e) => setFormData({ ...formData, harga_awal: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tarif Per Jam (Rp) *</label>
                <input
                  type="number"
                  placeholder="Contoh: 2000"
                  required
                  value={formData.harga_per_jam}
                  onChange={(e) => setFormData({ ...formData, harga_per_jam: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
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
        ) : jenisParkir.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kapasitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tarif Awal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tarif/Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jenisParkir.map((item) => (
                    <tr key={item.id_jenis_parkir} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama_jenis}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.deskripsi}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.kapasitas || 0} slot</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Rp {(item.harga_awal || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Rp {(item.harga_per_jam || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_jenis_parkir)}
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
            Tidak ada data jenis parkir
          </div>
        )}
      </div>
    </div>
  );
}
