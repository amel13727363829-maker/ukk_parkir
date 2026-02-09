import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if store is hydrated from localStorage
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { isInitialized, isAuthenticated };
};
