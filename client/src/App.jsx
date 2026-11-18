import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import { ProtectedRoute, RoleRoute } from './components/common/ProtectedRoute.jsx';
import StudentLayout from './components/layout/StudentLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';

// Public Pages
import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import NewComplaintPage from './pages/student/NewComplaintPage.jsx';
import MyComplaintsPage from './pages/student/MyComplaintsPage.jsx';
import ComplaintDetailPage from './pages/student/ComplaintDetailPage.jsx';
import NotificationsPage from './pages/student/NotificationsPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';
import SettingsPage from './pages/student/SettingsPage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageComplaintsPage from './pages/admin/ManageComplaintsPage.jsx';
import ReviewQueuePage from './pages/admin/ReviewQueuePage.jsx';
import StaffWorkloadPage from './pages/admin/StaffWorkloadPage.jsx';
import ManageUsersPage from './pages/admin/ManageUsersPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import AdminSettingsPage from './pages/admin/SettingsPage.jsx';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import StaffTasksPage from './pages/staff/StaffTasksPage.jsx';
import StaffSchedulePage from './pages/staff/StaffSchedulePage.jsx';
import StaffPerformancePage from './pages/staff/StaffPerformancePage.jsx';

import { Button } from './components/ui/Button.jsx';
import { Building2, ArrowLeft } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30 // 30 seconds
    }
  }
});

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The campus maintenance page you requested could not be located or may have been moved.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Redirect logged-in users who land on public root or login to their role home
function PublicRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public Website */}
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* 2. Student / Requester Portal */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="new-complaint" element={<NewComplaintPage />} />
                  <Route path="complaints" element={<MyComplaintsPage />} />
                  <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* 3. Administrator Experience */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </RoleRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="complaints" element={<ManageComplaintsPage />} />
                  <Route path="review-queue" element={<ReviewQueuePage />} />
                  <Route path="workload" element={<StaffWorkloadPage />} />
                  <Route path="users" element={<ManageUsersPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* 4. Maintenance Staff Experience */}
                <Route
                  path="/staff"
                  element={
                    <RoleRoute allowedRoles={['staff']}>
                      <StaffLayout />
                    </RoleRoute>
                  }
                >
                  <Route index element={<Navigate to="/staff/dashboard" replace />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="tasks" element={<StaffTasksPage />} />
                  <Route path="schedule" element={<StaffSchedulePage />} />
                  <Route path="performance" element={<StaffPerformancePage />} />
                </Route>

                {/* 5. 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '1rem',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  padding: '12px 18px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
                },
                success: {
                  iconTheme: {
                    primary: '#0d9488',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
