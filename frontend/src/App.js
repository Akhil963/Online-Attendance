import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutWrapper from './components/LayoutWrapper';

// Pages
import AuthSelectionPage from './pages/AuthSelectionPage';
import LoginPage from './pages/LoginPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeSignupPage from './pages/EmployeeSignupPage';
import AdminSignupPage from './pages/AdminSignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RealtimeDashboard from './pages/RealtimeDashboard';
import ProfilePage from './pages/ProfilePage';
import DepartmentInfoPage from './pages/DepartmentInfoPage';
import NoticesPage from './pages/NoticesPage';
import LeavesPage from './pages/LeavesPage';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import AttendanceReportPage from './pages/AttendanceReportPage';
import LeaveBalancePage from './pages/LeaveBalancePage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import HolidayManagementPage from './pages/HolidayManagementPage';
import NoticeManagementPage from './pages/NoticeManagementPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';
import UnplannedLeaveManagementPage from './pages/UnplannedLeaveManagementPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminEmployeeApprovalPage from './pages/AdminEmployeeApprovalPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SpeedInsights />
      <AuthProvider>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/employee" element={<EmployeeLoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/employee" element={<EmployeeSignupPage />} />
          <Route path="/signup/admin" element={<AdminSignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/admin" element={<AdminForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <DashboardPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <AdminDashboardPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/realtime-dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <RealtimeDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <ProfilePage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department-info"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <DepartmentInfoPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <NoticesPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <LeavesPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />

          {/* Enhanced Admin Routes */}
          <Route
            path="/admin/enhanced-dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <EnhancedAdminDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <EmployeeManagementPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employee-approval"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <AdminEmployeeApprovalPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance-report"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <AttendanceReportPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-balance"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <LeaveBalancePage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <DepartmentManagementPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/holidays"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <HolidayManagementPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/performance"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <PerformanceAnalyticsPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <NoticeManagementPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/unplanned-leave"
            element={
              <ProtectedRoute requiredRoles={['admin', 'director']}>
                <LayoutWrapper>
                  <UnplannedLeaveManagementPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
        />
        <SpeedInsights />
        <Analytics />
      </AuthProvider>
    </Router>
  );
}

export default App;
