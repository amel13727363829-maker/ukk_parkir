import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export const useProtectedRoute = (requiredRoles?: string[]) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      // Give store time to hydrate from localStorage - increased timeout
      await new Promise(resolve => setTimeout(resolve, 300));

      // If the store hasn't been hydrated yet, try reading persisted auth from localStorage
      // to avoid transient redirects or a stuck loading state.
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
        if (!isAuthenticated && raw) {
          const parsed = JSON.parse(raw) as any;
          const state = parsed?.state;
          if (state?.isAuthenticated) {
            // If persisted state indicates authenticated, allow the route to proceed
            // but don't modify the store here; just stop the checking state.
            setIsChecking(false);
            return;
          }
        }
      } catch (e) {
        console.warn('useProtectedRoute: failed to read persisted auth', e);
      }

      if (!isAuthenticated) {
        router.push('/login');
        setIsChecking(false);
        return;
      }

      if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        router.push('/dashboard');
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, requiredRoles, router]);

  return { isAuthenticated, user, isChecking };
};
