import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuthContext } from './context/AuthContext';
import { UserRole } from './types/user.types';
import { ReactNode } from 'react';
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

const AppRouter = () => {
  const { user } = useAuthContext();

  const defaultPath =
    user?.role === UserRole.AGENT
      ? '/dashboard'
      : user?.role === UserRole.ADMIN
      ? '/admin/dashboard'
      : '/admin/users';

  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/unauthorized" element={<div>403 — Accès refusé</div>} />
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={[UserRole.AGENT]}>
            <div>Agent Dashboard</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute roles={[UserRole.AGENT]}>
            <div>Submit Request</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute roles={[UserRole.AGENT]}>
            <div>My Requests</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <div>All Requests</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests/:id"
        element={
          <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <div>Request Detail</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={[UserRole.SUPER_ADMIN]}>
            <div>Users</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/request-types"
        element={
          <ProtectedRoute roles={[UserRole.SUPER_ADMIN]}>
            <div>Request Types</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
  </BrowserRouter>
);

export default App;