import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    bookings: 0,
    maintenanceRequests: 0,
    announcements: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) return;

        // Set up axios headers
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch user's bookings
        const bookingsResponse = await axios.get('/api/bookings/my-bookings', config);
        // Fetch user's maintenance requests
        const maintenanceResponse = await axios.get('/api/maintenance/my-requests', config);
        // Fetch announcements
        const announcementsResponse = await axios.get('/api/announcements', config);

        setStats({
          bookings: bookingsResponse.data.length || 0,
          maintenanceRequests: maintenanceResponse.data.length || 0,
          announcements: announcementsResponse.data.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set default values if API calls fail
        setStats({
          bookings: 0,
          maintenanceRequests: 0,
          announcements: 0
        });
      }
    };

    fetchStats();
  }, []);

  const services = [
    {
      title: 'Room Booking',
      description: 'Book study rooms and facilities',
      icon: '🏢',
      path: '/rooms',
      color: 'bg-blue-500',
      count: stats.bookings
    },
    {
      title: 'Maintenance',
      description: 'Report and track maintenance issues',
      icon: '🔧',
      path: '/maintenance',
      color: 'bg-green-500',
      count: stats.maintenanceRequests
    },
    {
      title: 'Announcements',
      description: 'View campus announcements and updates',
      icon: '📢',
      path: '/announcements',
      color: 'bg-yellow-500',
      count: stats.announcements
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
        <p className="text-gray-600">Access all campus services in one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link
            key={service.path}
            to={service.path}
            className="block transform transition-transform hover:scale-105"
          >
            <div className={`${service.color} rounded-lg shadow-lg p-6 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="opacity-90">{service.description}</p>
                </div>
                {service.count > 0 && (
                  <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {service.count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {user?.role === 'admin' && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Admin Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/announcements"
              className="block bg-purple-500 text-white rounded-lg shadow-lg p-6 hover:bg-purple-600 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Create Announcement</h3>
              <p>Post new campus-wide announcements</p>
            </Link>
            <Link
              to="/maintenance"
              className="block bg-orange-500 text-white rounded-lg shadow-lg p-6 hover:bg-orange-600 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Manage Maintenance</h3>
              <p>View and manage maintenance requests</p>
            </Link>
            <Link
              to="/rooms"
              className="block bg-teal-500 text-white rounded-lg shadow-lg p-6 hover:bg-teal-600 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Manage Rooms</h3>
              <p>Add or modify room information</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 