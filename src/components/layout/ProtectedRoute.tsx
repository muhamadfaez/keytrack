import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // Zustand's persist middleware rehydrates asynchronously.
    // We need to wait for rehydration to complete before checking auth state.
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    // If already hydrated, set state immediately
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => {
      unsubscribe();
    };
  }, []);
  if (!isHydrated) {
    // Show a loading spinner or a blank screen while the store is rehydrating
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Outlet />
  );
}