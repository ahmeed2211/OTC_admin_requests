import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { UserRole } from '../types/user.types';
import { CircularProgress, Box } from '@mui/material';
import LoginPage from '../pages/auth/LoginPage';
import UserCreate from '../pages/super_admin/create_user_page';
import UsersPage from '../pages/super_admin/user_management';
import SubmitRequestPage from '../pages/agent/submit_request_page';
import UserRequestsPage from '../pages/super_admin/user_requests_page';
import UserDetailsPage from '../pages/super_admin/user_details_page';
import AdminRequestsPage from '../pages/admin/admin_dashboard';
import RequestTypesPage from '../pages/super_admin/request_types_page';
import RequestTypeEditPage from '../pages/super_admin/request_type_edit_page';
import CreateRequestTypePage from '../pages/super_admin/create_request_type_page';
import SuperAdminDashboard from '../pages/super_admin/super_admin_dashboard';
const ComingSoon = ({ name }: { name: string }) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h2>{name}</h2>
    <p>Page en cours de développement.</p>
  </Box>
);

// Root layout - provides AuthContext to all routes
const Root = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  if (isLoading) return <CircularProgress />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === UserRole.AGENT) return <Navigate to="/dashboard" replace />;
  if (user?.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === UserRole.SUPER_ADMIN) return <Navigate to="/admin/users" replace />;
  return <Navigate to="/login" replace />;
};

const router = createHashRouter([
  {
    element: <Root />,  // AuthProvider wraps everything
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/unauthorized', element: <ComingSoon name="403 - Accès refusé" /> },
      { path: '/', element: <RoleRedirect /> },
      {
        element: <ProtectedRoute roles={[UserRole.AGENT]} />,
        children: [
          { path: '/dashboard', element: <ComingSoon name="Tableau de bord Agent" /> },
          { path: '/submit', element: <SubmitRequestPage/> },
          { path: '/my-requests', element: <ComingSoon name="Mes demandes" /> },
          { path: '/my-requests/:id', element: <ComingSoon name="Détail de la demande" /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]} />,
        children: [
          { path: '/admin/dashboard', element: <ComingSoon name="Tableau de bord Admin" /> },
          { path: '/admin/requests', element: <AdminRequestsPage /> },
          { path: '/admin/requests/:id', element: <ComingSoon name="Détail de la demande" /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[UserRole.SUPER_ADMIN]} />,
        children: [
          { path: '/super-admin/dashboard', element: <SuperAdminDashboard /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/users/new', element: <UserCreate /> },
          { path: '/admin/users/:id/edit', element: <RequestTypesPage/> },
          { path: '/admin/request-types', element: <RequestTypesPage /> },
          { path: '/admin/request-types/new', element: <CreateRequestTypePage /> },
          { path: '/super-admin/request-types/:id', element: <RequestTypeEditPage /> },
          { path: '/admin/users/:id/requests', element: <UserRequestsPage /> },
          { path: '/admin/users/:id', element: <UserDetailsPage /> }
        ],
      },
      { path: '*', element: <RoleRedirect /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}