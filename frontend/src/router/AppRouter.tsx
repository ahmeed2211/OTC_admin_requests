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
import AgentDashboard from '../pages/agent/agent_dashboard';
import ProfilePage from '../pages/agent/agent_profile';
import UserEdit from '../pages/super_admin/edit_user_page';
import SuperAdminDashboard from '../pages/super_admin/super_admin_dashboard';
import AdminDashboard from '../pages/admin/admin_dashboard';
import RequestDetailPage from '../pages/admin/request_details_page';
import AdminProfilePage from '../pages/admin/admin_profile';
import AuditLogPage from '../pages/super_admin/audit_logs_page';
import UserAuditLogPage from '../pages/super_admin/user_audit_log_page';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

const ComingSoon = ({ name }: { name: string }) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h2>{name}</h2>
    <p>Page en cours de développement.</p>
  </Box>
);

const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  if (isLoading) return <CircularProgress />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};
const RoleRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  if (isLoading) return <CircularProgress />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === UserRole.AGENT) return <Navigate to="/dashboard" replace />;
  if (user?.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === UserRole.SUPER_ADMIN) return <Navigate to="/super-admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const router = createHashRouter([
  {
    element: <Outlet />, 
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage/> },
      { path: '/', element: <RoleRedirect /> },
      {
        element: <ProtectedRoute roles={[UserRole.AGENT]} />,
        children: [
          { path: '/dashboard', element: <AgentDashboard /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/submit', element: <SubmitRequestPage /> },
          { path: '/my-requests', element: <ComingSoon name="Mes demandes" /> },
          { path: '/my-requests/:id', element: <ComingSoon name="Détail de la demande" /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]} />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/requests', element: <AdminDashboard /> },
          { path: '/admin/requests/:id', element: <RequestDetailPage /> },
          { path: '/admin/profile', element: <AdminProfilePage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[UserRole.SUPER_ADMIN]} />,
        children: [
          { path: '/super-admin/dashboard', element: <SuperAdminDashboard /> },
          { path: '/super-admin/users', element: <UsersPage /> },
          { path: '/super-admin/users/new', element: <UserCreate /> },
          { path: '/super-admin/users/:id/edit', element: <UserEdit /> },
          { path: '/super-admin/request-types/new', element: <CreateRequestTypePage /> },
          { path: '/super-admin/request-types', element: <RequestTypesPage /> },
          { path: '/super-admin/request-types/:id', element: <RequestTypeEditPage /> },
          { path: '/super-admin/users/:id/requests', element: <UserRequestsPage /> },
          { path: '/admin/users/:id', element: <UserDetailsPage /> },
          { path: '/super-admin/audit-logs/user/:userId', element: <UserAuditLogPage /> },
          { path: '/super-admin/audit-logs',              element: <AuditLogPage /> },
        ],
      },
      { path: '*', element: <RoleRedirect /> },
    ],
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}