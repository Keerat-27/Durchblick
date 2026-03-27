import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="size-12 animate-pulse rounded-2xl border-2 border-[var(--duo-border)] bg-card shadow-[0_4px_0_0_var(--duo-border)]"
          role="status"
          aria-label="Laden"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
