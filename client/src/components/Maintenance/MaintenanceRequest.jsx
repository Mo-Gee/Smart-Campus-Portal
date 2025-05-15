import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      building: '',
      floor: '',
      roomNumber: ''
    },
    priority: 'medium',
    images: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/maintenance/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/maintenance', formData);
      alert('Maintenance request submitted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: {
          building: '',
          floor: '',
          roomNumber: ''
        },
        priority: 'medium',
        images: []
      });
      fetchRequests();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert('Failed to submit maintenance request. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Here you would typically upload the images to a storage service
    // and get back URLs to store in the formData
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map(file => URL.createObjectURL(file))]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Maintenance Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          New Request
        </button>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Submit Maintenance Request</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Building</label>
                  <input
                    type="text"
                    value={formData.location.building}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, building: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.location.floor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, floor: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.location.roomNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, roomNumber: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-6">
        {requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{request.title}</h3>
                <p className="text-gray-600">
                  Location: {request.location.building}, Floor {request.location.floor}, Room{' '}
                  {request.location.roomNumber}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  request.priority === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : request.priority === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : request.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {request.priority}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{request.description}</p>
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded text-sm ${
                  request.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : request.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : request.status === 'cancelled'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {request.status}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceRequest; 