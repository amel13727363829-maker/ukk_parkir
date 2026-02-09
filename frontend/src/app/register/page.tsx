'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { authService, RegisterRequest } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { login, setError, error, isLoading, setLoading, clearError } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterRequest & { confirmPassword: string }>({
    mode: 'onBlur',
  });
  const password = watch('password');

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    try {
      clearError();
      
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        setError('Password tidak cocok');
        return;
      }

      setLoading(true);
      const response = await authService.register(data);

      if (response.success) {
        const user = {
          ...response.data.user,
          role: response.data.user.role as 'admin' | 'operator' | 'manager',
        };
        login(user, response.data.token);
        router.push('/dashboard');
      } else {
        setError(response.message || 'Registrasi gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
      console.error('Register error:', err);
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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parkir Plus</h1>
            <p className="text-gray-600">Daftar Akun Baru</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Pendaftaran Gagal</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('nama_lengkap', {
                    required: 'Nama lengkap wajib diisi',
                    minLength: { value: 3, message: 'Nama minimal 3 karakter' },
                  })}
                  type="text"
                  id="nama_lengkap"
                  placeholder="Masukkan nama lengkap"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.nama_lengkap ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                />
              </div>
              {errors.nama_lengkap && (
                <p className="text-red-500 text-sm mt-1">{errors.nama_lengkap.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('username', {
                    required: 'Username wajib diisi',
                    minLength: { value: 3, message: 'Username minimal 3 karakter' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username hanya boleh huruf, angka, dan underscore',
                    },
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email tidak valid',
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="Masukkan email"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="no_telepon" className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon (Opsional)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('no_telepon')}
                  type="tel"
                  id="no_telepon"
                  placeholder="0812345678"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  {...register('confirmPassword', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: (value) =>
                      value === password || 'Password tidak cocok',
                  })}
                  type="password"
                  id="confirmPassword"
                  placeholder="Konfirmasi password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Masuk di sini
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
