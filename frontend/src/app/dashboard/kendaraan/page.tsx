'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import Link from 'next/link';

interface Kendaraan {
  id_kendaraan: number;
  no_polisi: string;
  jenis_kendaraan: string;
  warna: string;
  tahun_pembuatan: number;
  tipe_kendaraan: string;
}

export default function KendaraanPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    no_polisi: '',
    jenis_kendaraan: 'mobil',
    warna: '',
    tahun_pembuatan: new Date().getFullYear(),
    tipe_kendaraan: '',
  });

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
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

  const fetchKendaraan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/kendaraan', {
        params: { page, limit: 10, search },
      });
      setKendaraan(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching kendaraan:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchKendaraan();
    }
  }, [isAuthenticated, page, search, fetchKendaraan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/kendaraan/${editId}`, formData);
      } else {
        await apiClient.post('/kendaraan', formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        no_polisi: '',
        jenis_kendaraan: 'mobil',
        warna: '',
        tahun_pembuatan: new Date().getFullYear(),
        tipe_kendaraan: '',
      });
      fetchKendaraan();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data kendaraan');
    }
  };

  const handleEdit = (item: Kendaraan) => {
    setFormData({
      no_polisi: item.no_polisi,
      jenis_kendaraan: item.jenis_kendaraan,
      warna: item.warna,
      tahun_pembuatan: item.tahun_pembuatan,
      tipe_kendaraan: item.tipe_kendaraan,
    });
    setEditId(item.id_kendaraan);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus?')) {
      try {
        await apiClient.delete(`/kendaraan/${id}`);
        fetchKendaraan();
      } catch (error) {
        console.error('Error deleting kendaraan:', error);
        alert('Gagal menghapus data kendaraan');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚗 Manajemen Kendaraan</h1>
          <p className="text-gray-600 mt-1">Kelola data kendaraan parkir</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({
              no_polisi: '',
              jenis_kendaraan: 'mobil',
              warna: '',
              tahun_pembuatan: new Date().getFullYear(),
              tipe_kendaraan: '',
            });
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus /> Tambah Kendaraan
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari plat nomor..."
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
                {editId ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Plat Nomor"
                required
                value={formData.no_polisi}
                onChange={(e) => setFormData({ ...formData, no_polisi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={formData.jenis_kendaraan}
                onChange={(e) => setFormData({ ...formData, jenis_kendaraan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="mobil">Mobil</option>
                <option value="motor">Motor</option>
                <option value="truk">Truk</option>
                <option value="bus">Bus</option>
              </select>
              <input
                type="text"
                placeholder="Warna"
                value={formData.warna}
                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Tahun Pembuatan"
                value={formData.tahun_pembuatan}
                onChange={(e) => setFormData({ ...formData, tahun_pembuatan: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Tipe Kendaraan (e.g., Toyota Avanza)"
                value={formData.tipe_kendaraan}
                onChange={(e) => setFormData({ ...formData, tipe_kendaraan: e.target.value })}
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
        ) : kendaraan.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Plat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {kendaraan.map((item) => (
                    <tr key={item.id_kendaraan} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.no_polisi}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{item.jenis_kendaraan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.tipe_kendaraan}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_kendaraan)}
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
            Tidak ada data kendaraan
          </div>
        )}
      </div>
    </div>
  );
}
