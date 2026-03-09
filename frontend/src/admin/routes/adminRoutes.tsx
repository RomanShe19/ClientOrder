import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';

const LoginPage = lazy(() => import('../pages/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Register').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const LeadsPage = lazy(() => import('../pages/Leads').then((m) => ({ default: m.LeadsPage })));
const AdminsPage = lazy(() => import('../pages/Admins').then((m) => ({ default: m.AdminsPage })));
const SettingsPage = lazy(() => import('../pages/Settings').then((m) => ({ default: m.SettingsPage })));

const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

export const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
