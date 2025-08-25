import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import GenerateVideo from './pages/GenerateVideo';
import VideoHistory from './pages/VideoHistory';
import Profile from './pages/Profile';
import Credits from './pages/Credits';
import AdminPanel from './pages/AdminPanel';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminVideoManagement from './pages/AdminVideoManagement';
import ProtectedRoute from './components/ProtectedRoute';
import ShareVideoPage from './pages/ShareVideoPage';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/videos/:id" element={<ShareVideoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="generate" element={<GenerateVideo />} />
            <Route path="history" element={<VideoHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="credits" element={<Credits />} />
          </Route>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminPanel />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="videos" element={<AdminVideoManagement />} />
            <Route path="profile" element={<Profile isAdmin={true} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;