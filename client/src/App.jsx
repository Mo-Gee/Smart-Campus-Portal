// Import necessary dependencies from libraries
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // Import CSS styles for the application
import Layout from './Layout'; // Import layout component that wraps the application
import axios from 'axios'; // Import axios for HTTP requests
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomList from './components/Rooms/RoomList';
import MaintenanceRequest from './components/Maintenance/MaintenanceRequest';
import AnnouncementList from './components/Announcements/AnnouncementList';
import Dashboard from './pages/Dashboard';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'; // Set the base URL for all API requests
axios.defaults.withCredentials = true; // Enable sending cookies with cross-origin requests

// Add request interceptor to add auth token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Protected Route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

/**
 * Main App component that defines the routing structure of the application
 * Uses React Router v6 for client-side routing
 * @returns {JSX.Element} The application with configured routes
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="maintenance" element={<MaintenanceRequest />} />
          <Route path="announcements" element={<AnnouncementList />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; // Export the App component as the default export
