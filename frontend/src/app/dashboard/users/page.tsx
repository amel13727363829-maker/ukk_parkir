'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLock } from 'react-icons/fi';
import axios from 'axios';

interface User {
  id_user: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const { isAuthenticated } = useProtectedRoute();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nama_lengkap: '',
    role: 'operator',
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users', {
        params: { page, limit: 10, search },
      });
      setUsers(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof axios.AxiosError && error.response?.status === 403) {
        alert('Anda tidak memiliki akses untuk mengelola pengguna (Admin only)');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, page, search, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // nama_lengkap hidden dari user tapi required di backend - set ke username
      const submitData = editId ? 
        { username: formData.username, email: formData.email, nama_lengkap: formData.username, role: formData.role } :
        { username: formData.username, email: formData.email, nama_lengkap: formData.username, password: formData.password, role: formData.role };

      if (editId) {
        await apiClient.put(`/users/${editId}`, submitData);
      } else {
        await apiClient.post('/users', submitData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        nama_lengkap: '',
        role: 'petugas',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data pengguna');
    }
  };

  const handleEdit = (item: User) => {
    setFormData({
      username: item.username,
      email: item.email,
      password: '',
      nama_lengkap: item.username, // Use username as fallback for display
      role: item.role,
    });
    setEditId(item.id_user);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await apiClient.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Gagal menghapus pengguna');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'petugas':
        return 'bg-green-100 text-green-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola akun pengguna sistem (Admin Only)</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({
              username: '',
              email: '',
              password: '',
              nama_lengkap: '',
              role: 'petugas',
            });
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus /> Tambah Pengguna
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari username atau email..."
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
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Pengguna' : 'Tambah User Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Username - top right */}
                <div className="col-span-1 order-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Email - bottom left */}
                <div className="col-span-1 order-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Role - top right */}
                <div className="col-span-1 order-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="petugas">Petugas</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                {/* Password */}
                {!editId && (
                  <div className="col-span-1 order-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {editId && (
                <div className="mt-6 bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-700">💡 Kosongkan password untuk tidak mengubahnya</p>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-8">
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
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dibuat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((item) => (
                    <tr key={item.id_user} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item.role)}`}
                        >
                          {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_user)}
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
            Tidak ada data pengguna
          </div>
        )}
      </div>
    </div>
  );
}
