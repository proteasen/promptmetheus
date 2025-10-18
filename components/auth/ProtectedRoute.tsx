'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else if (!isLoading && requireAdmin && !user?.isAdmin) {
      // Redirect to home if not admin but admin is required
      router.push('/');
    }
  }, [user, isLoading, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (requireAdmin && !user.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
