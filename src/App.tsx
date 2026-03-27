import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';
import { DashboardApp } from '@/views/dashboard-app';

function AuthRouteSpinner() {
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

function LoginRoute() {
  const { user, status } = useAuth();
  if (status === 'loading') {
    return <AuthRouteSpinner />;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

function RegisterRoute() {
  const { user, status } = useAuth();
  if (status === 'loading') {
    return <AuthRouteSpinner />;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <RegisterPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
