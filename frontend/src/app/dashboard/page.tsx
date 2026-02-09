'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useProtectedRoute();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Redirect ke dashboard sesuai role
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'operator':
          router.push('/dashboard/petugas');
          break;
        case 'manager':
          // Manager -> manager dashboard (future)
          router.push('/dashboard/manager');
          break;
        case 'owner':
          // Owner -> owner dashboard
          router.push('/dashboard/owner');
          break;
        case 'petugas':
          // Petugas -> petugas dashboard
          router.push('/dashboard/petugas');
          break;
        default:
          // Fallback untuk role yang tidak dikenal
          router.push('/login');
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return <LoadingSpinner />;
}
