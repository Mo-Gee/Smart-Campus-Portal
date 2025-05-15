import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: ['all'],
    attachments: [],
    expiryDate: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/announcements', formData);
      alert('Announcement created successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        targetAudience: ['all'],
        attachments: [],
        expiryDate: ''
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Here you would typically upload the files to a storage service
    // and get back URLs to store in the formData
    setFormData({
      ...formData,
      attachments: [
        ...formData.attachments,
        ...files.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file)
        }))
      ]
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Announcements</h2>
        {user?.role === 'admin' && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            New Announcement
          </button>
        )}
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Create Announcement</h3>
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
                <label className="block text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Target Audience</label>
                <select
                  multiple
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: Array.from(e.target.selectedOptions, option => option.value)
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="lecturers">Lecturers</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
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
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center text-gray-600">
          No announcements available at this moment.
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3>
                  <p className="text-gray-600">{announcement.content}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    announcement.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : announcement.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {announcement.priority}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="bg-gray-100 px-3 py-1 rounded">
                  {announcement.category}
                </span>
                <span>
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementList; 