'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { authService, LoginRequest } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, setError, error, isLoading, setLoading, clearError } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      clearError();
      setLoading(true);
      const response = await authService.login(data);

      if (response.success) {
        const user = {
          ...response.data.user,
          role: response.data.user.role as 'admin' | 'operator' | 'manager' | 'owner' | 'petugas',
        };
        login(user, response.data.token);
        // Redirect based on role
        const dashboardUrl = '/dashboard';
        router.push(dashboardUrl);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parkir Plus</h1>
            <p className="text-gray-600">Sistem Manajemen Parkir Modern</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Login Gagal</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('username', {
                    required: 'Username wajib diisi',
                    minLength: { value: 3, message: 'Username minimal 3 karakter' },
                  })}
                  type="text"
                  id="username"
                  placeholder="Masukkan username"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: { value: 6, message: 'Password minimal 6 karakter' },
                  })}
                  type="password"
                  id="password"
                  placeholder="Masukkan password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Sedang login...' : 'Masuk'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>© 2026 Parkir Plus. Semua hak dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
