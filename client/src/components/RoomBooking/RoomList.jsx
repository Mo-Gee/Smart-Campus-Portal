import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
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
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        roomId: selectedRoom._id,
        ...bookingDetails
      });
      alert('Booking successful!');
      setSelectedRoom(null);
      setBookingDetails({
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: []
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
            <p className="text-gray-600 mb-2">Capacity: {room.capacity} people</p>
            <p className="text-gray-600 mb-2">
              Location: {room.location.building}, Floor {room.location.floor}
            </p>
            <div className="mb-4">
              <h4 className="font-medium mb-1">Facilities:</h4>
              <div className="flex flex-wrap gap-2">
                {room.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedRoom(room)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Book Room
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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