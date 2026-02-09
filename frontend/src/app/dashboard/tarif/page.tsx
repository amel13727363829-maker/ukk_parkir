'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import axios from 'axios';

interface TarifParkir {
  id_tarif: number;
  id_jenis_parkir: number;
  durasi_jam: number;
  harga: number;
  jenisParkir?: { nama_jenis: string };
}

interface JenisParkir {
  id_jenis_parkir: number;
  nama_jenis: string;
}

export default function TarifPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [tarif, setTarif] = useState<TarifParkir[]>([]);
  const [jenisParkir, setJenisParkir] = useState<JenisParkir[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id_jenis_parkir: '',
    durasi_jam: 1,
    harga: 5000,
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

  const fetchTarif = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tarif-parkir', {
        params: { page, limit: 10 },
      });
      setTarif(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tarif:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchJenisParkir = useCallback(async () => {
    try {
      const response = await apiClient.get('/jenis-parkir', { params: { limit: 100 } });
      setJenisParkir(response.data.data || []);
    } catch (error) {
      console.error('Error fetching jenis parkir:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTarif();
      fetchJenisParkir();
    }
  }, [isAuthenticated, page, fetchTarif, fetchJenisParkir]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/tarif-parkir/${editId}`, formData);
      } else {
        await apiClient.post('/tarif-parkir', formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        id_jenis_parkir: '',
        durasi_jam: 1,
        harga: 5000,
      });
      fetchTarif();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data tarif');
    }
  };

  const handleEdit = (item: TarifParkir) => {
    setFormData({
      id_jenis_parkir: String(item.id_jenis_parkir),
      durasi_jam: item.durasi_jam,
      harga: item.harga,
    });
    setEditId(item.id_tarif);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus?')) {
      try {
        await apiClient.delete(`/tarif-parkir/${id}`);
        fetchTarif();
      } catch (error) {
        console.error('Error deleting tarif:', error);
        alert('Gagal menghapus data tarif');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };

  const getJenisName = (id: number) => {
    return jenisParkir.find((j) => j.id_jenis_parkir === id)?.nama_jenis || '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Manajemen Tarif Parkir</h1>
          <p className="text-gray-600 mt-1">Kelola harga dan tarif parkir</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({
              id_jenis_parkir: '',
              durasi_jam: 1,
              harga: 5000,
            });
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus /> Tambah Tarif
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Tarif Parkir' : 'Tambah Tarif Parkir Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <select
                required
                value={formData.id_jenis_parkir}
                onChange={(e) => setFormData({ ...formData, id_jenis_parkir: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Pilih Jenis Parkir</option>
                {jenisParkir.map((j) => (
                  <option key={j.id_jenis_parkir} value={j.id_jenis_parkir}>
                    {j.nama_jenis}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Durasi (Jam)"
                required
                value={formData.durasi_jam}
                onChange={(e) => setFormData({ ...formData, durasi_jam: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Harga (Rp)"
                required
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
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
        ) : tarif.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Jenis Parkir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tarif.map((item) => (
                    <tr key={item.id_tarif} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.jenisParkir?.nama_jenis || getJenisName(item.id_jenis_parkir)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.durasi_jam} Jam</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(item.harga)}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_tarif)}
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
            Tidak ada data tarif parkir
          </div>
        )}
      </div>
    </div>
  );
}
