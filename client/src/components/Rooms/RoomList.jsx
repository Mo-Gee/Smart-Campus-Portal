import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rooms', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRooms(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to book a room');
      return;
    }

    try {
      // Convert datetime-local values to ISO strings
      const bookingData = {
        roomId: selectedRoom._id,
        startTime: new Date(bookingDetails.startTime).toISOString(),
        endTime: new Date(bookingDetails.endTime).toISOString(),
        purpose: bookingDetails.purpose,
        attendees: bookingDetails.attendees
      };

      await axios.post('/api/bookings', bookingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      alert('Booking successful!');
      setSelectedRoom(null);
      setBookingDetails({
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: []
      });
      // Refresh rooms to update status
      fetchRooms();
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      alert(errorMessage);
    }
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
      <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
      {rooms.length === 0 ? (
        <div className="text-center text-gray-600">
          No rooms available at this moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Capacity: {room.capacity} people
                </span>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Facilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    room.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : room.status === 'booked'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {room.status}
                </span>
                {user && room.status === 'available' && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setSelectedRoom(room)}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Book {selectedRoom.name}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={bookingDetails.startTime}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, startTime: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={bookingDetails.endTime}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, endTime: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Purpose</label>
                <textarea
                  value={bookingDetails.purpose}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, purpose: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                  placeholder="Please describe the purpose of your booking"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList; 